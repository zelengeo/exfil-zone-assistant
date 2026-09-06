import { serializeJsonLd } from '@/lib/seo';

interface JsonLdProps {
    data: unknown;
}

export default function JsonLd({ data }: JsonLdProps) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
