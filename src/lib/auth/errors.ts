export const authErrorMessages: Record<string, string> = {
    OAuthAccountNotLinked: 'An account with this email already exists. Please sign in with your original provider.',
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    OAuthSignin: 'Error occurred during OAuth sign in.',
    OAuthCallback: 'Error occurred during OAuth callback.',
    OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
    EmailCreateAccount: 'Could not create email provider user in the database.',
    Callback: 'Error occurred during callback.',
    Default: 'An unexpected error occurred.',
};

export function getAuthErrorMessage(error: string | null): string {
    if (!error) return authErrorMessages.Default;
    return authErrorMessages[error] || authErrorMessages.Default;
}