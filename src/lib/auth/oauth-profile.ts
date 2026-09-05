import { z } from 'zod';

const normalizedEmailSchema = z.string().trim().toLowerCase().pipe(z.email());

const verifiedProfileSchemas = {
    discord: z.object({
        email: normalizedEmailSchema,
        verified: z.literal(true),
    }),
    google: z.object({
        email: normalizedEmailSchema,
        email_verified: z.literal(true),
    }),
} as const;

export type SupportedOAuthProvider = keyof typeof verifiedProfileSchemas;

export function getVerifiedProviderEmail(
    provider: SupportedOAuthProvider,
    profile: unknown,
): string | null {
    const result = verifiedProfileSchemas[provider].safeParse(profile);
    return result.success ? result.data.email : null;
}
