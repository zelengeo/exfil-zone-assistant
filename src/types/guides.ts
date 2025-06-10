export interface GuideMetadata {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    readTime?: string;
    author?: string;
    publishedAt: string;
    updatedAt?: string;
    featured?: boolean;
    contentType: 'component' | 'markdown';
    // For component-based guides, we'll dynamically import
    // For markdown, we'll read from file system
}

export interface GuideTag {
    id: string;
    name: string;
    description: string;
    color: string; // For UI styling
    icon: string; // Icon name from lucide-react
}