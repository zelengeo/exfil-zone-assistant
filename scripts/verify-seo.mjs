import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';

// Run against `next start`; sitemap URLs stay production canonicals while requests use loopback.
const origin = new URL(process.argv[2] || 'http://127.0.0.1:3001');
assert(['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname), 'Use a local production server');
const production = 'https://www.exfil-zone-assistant.app';

function attributes(tag) {
    return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
}

function metadata(html, name) {
    return [...html.matchAll(/<meta\b[^>]*>/g)].map(match => attributes(match[0]))
        .filter(attrs => attrs.name === name || attrs.property === name).map(attrs => attrs.content);
}

function canonical(html) {
    return [...html.matchAll(/<link\b[^>]*>/g)].map(match => attributes(match[0]))
        .filter(attrs => attrs.rel === 'canonical').map(attrs => attrs.href);
}

async function request(path) {
    const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(30000) });
    return { response, html: await response.text() };
}

const sitemap = await request('/sitemap.xml');
assert.equal(sitemap.response.status, 200);
const entries = [...sitemap.html.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, xml]) => ({
    url: xml.match(/<loc>(.*?)<\/loc>/)?.[1],
    date: xml.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
}));
assert(entries.length > 0, 'Sitemap must contain URLs');
assert.equal(new Set(entries.map(entry => entry.url)).size, entries.length);
const failures = [];
const titles = new Map();
const descriptions = new Map();
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < entries.length) {
        const entry = entries[cursor++];
        try {
            const url = new URL(entry.url);
            assert.equal(url.origin, production);
            assert.equal(url.search, '');
            const { response, html } = await request(url.pathname);
            assert.equal(response.status, 200, `HTTP ${response.status}`);
            assert.deepEqual(canonical(html), [entry.url]);
            assert(!metadata(html, 'robots').some(value => value.includes('noindex')), 'Unexpected noindex');
            const details = /^\/(items|tasks|guides)\//.test(url.pathname);
            if (details) {
                assert.match(html, /<h1\b[^>]*>.+?<\/h1>/s, 'Missing server-rendered heading');
                assert(metadata(html, 'description')[0], 'Missing description');
                const data = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
                    .map(match => JSON.parse(match[1]));
                const breadcrumb = data.find(value => value['@type'] === 'BreadcrumbList');
                assert.equal(breadcrumb?.itemListElement.at(-1)?.item, entry.url);
                if (url.pathname.startsWith('/items/')) {
                    assert.match(html, />Weight</);
                    assert.match(html, />Description</);
                    assert.match(html, /<img\b/);
                }
                if (url.pathname.startsWith('/guides/')) {
                    const article = data.find(value => value['@type'] === 'Article');
                    assert.equal(article?.url, entry.url);
                    assert.equal(article.dateModified, entry.date?.slice(0, 10));
                    assert.equal(article.datePublished, metadata(html, 'article:published_time')[0]);
                    assert.equal(article.dateModified, metadata(html, 'article:modified_time')[0]);
                    assert.equal(article.image[0], metadata(html, 'og:image')[0]);
                }
                if (url.pathname.startsWith('/tasks/')) {
                    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
                    const description = metadata(html, 'description')[0];
                    assert(title && !titles.has(title), `Duplicate title: ${title}`);
                    assert(!descriptions.has(description), `Duplicate description: ${description}`);
                    titles.set(title, entry.url);
                    descriptions.set(description, entry.url);
                }
            }
            if (url.pathname === '/items') {
                const links = [...html.matchAll(/href="\/items\/[^"?]+"/g)];
                assert(links.length >= 40 && links.length < 100, `Unexpected initial item links: ${links.length}`);
                console.log(`/items: ${links.length} item links; ${Buffer.byteLength(html)} bytes HTML; ${gzipSync(html).length} bytes gzip`);
            }
        } catch (error) {
            failures.push(`${entry.url}: ${error.message}`);
        }
    }
}));

for (const path of ['/items?category=ammo', '/tasks?vendor=ark', '/gunsmith?b=invalid', '/guides?tag=combat']) {
    const { response, html } = await request(path);
    assert.equal(response.status, 200);
    assert.deepEqual(canonical(html), [`${production}${path.split('?')[0]}`]);
}
for (const path of ['/items/__unknown__', '/tasks/__unknown__', '/guides/__unknown__']) {
    assert.equal((await request(path)).response.status, 404, `${path} must return 404`);
}
for (const path of ['/auth/signin', '/auth/error', '/admin', '/dashboard', '/unauthorized', '/goodbye', '/combat-sim/debug']) {
    const { response, html } = await request(path);
    assert.equal(response.status, 200, `${path} or its sign-in redirect must be accessible`);
    assert(metadata(html, 'robots').some(value => value.includes('noindex')), `${path} must be noindex`);
    assert(!metadata(html, 'googlebot').some(value => /(^|,\s*)index(,|$)/.test(value)), `${path} inherits Googlebot index`);
}
assert.deepEqual(failures, [], failures.join('\n'));
console.log(`SEO crawl passed: ${entries.length} sitemap URLs, query canonicals, detail 404s and non-content noindex.`);
