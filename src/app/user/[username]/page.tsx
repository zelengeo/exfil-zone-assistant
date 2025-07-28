import {notFound, redirect} from 'next/navigation';
import Image from 'next/image';
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import {Feedback} from "@/models/Feedback";
import {
    Trophy,
    Bug,
    Lightbulb,
    FileEdit,
    CheckCircle2,
    Activity,
    Calendar,
    MapPin,
    Award,
    Star,
    Shield,
    TrendingUp,
    Users,
    Edit,
    EyeOff, RectangleGoggles
} from "lucide-react";
import {getUserByUsername} from "@/lib/user";
import {IFeedback} from "@/lib/schemas/feedback";

// Rank configuration (shared with dashboard)
const rankConfig = {
    recruit: {next: 'soldier', pointsRequired: 100, color: 'text-gray-400'},
    soldier: {next: 'specialist', pointsRequired: 500, color: 'text-blue-400'},
    specialist: {next: 'veteran', pointsRequired: 1500, color: 'text-purple-400'},
    veteran: {next: 'elite', pointsRequired: 3000, color: 'text-orange-400'},
    elite: {next: null, pointsRequired: 5000, color: 'text-yellow-400'}
};

interface UserProfilePageProps {
    params: Promise<{
        username: string;
    }>
}

