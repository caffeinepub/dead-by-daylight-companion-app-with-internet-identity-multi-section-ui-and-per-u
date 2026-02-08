import { useState, useMemo } from 'react';
import { useGetCharacters } from '../hooks/useQueries';
import { useGetCallerData, useSaveUserData } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Heart, Skull, Users, Loader2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import type { Character } from '../backend';

export default function CharactersPage() {
  const [search, setSearch] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'killer' | 'survivor'>('all');

  const { data: characters = [], isLoading } = useGetCharacters();
  const { data: userData } = useGetCallerData();
  const saveUserData = useSaveUserData();
  const { identity } = useInternetIdentity();

  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase()) ||
        char.bio.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || char.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [characters, search, roleFilter]);

  const isFavorite = (characterId: string) => {
    return userData?.favorites.favoriteCharacters.includes(characterId) || false;
  };

  const toggleFavorite = async (characterId: string) => {
    if (!identity || !userData) return;

    const favorites = userData.favorites.favoriteCharacters;
    const newFavorites = isFavorite(characterId)
      ? favorites.filter((id) => id !== characterId)
      : [...favorites, characterId];

    await saveUserData.mutateAsync({
      ...userData,
      favorites: {
        ...userData.favorites,
        favoriteCharacters: newFavorites,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Characters</h1>
        <p className="text-muted-foreground">Explore killers and survivors from the Entity's realm</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search characters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)} className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="killer">Killers</TabsTrigger>
                  <TabsTrigger value="survivor">Survivors</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredCharacters.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      icon={Users}
                      title="No characters found"
                      description="Try adjusting your search or filters"
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredCharacters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => setSelectedCharacter(char)}
                        className={`w-full text-left p-4 hover:bg-accent/50 transition-colors ${
                          selectedCharacter?.id === char.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{char.name}</h3>
                              {isFavorite(char.id) && (
                                <Heart className="h-3.5 w-3.5 fill-destructive text-destructive flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={char.role === 'killer' ? 'destructive' : 'secondary'} className="text-xs">
                                {char.role === 'killer' ? <Skull className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                                {char.role === 'killer' ? 'Killer' : 'Survivor'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{char.difficulty}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedCharacter ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{selectedCharacter.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={selectedCharacter.role === 'killer' ? 'destructive' : 'secondary'}>
                        {selectedCharacter.role === 'killer' ? <Skull className="h-3.5 w-3.5 mr-1" /> : <Users className="h-3.5 w-3.5 mr-1" />}
                        {selectedCharacter.role === 'killer' ? 'Killer' : 'Survivor'}
                      </Badge>
                      <Badge variant="outline">{selectedCharacter.difficulty}</Badge>
                      <Badge variant="outline">{selectedCharacter.releaseYear}</Badge>
                      {selectedCharacter.isLicensed && <Badge variant="outline">Licensed</Badge>}
                    </div>
                  </div>
                  {identity && (
                    <Button
                      variant={isFavorite(selectedCharacter.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFavorite(selectedCharacter.id)}
                      disabled={saveUserData.isPending}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite(selectedCharacter.id) ? 'fill-current' : ''}`} />
                      {isFavorite(selectedCharacter.id) ? 'Favorited' : 'Favorite'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Biography</h3>
                  <p className="text-muted-foreground">{selectedCharacter.bio}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Power</h3>
                  <p className="text-muted-foreground">{selectedCharacter.power}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Unique Perks</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.uniquePerks.map((perkId) => (
                      <Badge key={perkId} variant="secondary">
                        {perkId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16">
                <EmptyState
                  icon={Users}
                  title="Select a character"
                  description="Choose a character from the list to view details"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
