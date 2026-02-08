import { useState } from 'react';
import { useGetCharacters, useGetCallerData, useSaveUserData } from '../hooks/useQueries';
import AuthGate from '../components/Auth/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Skull, Trophy, Minus, Loader2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { toast } from 'sonner';
import type { Match, Variant_survivor_killer, Variant_draw_loss_victory } from '../backend';

export default function MatchTrackerPage() {
  const { data: characters = [] } = useGetCharacters();
  const { data: userData } = useGetCallerData();
  const saveUserData = useSaveUserData();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    matchType: 'survivor' as Variant_survivor_killer,
    mainCharacter: '',
    result: 'victory' as Variant_draw_loss_victory,
    map: '',
  });

  const addMatch = async () => {
    if (!userData) return;

    if (!formData.mainCharacter || !formData.map) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newMatch: Match = {
      matchId: `match-${Date.now()}`,
      matchType: formData.matchType,
      datePlayed: new Date().toISOString(),
      mainCharacter: formData.mainCharacter,
      result: formData.result,
      map: formData.map,
      perksUsed: [],
      teammates: [],
      achievements: [],
    };

    const matches = [newMatch, ...userData.matchHistory.matches];

    await saveUserData.mutateAsync({
      ...userData,
      matchHistory: {
        ...userData.matchHistory,
        matches,
        totalMatches: userData.matchHistory.totalMatches + BigInt(1),
      },
    });

    toast.success('Match added');
    setIsAdding(false);
    setFormData({
      matchType: 'survivor' as Variant_survivor_killer,
      mainCharacter: '',
      result: 'victory' as Variant_draw_loss_victory,
      map: '',
    });
  };

  const deleteMatch = async (matchId: string) => {
    if (!userData) return;

    const matches = userData.matchHistory.matches.filter((m) => m.matchId !== matchId);

    await saveUserData.mutateAsync({
      ...userData,
      matchHistory: {
        ...userData.matchHistory,
        matches,
        totalMatches: userData.matchHistory.totalMatches - BigInt(1),
      },
    });

    toast.success('Match deleted');
  };

  const filteredCharacters = characters.filter((c) => c.role === formData.matchType);

  return (
    <AuthGate message="Login to track your match history">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Match Tracker</h1>
            <p className="text-muted-foreground">Record and review your match history</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Match
            </Button>
          )}
        </div>

        {/* Stats */}
        {userData && userData.matchHistory.totalMatches > BigInt(0) && (
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Matches</CardDescription>
                <CardTitle className="text-3xl">{userData.matchHistory.totalMatches.toString()}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Victories</CardDescription>
                <CardTitle className="text-3xl text-green-500">
                  {userData.matchHistory.matches.filter((m) => m.result === 'victory').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Losses</CardDescription>
                <CardTitle className="text-3xl text-destructive">
                  {userData.matchHistory.matches.filter((m) => m.result === 'loss').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {isAdding && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Match</CardTitle>
              <CardDescription>Record the details of your latest match</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matchType">Role</Label>
                  <Select
                    value={formData.matchType}
                    onValueChange={(v) => setFormData({ ...formData, matchType: v as Variant_survivor_killer, mainCharacter: '' })}
                  >
                    <SelectTrigger id="matchType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="survivor">Survivor</SelectItem>
                      <SelectItem value="killer">Killer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="character">Character</Label>
                  <Select value={formData.mainCharacter} onValueChange={(v) => setFormData({ ...formData, mainCharacter: v })}>
                    <SelectTrigger id="character">
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCharacters.map((char) => (
                        <SelectItem key={char.id} value={char.id}>
                          {char.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="result">Result</Label>
                  <Select value={formData.result} onValueChange={(v) => setFormData({ ...formData, result: v as Variant_draw_loss_victory })}>
                    <SelectTrigger id="result">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="victory">Victory</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                      <SelectItem value="draw">Draw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map">Map</Label>
                  <Input
                    id="map"
                    value={formData.map}
                    onChange={(e) => setFormData({ ...formData, map: e.target.value })}
                    placeholder="Enter map name"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addMatch} disabled={saveUserData.isPending}>
                  {saveUserData.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Match
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match History */}
        {!userData?.matchHistory.matches.length ? (
          <Card>
            <CardContent className="py-16">
              <EmptyState
                icon={Skull}
                title="No matches recorded"
                description="Start tracking your matches to see your history"
                action={
                  !isAdding && (
                    <Button onClick={() => setIsAdding(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Match
                    </Button>
                  )
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
              <CardDescription>Your recent matches</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {userData.matchHistory.matches.map((match) => {
                  const character = characters.find((c) => c.id === match.mainCharacter);
                  return (
                    <div key={match.matchId} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={match.matchType === 'killer' ? 'destructive' : 'secondary'}>
                              {match.matchType === 'killer' ? 'Killer' : 'Survivor'}
                            </Badge>
                            <Badge
                              variant={
                                match.result === 'victory' ? 'default' : match.result === 'loss' ? 'destructive' : 'outline'
                              }
                            >
                              {match.result === 'victory' && <Trophy className="h-3 w-3 mr-1" />}
                              {match.result === 'loss' && <Skull className="h-3 w-3 mr-1" />}
                              {match.result === 'draw' && <Minus className="h-3 w-3 mr-1" />}
                              {match.result.charAt(0).toUpperCase() + match.result.slice(1)}
                            </Badge>
                          </div>
                          <p className="font-medium">{character?.name || match.mainCharacter}</p>
                          <p className="text-sm text-muted-foreground">{match.map}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(match.datePlayed).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMatch(match.matchId)}
                          disabled={saveUserData.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGate>
  );
}
