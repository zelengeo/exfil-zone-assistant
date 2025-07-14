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
    CheckCircle2,
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
    recruit: { next: 'soldier', pointsRequired: 100, color: 'text-gray-400' },
    soldier: { next: 'specialist', pointsRequired: 500, color: 'text-blue-400' },
    specialist: { next: 'veteran', pointsRequired: 1500, color: 'text-purple-400' },
    veteran: { next: 'elite', pointsRequired: 3000, color: 'text-orange-400' },
    elite: { next: null, pointsRequired: 5000, color: 'text-yellow-400' }
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
    const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const lastLogin = user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleDateString()
        : 'First login';

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-tan-100 mb-2">Dashboard</h1>
                    <p className="text-tan-400">Welcome back, {user.username}!</p>
                </div>

                {/* User Profile Card */}
                <div className="bg-military-850 border border-military-700 rounded-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || user.username}
                                    width={88}
                                    height={88}
                                    className="w-24 h-24 rounded-sm border-2 border-olive-600"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-military-700 rounded-sm border-2 border-olive-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-tan-300">
                    {user.username[0].toUpperCase()}
                  </span>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-tan-100">{user.username}</h2>
                                <span className={`px-3 py-1 rounded-sm text-sm font-medium bg-military-800 ${currentRankConfig.color}`}>
                  {user.rank.toUpperCase()}
                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                <div>
                                    <p className="text-tan-500">Level</p>
                                    <p className="text-tan-200 font-medium">{user.level}</p>
                                </div>
                                <div>
                                    <p className="text-tan-500">Account Age</p>
                                    <p className="text-tan-200 font-medium">{accountAge} days</p>
                                </div>
                                <div>
                                    <p className="text-tan-500">Last Login</p>
                                    <p className="text-tan-200 font-medium">{lastLogin}</p>
                                </div>
                                <div>
                                    <p className="text-tan-500">Status</p>
                                    <p className={`font-medium ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {(user.location || user.vrHeadset) && (
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {user.location && (
                                        <div className="flex items-center gap-2 text-sm text-tan-400">
                                            <MapPin className="h-4 w-4" />
                                            <span>{user.location.toUpperCase()} Region</span>
                                        </div>
                                    )}
                                    {user.vrHeadset && (
                                        <div className="flex items-center gap-2 text-sm text-tan-400">
                                            <Headphones className="h-4 w-4" />
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
                            <span className="text-sm text-tan-400">Progress to {currentRankConfig.next || 'Max Rank'}</span>
                            <span className="text-sm text-tan-300 font-medium">
                {user.stats.contributionPoints} / {currentRankConfig.pointsRequired} CP
              </span>
                        </div>
                        <div className="w-full bg-military-700 rounded-full h-2">
                            <div
                                className="bg-olive-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(progressToNextRank, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Contribution Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Total Contributions */}
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Trophy className="h-8 w-8 text-olive-500" />
                            <span className="text-2xl font-bold text-tan-100">
                {user.stats.contributionPoints}
              </span>
                        </div>
                        <h3 className="text-tan-300 font-medium">Total Contribution Points</h3>
                        <p className="text-sm text-tan-500 mt-1">Keep contributing to rank up!</p>
                    </div>

                    {/* Feedback Submitted */}
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Activity className="h-8 w-8 text-blue-500" />
                            <span className="text-2xl font-bold text-tan-100">
                {user.stats.feedbackSubmitted}
              </span>
                        </div>
                        <h3 className="text-tan-300 font-medium">Total Feedback</h3>
                        <p className="text-sm text-tan-500 mt-1">All types of contributions</p>
                    </div>

                    {/* Bugs Reported */}
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Bug className="h-8 w-8 text-red-500" />
                            <span className="text-2xl font-bold text-tan-100">
                {user.stats.bugsReported}
              </span>
                        </div>
                        <h3 className="text-tan-300 font-medium">Bugs Reported</h3>
                        <p className="text-sm text-tan-500 mt-1">Help us fix issues</p>
                    </div>

                    {/* Features Proposed */}
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Lightbulb className="h-8 w-8 text-yellow-500" />
                            <span className="text-2xl font-bold text-tan-100">
                {user.stats.featuresProposed}
              </span>
                        </div>
                        <h3 className="text-tan-300 font-medium">Features Proposed</h3>
                        <p className="text-sm text-tan-500 mt-1">Your improvement ideas</p>
                    </div>

                    {/* Data Corrections */}
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <FileEdit className="h-8 w-8 text-purple-500" />
                            <span className="text-2xl font-bold text-tan-100">
                {user.stats.dataCorrections}
              </span>
                        </div>
                        <h3 className="text-tan-300 font-medium">Data Corrections</h3>
                        <p className="text-sm text-tan-500 mt-1">Submitted corrections</p>
                    </div>

                    {/* Accepted Corrections */}
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <span className="text-2xl font-bold text-tan-100">
                {user.stats.correctionsAccepted}
              </span>
                        </div>
                        <h3 className="text-tan-300 font-medium">Corrections Accepted</h3>
                        <p className="text-sm text-tan-500 mt-1">
                            {user.stats.dataCorrections > 0
                                ? `${Math.round((user.stats.correctionsAccepted / user.stats.dataCorrections) * 100)}% acceptance rate`
                                : 'Submit your first correction!'
                            }
                        </p>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                        <h3 className="text-xl font-bold text-tan-100 mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Activity
                        </h3>
                        {recentFeedback.length > 0 ? (
                            <div className="space-y-3">
                                {recentFeedback.map((feedback: IFeedback) => (
                                    <div key={feedback._id.toString()} className="border-l-2 border-military-700 pl-4 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            {feedback.type === 'bug' && <Bug className="h-4 w-4 text-red-500" />}
                                            {feedback.type === 'feature' && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                                            {feedback.type === 'data_correction' && <FileEdit className="h-4 w-4 text-purple-500" />}
                                            <span className="text-sm font-medium text-tan-200">{feedback.title}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-tan-500">
                      <span className={`px-2 py-0.5 rounded-sm ${
                          feedback.status === 'accepted' ? 'bg-green-900/30 text-green-400' :
                              feedback.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
                                  feedback.status === 'implemented' ? 'bg-blue-900/30 text-blue-400' :
                                      'bg-military-700 text-tan-400'
                      }`}>
                        {feedback.status}
                      </span>
                                            <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-tan-500 text-center py-8">
                                No contributions yet. Start by reporting a bug or suggesting a feature!
                            </p>
                        )}
                    </div>

                    {/* Badges & Achievements */}
                    <div className="bg-military-850 border border-military-700 rounded-sm p-6">
                        <h3 className="text-xl font-bold text-tan-100 mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Badges & Achievements
                        </h3>
                        {user.badges && user.badges.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {user.badges.map((badge) => (
                                    <div key={badge.id} className="bg-military-800 rounded-sm p-3 border border-military-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm font-medium text-tan-200">{badge.name}</span>
                                        </div>
                                        <p className="text-xs text-tan-500">{badge.description}</p>
                                        <p className="text-xs text-tan-600 mt-1">
                                            Earned {new Date(badge.earnedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Award className="h-12 w-12 text-military-600 mx-auto mb-3" />
                                <p className="text-tan-500">No badges earned yet</p>
                                <p className="text-sm text-tan-600 mt-1">Keep contributing to unlock achievements!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Preferences */}
                <div className="bg-military-850 border border-military-700 rounded-sm p-6 mt-6">
                    <h3 className="text-xl font-bold text-tan-100 mb-4">Account Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-3 bg-military-800 rounded-sm">
                            <span className="text-tan-300">Email Notifications</span>
                            <span className={`text-sm font-medium ${user.preferences.emailNotifications ? 'text-green-400' : 'text-red-400'}`}>
                {user.preferences.emailNotifications ? 'Enabled' : 'Disabled'}
              </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-military-800 rounded-sm">
                            <span className="text-tan-300">Public Profile</span>
                            <span className={`text-sm font-medium ${user.preferences.publicProfile ? 'text-green-400' : 'text-red-400'}`}>
                {user.preferences.publicProfile ? 'Visible' : 'Hidden'}
              </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-military-800 rounded-sm">
                            <span className="text-tan-300">Show Contributions</span>
                            <span className={`text-sm font-medium ${user.preferences.showContributions ? 'text-green-400' : 'text-red-400'}`}>
                {user.preferences.showContributions ? 'Public' : 'Private'}
              </span>
                        </div>
                    </div>
                </div>
                <SettingsSection initialSettings={{
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