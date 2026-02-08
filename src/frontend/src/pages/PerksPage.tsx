import { useState, useMemo } from 'react';
import { useGetPerks, useGetCharacters } from '../hooks/useQueries';
import { useGetCallerData, useSaveUserData } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Heart, Zap, Loader2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import type { Perk } from '../backend';

export default function PerksPage() {
  const [search, setSearch] = useState('');
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);

  const { data: perks = [], isLoading } = useGetPerks();
  const { data: characters = [] } = useGetCharacters();
  const { data: userData } = useGetCallerData();
  const saveUserData = useSaveUserData();
  const { identity } = useInternetIdentity();

  const filteredPerks = useMemo(() => {
    return perks.filter((perk) => {
      const matchesSearch = perk.name.toLowerCase().includes(search.toLowerCase()) ||
        perk.description.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [perks, search]);

  const isFavorite = (perkId: string) => {
    return userData?.favorites.favoritePerks.includes(perkId) || false;
  };

  const toggleFavorite = async (perkId: string) => {
    if (!identity || !userData) return;

    const favorites = userData.favorites.favoritePerks;
    const newFavorites = isFavorite(perkId)
      ? favorites.filter((id) => id !== perkId)
      : [...favorites, perkId];

    await saveUserData.mutateAsync({
      ...userData,
      favorites: {
        ...userData.favorites,
        favoritePerks: newFavorites,
      },
    });
  };

  const getCharacterName = (characterId: string) => {
    const character = characters.find((c) => c.id === characterId);
    return character?.name || 'Unknown';
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
        <h1 className="text-3xl font-bold mb-2">Perks</h1>
        <p className="text-muted-foreground">Browse all available perks and their effects</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search perks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredPerks.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      icon={Zap}
                      title="No perks found"
                      description="Try adjusting your search"
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredPerks.map((perk) => (
                      <button
                        key={perk.id}
                        onClick={() => setSelectedPerk(perk)}
                        className={`w-full text-left p-4 hover:bg-accent/50 transition-colors ${
                          selectedPerk?.id === perk.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{perk.name}</h3>
                              {isFavorite(perk.id) && (
                                <Heart className="h-3.5 w-3.5 fill-destructive text-destructive flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {perk.rarity}
                              </Badge>
                              {perk.isUnique && (
                                <Badge variant="secondary" className="text-xs">
                                  Unique
                                </Badge>
                              )}
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
          {selectedPerk ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{selectedPerk.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline">{selectedPerk.rarity}</Badge>
                      {selectedPerk.isUnique && <Badge variant="secondary">Unique</Badge>}
                      <Badge variant="outline">{getCharacterName(selectedPerk.characterId)}</Badge>
                    </div>
                  </div>
                  {identity && (
                    <Button
                      variant={isFavorite(selectedPerk.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFavorite(selectedPerk.id)}
                      disabled={saveUserData.isPending}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite(selectedPerk.id) ? 'fill-current' : ''}`} />
                      {isFavorite(selectedPerk.id) ? 'Favorited' : 'Favorite'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedPerk.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Usage Tips</h3>
                  <p className="text-muted-foreground">{selectedPerk.usageTips}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16">
                <EmptyState
                  icon={Zap}
                  title="Select a perk"
                  description="Choose a perk from the list to view details"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
