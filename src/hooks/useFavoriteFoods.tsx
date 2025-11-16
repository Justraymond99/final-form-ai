import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "./useSecureAuth";
import { toast } from "@/hooks/use-toast";

interface FavoriteFood {
  id: string;
  food_name: string;
  brand: string | null;
  food_id: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sodium_mg: number | null;
  image_url: string | null;
}

export const useFavoriteFoods = () => {
  const { user } = useSecureAuth();
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_foods')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (food: Omit<FavoriteFood, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorite_foods')
        .insert({
          user_id: user.id,
          ...food,
        });

      if (error) throw error;

      toast({
        title: "Added to favorites",
        description: "Food saved to your favorites list",
      });

      await fetchFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    }
  };

  const removeFavorite = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorite_foods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Removed from favorites",
        description: "Food removed from your favorites list",
      });

      await fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (foodName: string, brand?: string | null) => {
    return favorites.some(
      f => f.food_name === foodName && f.brand === brand
    );
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};
