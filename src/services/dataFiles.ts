/**
 * The one way `public/data/*.json` reaches the app.
 *
 * These files are static assets. The browser gets them from the CDN, compressed and cached across
 * navigations, and they stay out of the JavaScript entirely. Importing them instead - as
 * `import('@/public/data/weapons.json')` - makes the bundler inline the very same bytes into a JS
 * chunk, which is how the database came to ship twice: 2.0 MB of it as `JSON.parse()` calls spread
 * over 16 client chunks, on top of the copies already sitting in `/data/`. Nothing was gained for
 * it either, since the pages that read this data all suspend and the prerendered HTML carries only
 * the loading fallback. Every reader goes through `loadDataFile` instead.
 *
 * The server has no origin to fetch a relative URL from during prerender, so it reads the same file
 * off disk. `node:fs` sits behind a dynamic import in a branch the browser never takes, so it never
 * enters the client bundle; `next.config.ts` traces `public/data` into the function bundle so the
 * read also works at runtime, where Next does not ship `public/` by default.
 */

/** Resolved once - the module lookup is per-process, not per-file. */
let readFromDisk: ((filename: string) => Promise<string>) | null = null;

async function loadFromDisk(filename: string): Promise<string> {
    if (!readFromDisk) {
        const [{ readFile }, { join }] = await Promise.all([
            import('node:fs/promises'),
            import('node:path'),
        ]);
        readFromDisk = (name: string) => readFile(join(process.cwd(), 'public', 'data', name), 'utf8');
    }
    return readFromDisk(filename);
}

/**
 * Read one file from `public/data` and parse it.
 *
 * `filename` is the bare name with extension - `weapons.json`, not a path - because both halves
 * resolve it against a fixed root.
 *
 * Throws if the file cannot be read or is not valid JSON; callers that would rather degrade than
 * fail decide that for themselves.
 */
export async function loadDataFile<T>(filename: string): Promise<T> {
    if (typeof window === 'undefined') {
        return JSON.parse(await loadFromDisk(filename)) as T;
    }

    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
        throw new Error(`Failed to load /data/${filename}: ${response.status} ${response.statusText}`);
    }
    return await response.json() as T;
}
