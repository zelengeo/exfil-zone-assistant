'use client';

import {Button} from '@/components/ui/button';

export default function CookiePreferencesButton() {
    return (
        <Button variant="link" className="min-h-11 p-0 text-sm text-ink-400 hover:text-ink-100"
                onClick={() => window.dispatchEvent(new Event('open-cookie-preferences'))}>
            Cookie preferences
        </Button>
    );
}
