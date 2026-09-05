export const LOCAL_MONGODB_URI =
    'mongodb://127.0.0.1:27018/exfil-zone-assistant?replicaSet=rs0&directConnection=true';

export function assertLocalMongoUri(uri: string): void {
    const parsed = new URL(uri);
    const isLoopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';

    if (parsed.protocol !== 'mongodb:' || !isLoopback || parsed.port !== '27018') {
        throw new Error('Local database setup is restricted to MongoDB on 127.0.0.1:27018');
    }
}
