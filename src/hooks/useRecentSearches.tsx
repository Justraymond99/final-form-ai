import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "./useSecureAuth";

export const useRecentSearches = () => {
  const { user } = useSecureAuth();
  const [searches, setSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSearches([]);
      setLoading(false);
      return;
    }

    fetchRecentSearches();
  }, [user]);

  const fetchRecentSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('recent_searches')
        .select('search_query')
        .eq('user_id', user?.id)
        .order('searched_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get unique searches
      const uniqueSearches = Array.from(new Set(data?.map(s => s.search_query) || []));
      setSearches(uniqueSearches);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecentSearch = async (query: string) => {
    if (!user || !query.trim()) return;

    try {
      await supabase
        .from('recent_searches')
        .insert({
          user_id: user.id,
          search_query: query.trim(),
        });

      // Refresh the list
      await fetchRecentSearches();
    } catch (error) {
      console.error('Error adding recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    if (!user) return;

    try {
      await supabase
        .from('recent_searches')
        .delete()
        .eq('user_id', user.id);

      setSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  return {
    searches,
    loading,
    addRecentSearch,
    clearRecentSearches,
  };
};
