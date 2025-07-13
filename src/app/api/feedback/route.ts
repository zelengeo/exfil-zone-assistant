// src/app/api/feedback/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { Feedback } from '@/models/Feedback';
import { User } from '@/models/User';
import {FeedbackPriority, FeedbackRequestBody} from "@/types/feedback";

// Helper function to generate sessionId for anonymous users
function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Helper function to determine category from pageUrl
function determineCategoryFromUrl(url: string): string {
    if (url.includes('/items')) return 'items';
    if (url.includes('/tasks')) return 'tasks';
    if (url.includes('/hideout')) return 'hideout';
    if (url.includes('/combat-sim')) return 'combat-sim';
    if (url.includes('/guides')) return 'guides';
    return 'other';
}

// Helper function to calculate priority based on type and content
function calculatePriority(body: FeedbackRequestBody): FeedbackPriority {
    // If user explicitly set priority, use it
    if (body.priority) return body.priority;

    // Auto-assign based on type and keywords
    const description = body.description.toLowerCase();
    const title = body.title.toLowerCase();

    // Critical keywords
    if (description.includes('crash') ||
        description.includes('broken') ||
        description.includes('cannot') ||
        title.includes('crash') ||
        title.includes('broken')) {
        return 'high';
    }

    // Bug reports are generally medium priority
    if (body.type === 'bug') return 'medium';

    // Feature requests are generally low priority
    if (body.type === 'feature') return 'low';

    // Data corrections are medium priority
    if (body.type === 'data_correction') return 'medium';

    return 'low';
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        const body: FeedbackRequestBody = await request.json();

        // Validate required fields
        const { type, title, description } = body;
        if (!type || !title || !description) {
            return Response.json(
                { error: 'Missing required fields: type, title, and description are required' },
                { status: 400 }
            );
        }

        // Validate field lengths
        if (title.length > 200) {
            return Response.json(
                { error: 'Title must be 200 characters or less' },
                { status: 400 }
            );
        }

        if (description.length > 5000) {
            return Response.json(
                { error: 'Description must be 5000 characters or less' },
                { status: 400 }
            );
        }

        // Validate enum values
        const validTypes = ['bug', 'feature', 'general', 'data_correction'];
        if (!validTypes.includes(type)) {
            return Response.json(
                { error: 'Invalid feedback type' },
                { status: 400 }
            );
        }

        // Get sessionId from cookies or generate new one
        const sessionId = request.cookies.get('sessionId')?.value || generateSessionId();

        // Create feedback document
        const feedbackData = {
            type,
            title: title.trim(),
            description: description.trim(),
            priority: calculatePriority(body),
            category: body.category || determineCategoryFromUrl(body.pageUrl || ''),
            userId: session?.user?.id || null,
            isAnonymous: !session?.user?.id,
            sessionId: sessionId,
            pageUrl: body.pageUrl || null,
            userAgent: body.userAgent || request.headers.get('user-agent') || null,
            status: 'new',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const feedback = await Feedback.create(feedbackData);

        // Update user stats if authenticated
        if (session?.user?.id) {
            const updateStats: any = {
                'stats.feedbackSubmitted': 1,
            };

            // Increment specific counters based on type
            switch (type) {
                case 'bug':
                    updateStats['stats.bugsReported'] = 1;
                    break;
                case 'feature':
                    updateStats['stats.featuresProposed'] = 1;
                    break;
                case 'data_correction':
                    updateStats['stats.dataCorrections'] = 1;
                    break;
            }

            await User.findByIdAndUpdate(
                session.user.id,
                {
                    $inc: updateStats,
                    lastActivity: new Date(),
                }
            );
        }

        // Set sessionId cookie for anonymous users
        const response = Response.json({
            success: true,
            feedbackId: feedback._id,
            message: 'Thank you for your feedback! We appreciate your contribution to improving ExfilZone Assistant.',
        });

        if (!session?.user?.id) {
            response.headers.set(
                'Set-Cookie',
                `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}` // 1 year
            );
        }

        return response;

    } catch (error) {
        console.error('Feedback submission error:', error);

        // Don't expose internal error details to client
        return Response.json(
            { error: 'Failed to submit feedback. Please try again later.' },
            { status: 500 }
        );
    }
}

// GET endpoint for retrieving feedback (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(session.user.id);
        if (!user?.roles?.includes('admin')) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const priority = searchParams.get('priority');

        // Build filter
        const filter: any = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (priority) filter.priority = priority;

        // Get feedback with pagination
        const skip = (page - 1) * limit;
        const [feedback, totalCount] = await Promise.all([
            Feedback.find(filter)
                .populate('userId', 'username avatarUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Feedback.countDocuments(filter)
        ]);

        return Response.json({
            feedback,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page * limit < totalCount,
                hasPrevPage: page > 1,
            }
        });

    } catch (error) {
        console.error('Feedback retrieval error:', error);
        return Response.json(
            { error: 'Failed to retrieve feedback' },
            { status: 500 }
        );
    }
}