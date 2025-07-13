// src/app/api/admin/feedback/[id]/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { Feedback } from '@/models/Feedback';
import { User } from '@/models/User';

// Helper function to check admin access
async function requireAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user?.roles?.includes('admin')) {
        throw new Error('Forbidden');
    }

    return { session, user };
}

// GET /api/admin/feedback/[id] - Get specific feedback item
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();
        await connectDB();

        const feedback = await Feedback.findById(params.id)
            .populate('userId', 'username avatarUrl email')
            .lean();

        if (!feedback) {
            return Response.json({ error: 'Feedback not found' }, { status: 404 });
        }

        return Response.json({ feedback });

    } catch (error) {
        console.error('Admin feedback GET error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to retrieve feedback' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/feedback/[id] - Update feedback item
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { session } = await requireAdmin();
        await connectDB();

        const body = await request.json();
        const { status, priority, adminNotes, reviewedBy } = body;

        // Validate status if provided
        if (status) {
            const validStatuses = ['new', 'in_review', 'accepted', 'rejected', 'implemented', 'duplicate'];
            if (!validStatuses.includes(status)) {
                return Response.json({ error: 'Invalid status' }, { status: 400 });
            }
        }

        // Validate priority if provided
        if (priority) {
            const validPriorities = ['low', 'medium', 'high', 'critical'];
            if (!validPriorities.includes(priority)) {
                return Response.json({ error: 'Invalid priority' }, { status: 400 });
            }
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        // Mark as reviewed
        if (status && status !== 'new') {
            updateData.reviewedBy = session.user.id;
            updateData.reviewedAt = new Date();
        }

        const feedback = await Feedback.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true }
        ).populate('userId', 'username avatarUrl email');

        if (!feedback) {
            return Response.json({ error: 'Feedback not found' }, { status: 404 });
        }

        // Update user stats if feedback was accepted/implemented
        if (feedback.userId && ['accepted', 'implemented'].includes(status)) {
            await User.findByIdAndUpdate(feedback.userId, {
                $inc: {
                    'stats.correctionsAccepted': 1,
                    'stats.contributionPoints': status === 'implemented' ? 10 : 5,
                }
            });
        }

        return Response.json({
            success: true,
            feedback,
            message: 'Feedback updated successfully'
        });

    } catch (error) {
        console.error('Admin feedback PATCH error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to update feedback' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/feedback/[id] - Delete feedback item (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();
        await connectDB();

        const feedback = await Feedback.findByIdAndDelete(params.id);

        if (!feedback) {
            return Response.json({ error: 'Feedback not found' }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: 'Feedback deleted successfully'
        });

    } catch (error) {
        console.error('Admin feedback DELETE error:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            if (error.message === 'Forbidden') {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return Response.json(
            { error: 'Failed to delete feedback' },
            { status: 500 }
        );
    }
}