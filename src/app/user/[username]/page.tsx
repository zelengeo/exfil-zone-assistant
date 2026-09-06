import {notFound} from 'next/navigation';
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
    Activity,
    Calendar,
    MapPin,
    Award,
    Star,
    Shield,
    TrendingUp,
    EyeOff, RectangleGoggles
} from "lucide-react";
import {getUserByUsername} from "@/lib/user";
import {IFeedback} from "@/lib/schemas/feedback";

// Rank configuration (shared with dashboard)
const rankConfig = {
    recruit: {next: 'soldier', pointsRequired: 100, color: 'text-ink-400'},
    soldier: {next: 'specialist', pointsRequired: 500, color: 'text-info'},
    specialist: {next: 'veteran', pointsRequired: 1500, color: 'text-info-light'},
    veteran: {next: 'elite', pointsRequired: 3000, color: 'text-warn'},
    elite: {next: null, pointsRequired: 5000, color: 'text-good'}
};

interface UserProfilePageProps {
    params: Promise<{
        username: string;
    }>
}

export default async function UserProfilePage({params}: UserProfilePageProps) {
    const { username } = await params;

    const session = await getServerSession(authOptions);

    const user = await getUserByUsername(username, session?.user?.id);

    // TODO not found user should have different fallback.
    if (!user) {
        notFound();
    }

    // Check if this is the user's own profile
    const isOwnProfile = session?.user?.id === user._id.toString();

    // If profile is private and not own profile, show limited view
    const isProfilePrivate = !user.preferences.publicProfile && !isOwnProfile;

    const showContributions = isOwnProfile || (!isProfilePrivate && user.preferences.showContributions);

    // Fetch public feedback (only accepted/implemented)
    const publicFeedback = !showContributions ? [] : await Feedback.find({
        userId: user._id,
        status: {$in: ['accepted', 'implemented']}
    })
        .select('type title status category createdAt')
        .sort({createdAt: -1})
        .limit(10)
        .lean<IFeedback[]>();

    // Calculate member since
    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    }) : null;

    // Calculate contributions this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyContributions = !showContributions ? 0 : await Feedback.countDocuments({
        userId: user._id,
        createdAt: {$gte: thisMonth}
    });

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Profile Header */}
                <div className="bg-steel-800 border border-line-800 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.displayName || user.username}
                                    width={132}
                                    height={132}
                                    className="w-32 h-32 border border-line-500"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-steel-700 border border-line-500 flex items-center justify-center">
                  <span className="font-display font-bold text-4xl text-ink-300">
                    {user.username[0].toUpperCase()}
                  </span>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="font-display font-extrabold uppercase tracking-tight text-3xl text-ink-100">{user.username}</h1>
                                <span
                                    className={`px-2 py-1 font-mono text-[10px] tracking-micro uppercase border border-line-600 bg-steel-700 ${rankConfig[user.rank as keyof typeof rankConfig].color}`}>
                  {user.rank}
                </span>
                                {user.roles?.includes('admin') && (
                                    <span
                                        className="px-2 py-1 font-mono text-[10px] tracking-micro uppercase border border-bad/40 text-bad flex items-center gap-1">
                    <Shield className="h-3 w-3"/>
                    ADMIN
                  </span>
                                )}
                                {user.roles?.includes('moderator') && (
                                    <span
                                        className="px-2 py-1 font-mono text-[10px] tracking-micro uppercase border border-info/40 text-info flex items-center gap-1">
                    <Shield className="h-3 w-3"/>
                    MOD
                  </span>
                                )}
                            </div>

                            {user.bio && (
                                <p className="text-ink-300 mb-4 max-w-2xl">{user.bio}</p>
                            )}

                            <div className="flex flex-wrap gap-6 text-sm">
                                {memberSince && <div className="flex items-center gap-2 text-ink-400">
                                    <Calendar className="h-4 w-4" strokeWidth={1.6}/>
                                    <span>Member since {memberSince}</span>
                                </div>}
                                {user.location && (
                                    <div className="flex items-center gap-2 text-ink-400">
                                        <MapPin className="h-4 w-4" strokeWidth={1.6}/>
                                        <span>{user.location.toUpperCase()} Region</span>
                                    </div>
                                )}
                                {user.vrHeadset && (
                                    <div className="flex items-center gap-2 text-ink-400">
                                        <RectangleGoggles className="h-4 w-4" strokeWidth={1.6}/>
                                        <span>{user.vrHeadset}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                                {isOwnProfile ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 bg-ember hover:bg-ember-hover text-ember-ink font-display font-bold uppercase tracking-nav transition-colors flex items-center gap-2"
                                    >
                                        <Activity className="h-4 w-4"/>
                                        View Dashboard
                                    </Link>
                                ) : null }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Private Profile Notice */}
                {isProfilePrivate && (
                    <div className="bg-steel-800 border border-line-800 p-6 mb-6 text-center">
                        <EyeOff className="h-12 w-12 text-ink-700 mx-auto mb-3" strokeWidth={1.6}/>
                        <h2 className="font-display font-bold uppercase tracking-tight text-xl text-ink-100 mb-2">Private Profile</h2>
                        <p className="text-ink-400">This user has chosen to keep their profile private.</p>
                    </div>
                )}

                {/* Public Content */}
                {showContributions && (
                    <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-steel-800 border border-line-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Trophy className="h-6 w-6 text-info" strokeWidth={1.6}/>
                                    <span className="font-mono tabular font-bold text-xl text-ink-100">
                    {user.stats.contributionPoints}
                  </span>
                                </div>
                                <p className="text-sm text-ink-400">Contribution Points</p>
                            </div>

                            <div className="bg-steel-800 border border-line-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Activity className="h-6 w-6 text-info" strokeWidth={1.6}/>
                                    <span className="font-mono tabular font-bold text-xl text-ink-100">
                    {user.stats.feedbackSubmitted}
                  </span>
                                </div>
                                <p className="text-sm text-ink-400">Total Contributions</p>
                            </div>

                            <div className="bg-military-850 border border-military-700 rounded-sm p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="h-6 w-6 text-info" strokeWidth={1.6}/>
                                    <span className="font-mono tabular font-bold text-xl text-ink-100">
                    {monthlyContributions}
                  </span>
                                </div>
                                <p className="text-sm text-ink-400">This Month</p>
                            </div>
                        </div>

                        {/* Contribution Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="bg-steel-800 border border-line-800 p-6">
                                <h3 className="font-display font-bold uppercase tracking-tight text-xl text-ink-100 mb-4">Contribution Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Bug className="h-4 w-4 text-bad" strokeWidth={1.6}/>
                                            <span className="text-ink-300">Bug Reports</span>
                                        </div>
                                        <span className="text-ink-100 font-mono tabular">{user.stats.bugsReported}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Lightbulb className="h-4 w-4 text-warn" strokeWidth={1.6}/>
                                            <span className="text-ink-300">Feature Requests</span>
                                        </div>
                                        <span className="text-ink-100 font-mono tabular">{user.stats.featuresProposed}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="bg-steel-800 border border-line-800 p-6">
                                <h3 className="font-display font-bold uppercase tracking-tight text-xl text-ink-100 mb-4">Achievements</h3>
                                {user.badges && user.badges.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {user.badges.slice(0, 4).map((badge) => (
                                            <div key={badge.id}
                                                 className="bg-steel-750 p-3 border border-line-700">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Star className="h-4 w-4 text-warn" strokeWidth={1.6}/>
                                                    <span
                                                        className="text-sm font-medium text-ink-200">{badge.name}</span>
                                                </div>
                                                <p className="text-xs text-ink-500">{badge.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Award className="h-12 w-12 text-ink-700 mx-auto mb-3" strokeWidth={1.6}/>
                                        <p className="text-ink-500">No achievements yet</p>
                                    </div>
                                )}
                                {user.badges && user.badges.length > 4 && (
                                    <p className="text-sm text-ink-400 text-center mt-3">
                                        +{user.badges.length - 4} more achievements
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Recent Accepted Contributions */}
                        {publicFeedback.length > 0 && (
                            <div className="bg-steel-800 border border-line-800 p-6">
                                <h3 className="font-display font-bold uppercase tracking-tight text-xl text-ink-100 mb-4">Recent Accepted Contributions</h3>
                                <div className="space-y-3">
                                    {publicFeedback.map((feedback) => (
                                        <div key={feedback._id.toString()}
                                             className="border-l-2 border-line-600 pl-4 py-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                {feedback.type === 'bug' && <Bug className="h-4 w-4 text-bad" strokeWidth={1.6}/>}
                                                {feedback.type === 'feature' &&
                                                    <Lightbulb className="h-4 w-4 text-warn" strokeWidth={1.6}/>}
                                                {feedback.type === 'data_correction' &&
                                                    <FileEdit className="h-4 w-4 text-info" strokeWidth={1.6}/>}
                                                <span
                                                    className="text-sm font-medium text-ink-200">{feedback.title}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-ink-500">
                        <span className={`px-2 py-0.5 font-mono text-[10px] tracking-micro uppercase border ${
                            feedback.status === 'implemented' ? 'border-info/40 text-info' :
                                'border-good/40 text-good'
                        }`}>
                          {feedback.status}
                        </span>
                                                <span className="font-mono tabular">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                                                {feedback.category && (
                                                    <span className="text-ink-600">{feedback.category}</span>
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
