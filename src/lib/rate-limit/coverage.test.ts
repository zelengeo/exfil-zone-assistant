/**
 * Every externally callable backend entry point carries a rate-limit policy.
 *
 * This is a source scan rather than a request test on purpose: the failure it guards against is a
 * *new* route or server action shipping without a policy, which no test of the existing routes can
 * catch. It reads the tree, so adding a handler is enough to be covered by it.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { RATE_LIMIT_CONFIGS } from '@/lib/rate-limit/rate-limit';

const API_ROOT = join(process.cwd(), 'src', 'app', 'api');
const APP_ROOT = join(process.cwd(), 'src', 'app');

const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const;

/** Reached through the limiter directly to avoid an import cycle with authOptions. */
const LIMITS_ITSELF = new Set(['api/auth/[...nextauth]/route.ts']);

function walk(root: string, match: (path: string) => boolean): string[] {
    const found: string[] = [];

    const visit = (dir: string) => {
        for (const entry of readdirSync(dir)) {
            const path = join(dir, entry);
            if (statSync(path).isDirectory()) {
                visit(path);
            } else if (match(path)) {
                found.push(path);
            }
        }
    };

    visit(root);
    return found;
}

function relative(path: string): string {
    return path.slice(APP_ROOT.length + 1).replaceAll('\\', '/');
}

/**
 * The policy is the call's last argument, so the call has to be read to its matching close paren —
 * a plain regex happily runs past the end of the call and picks up an unrelated string literal.
 */
function policyArguments(source: string, call: string): string[] {
    const found: string[] = [];
    let index = source.indexOf(call);

    while (index !== -1) {
        let depth = 0;
        let end = index + call.length - 1;

        for (; end < source.length; end++) {
            if (source[end] === '(') depth++;
            if (source[end] === ')') {
                depth--;
                if (depth === 0) break;
            }
        }

        const args = source.slice(index + call.length, end);
        // Both quote styles appear in the tree: one admin route closes with `}, "admin")`.
        const literals = [...args.matchAll(/['"]([a-zA-Z]+)['"]/g)];
        const last = literals.at(-1);
        if (last) {
            found.push(last[1]);
        }

        index = source.indexOf(call, end);
    }

    return found;
}

function exportedMethods(source: string): string[] {
    return HTTP_METHODS.filter(method => (
        new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\b`).test(source)
        || new RegExp(`export\\s*\\{[^}]*\\b(as\\s+)?${method}\\b`).test(source)
    ));
}

describe('rate-limit coverage', () => {
    const routeFiles = walk(API_ROOT, path => path.endsWith('route.ts') && !path.endsWith('.test.ts'));

    it('finds the API routes to check', () => {
        expect(routeFiles.length).toBeGreaterThan(5);
    });

    it.each(routeFiles.map(path => [relative(path), path]))(
        '%s applies a rate-limit policy',
        (name, path) => {
            const source = readFileSync(path, 'utf8');

            expect(exportedMethods(source).length).toBeGreaterThan(0);

            if (LIMITS_ITSELF.has(name)) {
                expect(source).toContain('getRateLimiter');
                return;
            }

            expect(source).toContain('withRateLimit');
        },
    );

    it('every server action file enforces a policy', () => {
        const actionFiles = walk(APP_ROOT, path => path.endsWith('actions.ts'))
            .filter(path => readFileSync(path, 'utf8').includes("'use server'"));

        // A server action is a POST endpoint with a generated URL, not an internal call.
        expect(actionFiles.length).toBeGreaterThan(0);

        for (const path of actionFiles) {
            const source = readFileSync(path, 'utf8');
            const exported = (source.match(/export\s+async\s+function\s+\w+/g) ?? []).length;
            const enforced = (source.match(/enforceRateLimit\(/g) ?? []).length;

            expect(enforced, `${relative(path)} enforces a policy per exported action`)
                .toBeGreaterThanOrEqual(exported);
        }
    });

    it('every policy a handler names exists in RATE_LIMIT_CONFIGS', () => {
        const known = new Set(Object.keys(RATE_LIMIT_CONFIGS));
        const named = new Set<string>();

        for (const path of [...routeFiles, ...walk(APP_ROOT, p => p.endsWith('actions.ts'))]) {
            const source = readFileSync(path, 'utf8');
            for (const call of ['withRateLimit(', 'enforceRateLimit(']) {
                for (const policy of policyArguments(source, call)) {
                    named.add(policy);
                }
            }
        }

        expect(named.size).toBeGreaterThan(0);
        for (const policy of named) {
            expect(known, `policy '${policy}' is not defined`).toContain(policy);
        }
    });
});