export default async function UserProfilePage({params}: UserProfilePageProps) {
    const { username } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/unauthorized')
    }

    if (session.user.isBanned && (session.user.username !== username)) {
        redirect('/unauthorized/banned')
    }



    const user = await getUserByUsername(username)

    if (!user) {
        notFound();
    }

    // Check if this is the user's own profile
    const isOwnProfile = session?.user?.id === user._id.toString();

    // If profile is private and not own profile, show limited view
    const isProfilePrivate = !user.preferences.publicProfile && !isOwnProfile;

    // Fetch public feedback (only accepted/implemented)
    const publicFeedback = isProfilePrivate ? [] : await Feedback.find({
        userId: user._id,
        status: {$in: ['accepted', 'implemented']}
    })
        .sort({createdAt: -1})
        .limit(10)
        .lean<IFeedback[]>();

    // Calculate member since
    const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });

    // Calculate contributions this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyContributions = isProfilePrivate ? 0 : await Feedback.countDocuments({
        userId: user._id,
        createdAt: {$gte: thisMonth}
    });

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Profile Header */}
                <div className="bg-military-850 border border-military-700 rounded-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.displayName || user.username}
                                    width={132}
                                    height={132}
                                    className="w-32 h-32 rounded-sm border-2 border-olive-600"
                                />
                            ) : (
                                <div
                                    className="w-32 h-32 bg-military-700 rounded-sm border-2 border-olive-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-tan-300">
                    {user.username[0].toUpperCase()}
                  </span>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-tan-100">{user.username}</h1>
                                <span
                                    className={`px-3 py-1 rounded-sm text-sm font-medium bg-military-800 ${rankConfig[user.rank as keyof typeof rankConfig].color}`}>
                  {user.rank.toUpperCase()}
                </span>
                                {user.roles?.includes('admin') && (
                                    <span
                                        className="px-3 py-1 rounded-sm text-sm font-medium bg-red-900/30 text-red-400 flex items-center gap-1">
                    <Shield className="h-3 w-3"/>
                    ADMIN
                  </span>
                                )}
                                {user.roles?.includes('moderator') && (
                                    <span
                                        className="px-3 py-1 rounded-sm text-sm font-medium bg-blue-900/30 text-blue-400 flex items-center gap-1">
                    <Shield className="h-3 w-3"/>
                    MOD
                  </span>
                                )}
                            </div>

                            {user.bio && (
                                <p className="text-tan-300 mb-4 max-w-2xl">{user.bio}</p>
                            )}

                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2 text-tan-400">
                                    <Calendar className="h-4 w-4"/>
                                    <span>Member since {memberSince}</span>
                                </div>
                                {user.location && (
                                    <div className="flex items-center gap-2 text-tan-400">
                                        <MapPin className="h-4 w-4"/>
                                        <span>{user.location.toUpperCase()} Region</span>
                                    </div>
                                )}
                                {user.vrHeadset && (
                                    <div className="flex items-center gap-2 text-tan-400">
                                        <RectangleGoggles className="h-4 w-4"/>
                                        <span>{user.vrHeadset}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                                {isOwnProfile ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="px-4 py-2 bg-olive-600 hover:bg-olive-500 text-white rounded-sm transition-colors flex items-center gap-2"
                                        >
                                            <Activity className="h-4 w-4"/>
                                            View Dashboard
                                        </Link>
                                        <Link
                                            href="/settings/account"
                                            className="px-4 py-2 bg-military-700 hover:bg-military-600 text-tan-200 rounded-sm transition-colors flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4"/>
                                            Edit Profile
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        disabled
                                        className="px-4 py-2 bg-military-700 text-tan-500 rounded-sm cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Users className="h-4 w-4"/>
                                        Follow (Coming Soon)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Private Profile Notice */}
                {isProfilePrivate && (
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6 mb-6 text-center">
                        <EyeOff className="h-12 w-12 text-military-600 mx-auto mb-3"/>
                        <h2 className="text-xl font-bold text-tan-100 mb-2">Private Profile</h2>
                        <p className="text-tan-400">This user has chosen to keep their profile private.</p>
                    </div>
                )}

                {/* Public Content */}
                {!isProfilePrivate && (
                    <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-military-850 border border-military-700 rounded-sm p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Trophy className="h-6 w-6 text-olive-500"/>
                                    <span className="text-xl font-bold text-tan-100">
                    {user.stats.contributionPoints}
                  </span>
                                </div>
                                <p className="text-sm text-tan-400">Contribution Points</p>
                            </div>

                            <div className="bg-military-850 border border-military-700 rounded-sm p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Activity className="h-6 w-6 text-blue-500"/>
                                    <span className="text-xl font-bold text-tan-100">
                    {user.stats.feedbackSubmitted}
                  </span>
                                </div>
                                <p className="text-sm text-tan-400">Total Contributions</p>
                            </div>

                            <div className="bg-military-850 border border-military-700 rounded-sm p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <CheckCircle2 className="h-6 w-6 text-green-500"/>
                                    <span className="text-xl font-bold text-tan-100">
                    {user.stats.correctionsAccepted}
                  </span>
                                </div>
                                <p className="text-sm text-tan-400">Accepted Contributions</p>
                            </div>

                            <div className="bg-military-850 border border-military-700 rounded-sm p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="h-6 w-6 text-purple-500"/>
                                    <span className="text-xl font-bold text-tan-100">
                    {monthlyContributions}
                  </span>
                                </div>
                                <p className="text-sm text-tan-400">This Month</p>
                            </div>
                        </div>

                        {/* Contribution Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                                <h3 className="text-xl font-bold text-tan-100 mb-4">Contribution Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Bug className="h-4 w-4 text-red-500"/>
                                            <span className="text-tan-300">Bug Reports</span>
                                        </div>
                                        <span className="text-tan-100 font-medium">{user.stats.bugsReported}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-500"/>
                                            <span className="text-tan-300">Feature Requests</span>
                                        </div>
                                        <span className="text-tan-100 font-medium">{user.stats.featuresProposed}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <FileEdit className="h-4 w-4 text-purple-500"/>
                                            <span className="text-tan-300">Data Corrections</span>
                                        </div>
                                        <span className="text-tan-100 font-medium">{user.stats.dataCorrections}</span>
                                    </div>
                                    {user.stats.dataCorrections > 0 && (
                                        <div className="pt-3 mt-3 border-t border-military-700">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-tan-500">Acceptance Rate</span>
                                                <span className="text-green-400 font-medium">
                          {Math.round((user.stats.correctionsAccepted / user.stats.dataCorrections) * 100)}%
                        </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                                <h3 className="text-xl font-bold text-tan-100 mb-4">Achievements</h3>
                                {user.badges && user.badges.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {user.badges.slice(0, 4).map((badge) => (
                                            <div key={badge.id}
                                                 className="bg-military-800 rounded-sm p-3 border border-military-700">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Star className="h-4 w-4 text-yellow-500"/>
                                                    <span
                                                        className="text-sm font-medium text-tan-200">{badge.name}</span>
                                                </div>
                                                <p className="text-xs text-tan-500">{badge.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Award className="h-12 w-12 text-military-600 mx-auto mb-3"/>
                                        <p className="text-tan-500">No achievements yet</p>
                                    </div>
                                )}
                                {user.badges && user.badges.length > 4 && (
                                    <p className="text-sm text-tan-400 text-center mt-3">
                                        +{user.badges.length - 4} more achievements
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Recent Accepted Contributions */}
                        {user.preferences.showContributions && publicFeedback.length > 0 && (
                            <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                                <h3 className="text-xl font-bold text-tan-100 mb-4">Recent Accepted Contributions</h3>
                                <div className="space-y-3">
                                    {publicFeedback.map((feedback) => (
                                        <div key={feedback._id.toString()}
                                             className="border-l-2 border-olive-600 pl-4 py-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                {feedback.type === 'bug' && <Bug className="h-4 w-4 text-red-500"/>}
                                                {feedback.type === 'feature' &&
                                                    <Lightbulb className="h-4 w-4 text-yellow-500"/>}
                                                {feedback.type === 'data_correction' &&
                                                    <FileEdit className="h-4 w-4 text-purple-500"/>}
                                                <span
                                                    className="text-sm font-medium text-tan-200">{feedback.title}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-tan-500">
                        <span className={`px-2 py-0.5 rounded-sm ${
                            feedback.status === 'implemented' ? 'bg-blue-900/30 text-blue-400' :
                                'bg-green-900/30 text-green-400'
                        }`}>
                          {feedback.status}
                        </span>
                                                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                                                {feedback.category && (
                                                    <span className="text-tan-600">{feedback.category}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}