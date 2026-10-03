import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CATALOGUE_FILES, generateStaticAssets } from './generate-static-assets';

const roots: string[] = [];

afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture() {
    const root = mkdtempSync(path.join(tmpdir(), 'exfil-assets-'));
    roots.push(root);
    mkdirSync(path.join(root, 'public/data'), { recursive: true });
    mkdirSync(path.join(root, 'public/images/items'), { recursive: true });
    writeFileSync(path.join(root, 'public/images/items/test.webp'), 'image-v1');
    for (const filename of CATALOGUE_FILES) {
        writeFileSync(path.join(root, 'public/data', filename), JSON.stringify([{
            id: filename, name: filename, images: { icon: '/images/items/test.webp' },
        }]));
    }
    writeFileSync(path.join(root, 'public/data/tasks.json'), '{"tasks":{}}');
    return root;
}

describe('published static assets', () => {
    it('combines every category without changing sources and versions its referenced image', () => {
        const root = fixture();
        const manifest = generateStaticAssets(root);
        const readAsset = (url: string) => readFileSync(path.join(root, 'public', url), 'utf8');
        const catalogue = JSON.parse(readAsset(manifest['catalogue.json']));
        expect(catalogue.map((item: { id: string }) => item.id)).toEqual(CATALOGUE_FILES);
        expect(catalogue[0].images.icon).toMatch(/^\/assets\/items\/test\.[a-f0-9]{64}\.webp$/);
        expect(readAsset(catalogue[0].images.icon)).toBe('image-v1');
        expect(readFileSync(path.join(root, 'public/data/weapons.json'), 'utf8')).toContain('/images/items/test.webp');
        expect(JSON.parse(readAsset(manifest['weapons.json']))).toEqual([catalogue[0]]);
        expect(generateStaticAssets(root)).toEqual(manifest);
    });

    it('invalidates only changed data and follows image changes through dependent JSON', () => {
        const root = fixture();
        const first = generateStaticAssets(root);
        writeFileSync(path.join(root, 'public/data/tasks.json'), '{"tasks":{"new":{}}}');
        const second = generateStaticAssets(root);
        expect(second['tasks.json']).not.toBe(first['tasks.json']);
        expect(second['catalogue.json']).toBe(first['catalogue.json']);

        writeFileSync(path.join(root, 'public/images/items/test.webp'), 'image-v2');
        const third = generateStaticAssets(root);
        expect(third['catalogue.json']).not.toBe(second['catalogue.json']);
        expect(third['weapons.json']).not.toBe(second['weapons.json']);
        expect(third['tasks.json']).toBe(second['tasks.json']);
        // Retained hashed files are never overwritten with different bytes.
        expect(readFileSync(path.join(root, 'public', first['catalogue.json']), 'utf8')).not.toBe(
            readFileSync(path.join(root, 'public', third['catalogue.json']), 'utf8'),
        );
    });

    it('fails generation on missing images or malformed categories', () => {
        const root = fixture();
        writeFileSync(path.join(root, 'public/data/weapons.json'), '[{"images":{"icon":"/images/items/missing.webp"}}]');
        expect(() => generateStaticAssets(root)).toThrow();
        writeFileSync(path.join(root, 'public/data/weapons.json'), '{}');
        expect(() => generateStaticAssets(root)).toThrow('Expected an item array in weapons.json');
    });
});
