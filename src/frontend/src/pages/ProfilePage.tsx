import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useGetCallerData } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import AuthGate from '../components/Auth/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Heart, Swords, Skull, ArrowRight, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: userData, isLoading: dataLoading } = useGetCallerData();
  const navigate = useNavigate();

  const isLoading = profileLoading || dataLoading;

  return (
    <AuthGate message="Login to view your profile">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Your Dead by Daylight companion stats</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{userProfile?.name}</CardTitle>
                    <CardDescription>Survivor of the Entity's realm</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Swords className="h-4 w-4" />
                    Builds
                  </CardDescription>
                  <CardTitle className="text-3xl">{userData?.builds.length || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => navigate({ to: '/builds' })}
                  >
                    View Builds
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Skull className="h-4 w-4" />
                    Matches
                  </CardDescription>
                  <CardTitle className="text-3xl">{userData?.matchHistory.totalMatches.toString() || '0'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => navigate({ to: '/matches' })}
                  >
                    View Matches
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Favorite Characters
                  </CardDescription>
                  <CardTitle className="text-3xl">{userData?.favorites.favoriteCharacters.length || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => navigate({ to: '/characters' })}
                  >
                    View Characters
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Favorite Perks
                  </CardDescription>
                  <CardTitle className="text-3xl">{userData?.favorites.favoritePerks.length || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => navigate({ to: '/perks' })}
                  >
                    View Perks
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Matches */}
            {userData && userData.matchHistory.matches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                  <CardDescription>Your last 5 matches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userData.matchHistory.matches.slice(0, 5).map((match) => (
                      <div key={match.matchId} className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                        <div className="flex items-center gap-3">
                          <Badge variant={match.matchType === 'killer' ? 'destructive' : 'secondary'}>
                            {match.matchType === 'killer' ? 'Killer' : 'Survivor'}
                          </Badge>
                          <span className="text-sm font-medium">{match.map}</span>
                        </div>
                        <Badge
                          variant={
                            match.result === 'victory' ? 'default' : match.result === 'loss' ? 'destructive' : 'outline'
                          }
                        >
                          {match.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AuthGate>
  );
}
