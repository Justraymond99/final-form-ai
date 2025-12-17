import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/hooks/use-toast';

export type GenerationType = 'workout' | 'nutrition' | 'insights' | 'recovery';

export interface GenerationHistoryItem {
  id: string;
  user_id: string;
  generation_type: GenerationType;
  title: string | null;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

export const useGenerationHistory = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (type?: GenerationType) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = (supabase
        .from('generation_history') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (type) {
        query = query.eq('generation_type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory((data as GenerationHistoryItem[]) || []);
    } catch (error) {
      console.error('Error fetching generation history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveGeneration = useCallback(async (
    type: GenerationType,
    content: Record<string, unknown>,
    title?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase
        .from('generation_history') as any)
        .insert({
          user_id: user.id,
          generation_type: type,
          title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`,
          content,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setHistory(prev => [data as GenerationHistoryItem, ...prev]);
      
      return data as GenerationHistoryItem;
    } catch (error) {
      console.error('Error saving generation:', error);
      toast({
        title: "Failed to save",
        description: "Could not save generation to history",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  const deleteGeneration = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from('generation_history') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Deleted",
        description: "Generation removed from history"
      });
      return true;
    } catch (error) {
      console.error('Error deleting generation:', error);
      toast({
        title: "Failed to delete",
        description: "Could not remove generation",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  const toggleSaved = useCallback(async (id: string, isSaved: boolean) => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from('generation_history') as any)
        .update({ is_saved: isSaved })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, is_saved: isSaved } : item
      ));
      
      toast({
        title: isSaved ? "Saved" : "Unsaved",
        description: isSaved ? "Added to saved items" : "Removed from saved items"
      });
      return true;
    } catch (error) {
      console.error('Error updating saved status:', error);
      return false;
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  return {
    history,
    loading,
    fetchHistory,
    saveGeneration,
    deleteGeneration,
    toggleSaved,
  };
};
