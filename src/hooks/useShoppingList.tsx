import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";

interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  unit: string | null;
  brand: string | null;
  is_purchased: boolean;
  estimated_price: number | null;
  created_at: string;
}

interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  store_preference: string | null;
  created_at: string;
  updated_at: string;
  items?: ShoppingListItem[];
}

export const useShoppingList = () => {
  const { user } = useSecureAuth();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShoppingLists = async () => {
    if (!user) {
      setShoppingLists([]);
      setLoading(false);
      return;
    }

    try {
      const { data: lists, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch items for each list
      const listsWithItems = await Promise.all(
        (lists || []).map(async (list) => {
          const { data: items } = await supabase
            .from('shopping_list_items')
            .select('*')
            .eq('shopping_list_id', list.id)
            .order('created_at', { ascending: true });

          return { ...list, items: items || [] };
        })
      );

      setShoppingLists(listsWithItems);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingLists();
  }, [user]);

  const createShoppingListFromMealPlan = async (mealPlanId: string, mealPlanName: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Get meal plan items
      const { data: mealItems, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', mealPlanId)
        .eq('user_id', user.id);

      if (itemsError) throw itemsError;

      if (!mealItems || mealItems.length === 0) {
        return { success: false, error: 'No items found in this meal plan' };
      }

      // Create shopping list
      const { data: list, error: listError } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: `Groceries for ${mealPlanName}`,
        })
        .select()
        .single();

      if (listError) throw listError;

      // Aggregate ingredients by food name
      const ingredientMap = new Map<string, { quantity: number; unit: string }>();
      
      mealItems.forEach((item) => {
        const key = item.food_name.toLowerCase();
        const existing = ingredientMap.get(key);
        
        if (existing) {
          // Try to combine quantities if units match
          if (existing.unit === item.unit) {
            existing.quantity += item.quantity;
          } else {
            // Different units, keep separate
            ingredientMap.set(`${key}_${item.unit}`, {
              quantity: item.quantity,
              unit: item.unit
            });
          }
        } else {
          ingredientMap.set(key, {
            quantity: item.quantity,
            unit: item.unit
          });
        }
      });

      // Create shopping list items
      const shoppingItems = Array.from(ingredientMap.entries()).map(([name, data]) => ({
        shopping_list_id: list.id,
        user_id: user.id,
        product_name: name.split('_')[0].charAt(0).toUpperCase() + name.split('_')[0].slice(1),
        quantity: Math.ceil(data.quantity),
        unit: data.unit,
        is_purchased: false,
      }));

      const { error: insertError } = await supabase
        .from('shopping_list_items')
        .insert(shoppingItems);

      if (insertError) throw insertError;

      await fetchShoppingLists();
      return { success: true, listId: list.id };
    } catch (error) {
      console.error('Error creating shopping list:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const createShoppingListFromItems = async (planName: string, items: string[]) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Create shopping list
      const { data: list, error: listError } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: `Groceries for ${planName}`,
        })
        .select()
        .single();

      if (listError) throw listError;

      // Aggregate quantities for duplicate items
      const itemMap = new Map<string, number>();
      
      items.forEach(item => {
        const key = item.toLowerCase().trim();
        if (itemMap.has(key)) {
          itemMap.set(key, itemMap.get(key)! + 1);
        } else {
          itemMap.set(key, 1);
        }
      });

      // Create shopping list items
      const shoppingItems = Array.from(itemMap.entries()).map(([name, quantity]) => ({
        shopping_list_id: list.id,
        user_id: user.id,
        product_name: name.charAt(0).toUpperCase() + name.slice(1),
        quantity: quantity,
        unit: 'piece',
        is_purchased: false,
      }));

      const { error: insertError } = await supabase
        .from('shopping_list_items')
        .insert(shoppingItems);

      if (insertError) throw insertError;

      await fetchShoppingLists();
      return { success: true, listId: list.id };
    } catch (error) {
      console.error('Error creating shopping list from items:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const toggleItemPurchased = async (itemId: string, isPurchased: boolean) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ is_purchased: isPurchased })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setShoppingLists(lists =>
        lists.map(list => ({
          ...list,
          items: list.items?.map(item =>
            item.id === itemId ? { ...item, is_purchased: isPurchased } : item
          )
        }))
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteShoppingList = async (listId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Delete items first (cascade should handle this, but let's be explicit)
      await supabase
        .from('shopping_list_items')
        .delete()
        .eq('shopping_list_id', listId)
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) throw error;

      setShoppingLists(lists => lists.filter(list => list.id !== listId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const addItemToList = async (listId: string, productName: string, quantity: number, unit: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert({
          shopping_list_id: listId,
          user_id: user.id,
          product_name: productName,
          quantity,
          unit,
          is_purchased: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setShoppingLists(lists =>
        lists.map(list =>
          list.id === listId
            ? { ...list, items: [...(list.items || []), data] }
            : list
        )
      );

      return { success: true, item: data };
    } catch (error) {
      console.error('Error adding item:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const removeItemFromList = async (itemId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setShoppingLists(lists =>
        lists.map(list => ({
          ...list,
          items: list.items?.filter(item => item.id !== itemId)
        }))
      );

      return { success: true };
    } catch (error) {
      console.error('Error removing item:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    shoppingLists,
    loading,
    createShoppingListFromMealPlan,
    createShoppingListFromItems,
    toggleItemPurchased,
    deleteShoppingList,
    addItemToList,
    removeItemFromList,
    refetch: fetchShoppingLists,
  };
};
