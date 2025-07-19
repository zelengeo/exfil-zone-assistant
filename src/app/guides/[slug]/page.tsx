import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getGuideBySlug, getAllGuideSlugs, getRelatedGuides, guideTags } from '@/content/guides/guides-config';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { ChevronLeft, Clock, User, Calendar, Tag } from 'lucide-react';

// For Markdown content rendering
// import { remark } from 'remark';
// import html from 'remark-html';
// import fs from 'fs/promises';
// import path from 'path';
import React from "react";
import {GuideTag} from "@/types/guides";

// Generate static params for all guides
export async function generateStaticParams() {
    const slugs = getAllGuideSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const {slug} = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        return {
            title: 'Guide Not Found',
        };
    }

    const url = `https://www.exfil-zone-assistant.app/guides/${slug}`;

    return {
        title: `${guide.title}`,
        description: guide.description,
        openGraph: {
            title: guide.title,
            description: guide.description,
            type: 'article',
            publishedTime: guide.publishedAt,
            modifiedTime: guide.updatedAt,
            authors: guide.author ? [guide.author] : undefined,
            tags: guide.tags,
            url: url,
            images: [
                {
                    url: guide.ogImageUrl || '/og-image.jpg',
                    width: 1200,
                    height: 630,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: guide.title,
            description: guide.description,
        },
    };
}

// Helper function to load markdown content
// async function getMarkdownContent(slug: string): Promise<string | null> {
//     try {
//         const filePath = path.join(process.cwd(), 'content', 'guides', `${slug}.md`);
//         const fileContent = await fs.readFile(filePath, 'utf8');
//
//         // Remove frontmatter if present (between ---)
//         const contentWithoutFrontmatter = fileContent.replace(/^---[\s\S]*?---\n/, '');
//
//         // Process markdown to HTML
//         const processedContent = await remark()
//             .use(html)
//             .process(contentWithoutFrontmatter);
//
//         return processedContent.toString();
//     } catch (error) {
//         console.error(`Error loading markdown for ${slug}:`, error);
//         return null;
//     }
// }

// Helper to get difficulty styling
const getDifficultyStyle = (difficulty?: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'bg-green-900/30 border-green-800 text-green-400';
        case 'intermediate':
            return 'bg-yellow-900/30 border-yellow-800 text-yellow-400';
        case 'advanced':
            return 'bg-red-900/30 border-red-800 text-red-400';
        default:
            return 'bg-military-700 border-military-600 text-tan-300';
    }
};

