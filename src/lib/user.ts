import { connectDB } from '@/lib/mongodb';
import { userProfileSchema, type IUserApi } from '@/lib/schemas/user';
import { sanitizeUserInput } from '@/lib/utils';
import { User } from '@/models/User';

type UserProfile = IUserApi['ByUsername']['Get']['Response']['user'];

const PROFILE_FIELDS = 'username displayName avatarUrl bio location vrHeadset rank roles badges stats createdAt '
    + 'preferences.publicProfile preferences.showContributions';

/** Shared by the API and page. viewerId must come from the authenticated session, never input. */
export async function getUserByUsername(username: string, viewerId?: string): Promise<UserProfile | null> {
    await connectDB();
    const visible = { isActive: true, isBanned: false };
    const user = await User.findOne({
        username: sanitizeUserInput(username).toLowerCase(),
        ...(viewerId ? { $or: [visible, { _id: viewerId }] } : visible),
    }).select(PROFILE_FIELDS).lean<UserProfile>();

    if (!user) return null;

    // Parse the positive projection as well: extra fields inside stats/badges/preferences must
    // not leak if their persisted shape later grows. Older users store a null headset.
    const profile = userProfileSchema.parse({ ...user, vrHeadset: user.vrHeadset ?? undefined });
    if (viewerId === profile._id.toString()) return profile;

    if (!profile.preferences.publicProfile || !profile.preferences.showContributions) {
        profile.stats = { contributionPoints: 0, feedbackSubmitted: 0, bugsReported: 0, featuresProposed: 0 };
        profile.badges = [];
        profile.rank = 'recruit';
    }
    if (!profile.preferences.publicProfile) {
        profile.bio = '';
        profile.roles = [];
        profile.preferences.showContributions = false;
        delete profile.location;
        delete profile.vrHeadset;
        delete profile.createdAt;
    }
    return profile;
}
