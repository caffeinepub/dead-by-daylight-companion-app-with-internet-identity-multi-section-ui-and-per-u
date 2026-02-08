import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Character, Perk, NewsItem, WikiEntry, UserData } from '../backend';

// Characters
export function useGetCharacters() {
  const { actor, isFetching } = useActor();

  return useQuery<Character[]>({
    queryKey: ['characters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCharacters();
    },
    enabled: !!actor && !isFetching,
  });
}

// Perks
export function useGetPerks() {
  const { actor, isFetching } = useActor();

  return useQuery<Perk[]>({
    queryKey: ['perks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPerks();
    },
    enabled: !!actor && !isFetching,
  });
}

// News
export function useGetNews() {
  const { actor, isFetching } = useActor();

  return useQuery<NewsItem[]>({
    queryKey: ['news'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNews();
    },
    enabled: !!actor && !isFetching,
  });
}

// Wiki
export function useGetWikiEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<WikiEntry[]>({
    queryKey: ['wikiEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWikiEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

// User Data
export function useGetCallerData() {
  const { actor, isFetching } = useActor();

  return useQuery<UserData | null>({
    queryKey: ['callerData'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerData();
      } catch (error: any) {
        if (error.message?.includes('No data found')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveUserData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveUserData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerData'] });
    },
  });
}
