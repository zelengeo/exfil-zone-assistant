import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Keep the source categories separate for extraction and validation. Only the published
// catalogue is combined; its order matches ItemService's original category order.
export const CATALOGUE_FILES = [
    'weapons.json', 'ammunition.json', 'magazines.json', 'attachments.json',
    'grenades.json', 'armor.json', 'helmets.json', 'face-shields.json',
    'backpacks.json', 'holsters.json', 'medical.json', 'provisions.json',
    'task-items.json', 'keys.json', 'misc.json', 'containers.json', 'paints.json',
];

/** Content-addressed files must never change in place, including across unrelated deploys. */
export function generateStaticAssets(root: string): Record<string, string> {
    const publicDir = path.join(root, 'public');
    const outputDir = path.join(publicDir, 'assets');
    const manifest: Record<string, string> = {};
    const images = new Map<string, string>();
    const data = new Map<string, unknown>();

    function publish(folder: string, filename: string, bytes: Buffer | string): string {
        const hash = createHash('sha256').update(bytes).digest('hex');
        const extension = path.extname(filename);
        const name = `${path.basename(filename, extension)}.${hash}${extension}`;
        const directory = path.join(outputDir, folder);
        mkdirSync(directory, { recursive: true });
        const destination = path.join(directory, name);
        // Avoid changing mtimes on every development startup.
        try {
            if (readFileSync(destination).equals(Buffer.from(bytes))) return `/assets/${folder}/${name}`;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
        writeFileSync(destination, bytes);
        return `/assets/${folder}/${name}`;
    }

    function versionImage(_key: string, value: unknown): unknown {
        if (typeof value !== 'string' || !value.startsWith('/images/items/')) return value;
        const cached = images.get(value);
        if (cached) return cached;
        const source = path.resolve(publicDir, `.${value}`);
        const imageRoot = path.join(publicDir, 'images', 'items') + path.sep;
        if (!source.startsWith(imageRoot)) throw new Error(`Invalid item image path: ${value}`);
        const url = publish('items', path.basename(source), readFileSync(source));
        images.set(value, url);
        return url;
    }

    for (const filename of readdirSync(path.join(publicDir, 'data')).sort()) {
        if (!filename.endsWith('.json')) continue;
        const parsed: unknown = JSON.parse(readFileSync(path.join(publicDir, 'data', filename), 'utf8'), versionImage);
        data.set(filename, parsed);
        manifest[filename] = publish('data', filename, JSON.stringify(parsed));
    }

    const catalogue = CATALOGUE_FILES.flatMap(filename => {
        const rows = data.get(filename);
        if (!Array.isArray(rows)) throw new Error(`Expected an item array in ${filename}`);
        return rows;
    });
    manifest['catalogue.json'] = publish('data', 'catalogue.json', JSON.stringify(catalogue));

    const manifestPath = path.join(root, 'src', 'services', 'generated', 'data-assets.json');
    mkdirSync(path.dirname(manifestPath), { recursive: true });
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const manifest = generateStaticAssets(process.cwd());
    console.log(`Generated ${Object.keys(manifest).length} versioned data assets and their item images.`);
}
