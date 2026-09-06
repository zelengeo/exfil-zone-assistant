// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import Layout from '@/components/layout/Layout';
import { User } from "@/models/User";
import { Feedback } from "@/models/Feedback";
import { connectDB } from "@/lib/mongodb";
import { IUser } from "@/lib/schemas/user";
import { IFeedback } from '@/lib/schemas/feedback';
import {
    Trophy,
    Bug,
    Lightbulb,
    FileEdit,
    Activity,
    MapPin,
    Headphones,
    Award,
    Star,
    Clock
} from "lucide-react";
import SettingsSection from "@/app/dashboard/SettingsSection";

// Rank configuration
const rankConfig = {
    recruit: { next: 'soldier', pointsRequired: 100, color: 'text-ink-400' },
    soldier: { next: 'specialist', pointsRequired: 500, color: 'text-info' },
    specialist: { next: 'veteran', pointsRequired: 1500, color: 'text-info-light' },
    veteran: { next: 'elite', pointsRequired: 3000, color: 'text-warn' },
    elite: { next: null, pointsRequired: 5000, color: 'text-good' }
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin');
    }

    // Connect to DB and fetch user data
    await connectDB();
    const user = await User.findById(session.user.id).lean<IUser>();

    if (!user) {
        redirect('/auth/signin');
    }

    // Fetch recent feedback
    const recentFeedback = await Feedback.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean<IFeedback[]>();

    // Calculate progress to next rank
    const currentRankConfig = rankConfig[user.rank as keyof typeof rankConfig];
    const progressToNextRank = currentRankConfig.next
        ? (user.stats.contributionPoints / currentRankConfig.pointsRequired) * 100
        : 100;

    // Format dates
    // This authenticated async server page calculates age at request time, not during a client render.
    // eslint-disable-next-line react-hooks/purity
    const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const lastLogin = user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleDateString()
        : 'First login';

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="mb-8">
                    <p className="eyebrow mb-2">Operator</p>
                    <h1 className="font-display font-extrabold uppercase tracking-tight text-3xl text-ink-100">Dashboard</h1>
                    <p className="text-ink-400 mt-1">Welcome back, {user.displayName}!</p>
                </div>

                {/* User Profile Card */}
                <div className="bg-steel-800 border border-line-800 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.displayName || user.username}
                                    width={88}
                                    height={88}
                                    className="w-24 h-24 border border-line-500"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-steel-700 border border-line-500 flex items-center justify-center">
                  <span className="font-display font-bold text-3xl text-ink-300">
                    {user.username[0].toUpperCase()}
                  </span>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100">{user.username}</h2>
                                <span className={`px-2 py-1 font-mono text-[10px] tracking-micro uppercase border border-line-600 bg-steel-700 ${currentRankConfig.color}`}>
                  {user.rank}
                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                <div>
                                    <p className="eyebrow mb-1">Level</p>
                                    <p className="text-ink-200 font-mono tabular font-medium">{user.level}</p>
                                </div>
                                <div>
                                    <p className="eyebrow mb-1">Account Age</p>
                                    <p className="text-ink-200 font-mono tabular font-medium">{accountAge} days</p>
                                </div>
                                <div>
                                    <p className="eyebrow mb-1">Last Login</p>
                                    <p className="text-ink-200 font-mono tabular font-medium">{lastLogin}</p>
                                </div>
                                <div>
                                    <p className="eyebrow mb-1">Status</p>
                                    <p className={`font-medium ${user.isBanned ? 'text-bad' : user.isActive ? 'text-good' :  'text-warn'}`}>
                                        {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {(user.location || user.vrHeadset) && (
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {user.location && (
                                        <div className="flex items-center gap-2 text-sm text-ink-400">
                                            <MapPin className="h-4 w-4" strokeWidth={1.6} />
                                            <span>{user.location.toUpperCase()} Region</span>
                                        </div>
                                    )}
                                    {user.vrHeadset && (
                                        <div className="flex items-center gap-2 text-sm text-ink-400">
                                            <Headphones className="h-4 w-4" strokeWidth={1.6} />
                                            <span>{user.vrHeadset}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rank Progress */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-ink-400">Progress to {currentRankConfig.next || 'Max Rank'}</span>
                            <span className="text-sm text-ink-300 font-mono tabular">
                {user.stats.contributionPoints} / {currentRankConfig.pointsRequired} CP
              </span>
                        </div>
                        <div className="w-full bg-track h-1.5">
                            <div
                                className="bg-info h-1.5 transition-all duration-500"
                                style={{ width: `${Math.min(progressToNextRank, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Contribution Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Contributions */}
                    <div className="bg-steel-800 border border-line-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Trophy className="h-8 w-8 text-info" strokeWidth={1.6} />
                            <span className="font-mono tabular font-bold text-2xl text-ink-100">
                {user.stats.contributionPoints}
              </span>
                        </div>
                        <h3 className="text-ink-300 font-medium">Total Contribution Points</h3>
                        <p className="text-sm text-ink-500 mt-1">Keep contributing to rank up!</p>
                    </div>

                    {/* Feedback Submitted */}
                    <div className="bg-steel-800 border border-line-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Activity className="h-8 w-8 text-info" strokeWidth={1.6} />
                            <span className="font-mono tabular font-bold text-2xl text-ink-100">
                {user.stats.feedbackSubmitted}
              </span>
                        </div>
                        <h3 className="text-ink-300 font-medium">Total Feedback</h3>
                        <p className="text-sm text-ink-500 mt-1">All types of contributions</p>
                    </div>

                    {/* Bugs Reported */}
                    <div className="bg-steel-800 border border-line-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Bug className="h-8 w-8 text-bad" strokeWidth={1.6} />
                            <span className="font-mono tabular font-bold text-2xl text-ink-100">
                {user.stats.bugsReported}
              </span>
                        </div>
                        <h3 className="text-ink-300 font-medium">Bugs Reported</h3>
                        <p className="text-sm text-ink-500 mt-1">Help us fix issues</p>
                    </div>

                    {/* Features Proposed */}
                    <div className="bg-steel-800 border border-line-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Lightbulb className="h-8 w-8 text-warn" strokeWidth={1.6} />
                            <span className="font-mono tabular font-bold text-2xl text-ink-100">
                {user.stats.featuresProposed}
              </span>
                        </div>
                        <h3 className="text-ink-300 font-medium">Features Proposed</h3>
                        <p className="text-sm text-ink-500 mt-1">Your improvement ideas</p>
                    </div>

                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-steel-800 border border-line-800 p-6">
                        <h3 className="font-display font-bold uppercase tracking-tight text-xl text-ink-100 mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-info" strokeWidth={1.6} />
                            Recent Activity
                        </h3>
                        {recentFeedback.length > 0 ? (
                            <div className="space-y-3">
                                {recentFeedback.map((feedback: IFeedback) => (
                                    <div key={feedback._id.toString()} className="border-l-2 border-line-700 pl-4 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            {feedback.type === 'bug' && <Bug className="h-4 w-4 text-bad" strokeWidth={1.6} />}
                                            {feedback.type === 'feature' && <Lightbulb className="h-4 w-4 text-warn" strokeWidth={1.6} />}
                                            {feedback.type === 'data_correction' && <FileEdit className="h-4 w-4 text-info" strokeWidth={1.6} />}
                                            <span className="text-sm font-medium text-ink-200">{feedback.title}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-ink-500">
                      <span className={`px-2 py-0.5 font-mono text-[10px] tracking-micro uppercase border ${
                          feedback.status === 'accepted' ? 'border-good/40 text-good' :
                              feedback.status === 'rejected' ? 'border-bad/40 text-bad' :
                                  feedback.status === 'implemented' ? 'border-info/40 text-info' :
                                      'border-line-600 text-ink-400'
                      }`}>
                        {feedback.status}
                      </span>
                                            <span className="font-mono tabular">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-ink-500 text-center py-8">
                                No contributions yet. Start by reporting a bug or suggesting a feature!
                            </p>
                        )}
                    </div>

                    {/* Badges & Achievements */}
                    <div className="bg-steel-800 border border-line-800 p-6">
                        <h3 className="font-display font-bold uppercase tracking-tight text-xl text-ink-100 mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-info" strokeWidth={1.6} />
                            Badges &amp; Achievements
                        </h3>
                        {user.badges && user.badges.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {user.badges.map((badge) => (
                                    <div key={badge.id} className="bg-steel-750 p-3 border border-line-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Star className="h-4 w-4 text-warn" strokeWidth={1.6} />
                                            <span className="text-sm font-medium text-ink-200">{badge.name}</span>
                                        </div>
                                        <p className="text-xs text-ink-500">{badge.description}</p>
                                        <p className="text-xs text-ink-600 mt-1 font-mono tabular">
                                            Earned {new Date(badge.earnedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Award className="h-12 w-12 text-ink-700 mx-auto mb-3" strokeWidth={1.6} />
                                <p className="text-ink-500">No badges earned yet</p>
                                <p className="text-sm text-ink-600 mt-1">Keep contributing to unlock achievements!</p>
                            </div>
                        )}
                    </div>
                </div>
                <SettingsSection key={"settings"} initialSettings={{
                    displayName: user.displayName,
                    username: user.username,
                    bio: user.bio,
                    location: user.location,
                    vrHeadset: user.vrHeadset,
                    preferences: user.preferences,
                }} />
            </div>
        </Layout>
    );
}
