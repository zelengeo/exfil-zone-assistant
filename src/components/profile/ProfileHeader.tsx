import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Settings } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface ProfileHeaderProps {
    user: {
        _id: string;
        username: string;
        name?: string;
        image?: string;
        bio?: string;
        location?: string;
        vrHeadset?: string;
        createdAt: Date;
        rank: string;
    };
}

const rankColors = {
    recruit: 'bg-gray-600',
    soldier: 'bg-green-600',
    specialist: 'bg-blue-600',
    veteran: 'bg-purple-600',
    elite: 'bg-yellow-600',
};

export async function ProfileHeader({ user }: ProfileHeaderProps) {
    const session = await getServerSession(authOptions);
    const isOwnProfile = session?.user?.id === user._id.toString();

    return (
        <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-military-800 to-olive-900" />
            <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                    {/* Avatar */}
                    <div className="relative">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.username}
                                width={128}
                                height={128}
                                className="rounded-full border-4 border-background"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full border-4 border-background bg-olive-600 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {user.username[0].toUpperCase()}
                </span>
                            </div>
                        )}
                        {/* Rank badge */}
                        <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white ${rankColors[user.rank as keyof typeof rankColors]}`}>
                            {user.rank.toUpperCase()}
                        </div>
                    </div>

                    {/* User info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                            {user.name && user.name !== user.username && (
                                <span className="text-muted-foreground">({user.name})</span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>

                            {user.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{user.location}</span>
                                </div>
                            )}

                            {user.vrHeadset && (
                                <Badge variant="secondary">
                                    {user.vrHeadset.toUpperCase()}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {isOwnProfile && (
                        <Button asChild variant="outline" size="sm">
                            <Link href="/settings/profile">
                                <Settings className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}