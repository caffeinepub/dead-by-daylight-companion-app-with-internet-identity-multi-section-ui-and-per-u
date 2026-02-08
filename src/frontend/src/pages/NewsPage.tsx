import { useState, useMemo } from 'react';
import { useGetNews } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Newspaper, Loader2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import type { NewsItem } from '../backend';

export default function NewsPage() {
  const [search, setSearch] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const { data: news = [], isLoading } = useGetNews();

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [news, search]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'update':
        return 'default';
      case 'tip':
        return 'secondary';
      case 'release':
        return 'destructive';
      default:
        return 'outline';
    }
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
        <h1 className="text-3xl font-bold mb-2">News</h1>
        <p className="text-muted-foreground">Stay updated with the latest Dead by Daylight news</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredNews.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      icon={Newspaper}
                      title="No news found"
                      description="Try adjusting your search"
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredNews.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedNews(item)}
                        className={`w-full text-left p-4 hover:bg-accent/50 transition-colors ${
                          selectedNews?.id === item.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="space-y-2">
                          <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={getTypeColor(item.itemType)} className="text-xs">
                              {item.itemType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </span>
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
          {selectedNews ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <Badge variant={getTypeColor(selectedNews.itemType)}>
                    {selectedNews.itemType}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedNews.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-2xl">{selectedNews.title}</CardTitle>
                <CardDescription>By {selectedNews.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{selectedNews.description}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16">
                <EmptyState
                  icon={Newspaper}
                  title="Select a news item"
                  description="Choose a news item from the list to read more"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
