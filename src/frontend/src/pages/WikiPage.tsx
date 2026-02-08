import { useState, useMemo } from 'react';
import { useGetWikiEntries } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import type { WikiEntry } from '../backend';

export default function WikiPage() {
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null);

  const { data: wikiEntries = [], isLoading } = useGetWikiEntries();

  const filteredEntries = useMemo(() => {
    return wikiEntries.filter((entry) => {
      const matchesSearch = entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.content.toLowerCase().includes(search.toLowerCase()) ||
        entry.section.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [wikiEntries, search]);

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
        <h1 className="text-3xl font-bold mb-2">Wiki</h1>
        <p className="text-muted-foreground">Community knowledge base for Dead by Daylight</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wiki..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredEntries.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      icon={BookOpen}
                      title="No entries found"
                      description="Try adjusting your search"
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredEntries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`w-full text-left p-4 hover:bg-accent/50 transition-colors ${
                          selectedEntry?.id === entry.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="space-y-2">
                          <h3 className="font-semibold line-clamp-2">{entry.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {entry.section}
                          </Badge>
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
          {selectedEntry ? (
            <Card>
              <CardHeader>
                <div className="mb-3">
                  <Badge variant="outline">{selectedEntry.section}</Badge>
                </div>
                <CardTitle className="text-2xl">{selectedEntry.title}</CardTitle>
                <CardDescription>
                  By {selectedEntry.author} • Last updated {new Date(selectedEntry.lastUpdated).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16">
                <EmptyState
                  icon={BookOpen}
                  title="Select a wiki entry"
                  description="Choose an entry from the list to read more"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