// Helper to get tag info
const getTagInfo = (tagId: string) => {
    return guideTags.find((tag: GuideTag) => tag.id === tagId);
};

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
    const {slug} = await params
    const guide = getGuideBySlug(slug);

    if (!guide) {
        notFound();
    }

    let content: React.ReactNode;

    // if (guide.contentType === 'markdown') {
    //     // Load markdown content
    //     const markdownContent = await getMarkdownContent(guide.slug);
    //     if (!markdownContent) {
    //         notFound();
    //     }
    //
    //     content = (
    //         <div
    //             className="prose prose-invert max-w-none
    //       prose-headings:text-tan-100 prose-headings:font-bold
    //       prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
    //       prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
    //       prose-p:text-tan-200 prose-p:leading-relaxed prose-p:mb-4
    //       prose-a:text-olive-400 prose-a:no-underline hover:prose-a:text-olive-300
    //       prose-strong:text-tan-100 prose-strong:font-semibold
    //       prose-ul:text-tan-200 prose-ul:my-4
    //       prose-ol:text-tan-200 prose-ol:my-4
    //       prose-li:my-1
    //       prose-blockquote:border-l-4 prose-blockquote:border-olive-600
    //       prose-blockquote:bg-military-800/50 prose-blockquote:py-2 prose-blockquote:px-4
    //       prose-blockquote:text-tan-300 prose-blockquote:not-italic
    //       prose-code:text-olive-400 prose-code:bg-military-800
    //       prose-code:px-1 prose-code:py-0.5 prose-code:rounded
    //       prose-pre:bg-military-900 prose-pre:border prose-pre:border-military-700"
    //             dangerouslySetInnerHTML={{ __html: markdownContent }}
    //         />
    //     );
    // } else {}
    // Dynamically import component
    try {
        const GuideComponent = dynamic(
            () => import(`@/content/guides/${guide.slug}`).then(mod => mod.default),
            {
                loading: () => (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-tan-400">Loading guide content...</div>
                    </div>
                ),
                ssr: true
            }
        );
        content = <GuideComponent />;
    } catch (error) {
        console.error(`Error loading component for ${guide.slug}:`, error);
        notFound();
    }


    // Get related guides
    const relatedGuides = getRelatedGuides(guide.slug, 3);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-tan-300">
                    <Link href="/guides" className="flex items-center gap-1 hover:text-olive-400 transition-colors">
                        <ChevronLeft size={16}/>
                        <span>Guides</span>
                    </Link>
                    <span>/</span>
                    <span className="text-tan-100">{guide.title}</span>
                </div>

                {/* Guide Header */}
                <header className="mb-8 pb-8 border-b border-military-700">
                    {/* Difficulty Badge */}
                    {guide.difficulty && (
                        <div className={`inline-block px-3 py-1 rounded-sm mb-4 border ${getDifficultyStyle(guide.difficulty)}`}>
                            <span className="text-sm font-medium capitalize">{guide.difficulty}</span>
                        </div>
                    )}

                    <h1 className="text-3xl md:text-4xl font-bold text-tan-100 mb-3">
                        {guide.title}
                    </h1>

                    <p className="text-lg text-tan-300 mb-4">
                        {guide.description}
                    </p>

                    {/* Meta information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-tan-400">
                        {guide.readTime && (
                            <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>{guide.readTime}</span>
                            </div>
                        )}
                        {guide.author && (
                            <div className="flex items-center gap-1">
                                <User size={16} />
                                <span>{guide.author}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{new Date(guide.publishedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {guide.tags.map((tagId) => {
                            const tagInfo = getTagInfo(tagId);
                            return (
                                <Link
                                    key={tagId}
                                    href={`/guides?tag=${tagId}`}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-military-800
                           border border-military-600 rounded-sm text-sm text-tan-300
                           hover:border-olive-700 hover:text-olive-400 transition-all"
                                >
                                    <Tag size={12} />
                                    {tagInfo?.name || tagId}
                                </Link>
                            );
                        })}
                    </div>
                </header>

                {/* Guide Content */}
                <article className="guide-content">
                    {content}
                </article>

                {/* Related Guides */}
                {relatedGuides.length > 0 && (
                    <section className="mt-12 pt-8 border-t border-military-700">
                        <h2 className="text-2xl font-bold text-tan-100 mb-6">Related Guides</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {relatedGuides.map((relatedGuide) => (
                                <Link
                                    key={relatedGuide.slug}
                                    href={`/guides/${relatedGuide.slug}`}
                                    className="block p-4 bg-military-800 border border-military-600 rounded-sm
                           hover:border-olive-700 transition-all group"
                                >
                                    <h3 className="font-semibold text-tan-100 mb-2 group-hover:text-olive-400 transition-colors">
                                        {relatedGuide.title}
                                    </h3>
                                    <p className="text-sm text-tan-300 mb-3 line-clamp-2">
                                        {relatedGuide.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-sm border ${getDifficultyStyle(relatedGuide.difficulty)}`}>
                      {relatedGuide.difficulty || 'All Levels'}
                    </span>
                                        {relatedGuide.readTime && (
                                            <span className="text-tan-400">{relatedGuide.readTime}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Back to Guides */}
                <div className="mt-8 pt-8 border-t border-military-700">
                    <Link
                        href="/guides"
                        className="inline-flex items-center gap-2 text-olive-400 hover:text-olive-300 transition-colors"
                    >
                        <ChevronLeft size={18} />
                        Back to All Guides
                    </Link>
                </div>
            </div>
        </Layout>
    );
}