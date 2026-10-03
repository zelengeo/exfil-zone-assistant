/**
 * Custom browser requests are not pinned by Next.js. Use the same deployment ID
 * Next injects for its own requests, so an open tab keeps its data/API contract.
 * Vercel must enable Skew Protection and retain that deployment for routing to work.
 * Keep hashed URLs and cache options intact; never retry a mutation on another release.
 * NextAuth owns its transport separately and requires compatible auth across releases.
 */
export function deploymentFetch(path: string, init?: RequestInit): Promise<Response> {
    // This transport is only for our own data and API endpoints, never external origins.
    if (!path.startsWith('/assets/') && !path.startsWith('/api/')) {
        throw new Error('Deployment requests require a local /assets/ or /api/ path');
    }

    const deploymentId = process.env.NEXT_DEPLOYMENT_ID;
    if (!deploymentId || typeof window === 'undefined') return fetch(path, init);

    const headers = new Headers(init?.headers);
    headers.set('x-deployment-id', deploymentId);
    return fetch(path, { ...init, headers });
}
