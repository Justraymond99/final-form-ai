import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Loader2, 
  Check, 
  Package,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export const ShoppingList = () => {
  const { 
    shoppingLists, 
    loading, 
    toggleItemPurchased, 
    deleteShoppingList,
    addItemToList,
    removeItemFromList 
  } = useShoppingList();
  const { toast } = useToast();
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [addingToList, setAddingToList] = useState<string | null>(null);
  const [deletingList, setDeletingList] = useState<string | null>(null);

  const handleToggleItem = async (itemId: string, isPurchased: boolean) => {
    const result = await toggleItemPurchased(itemId, isPurchased);
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteList = async (listId: string) => {
    setDeletingList(listId);
    const result = await deleteShoppingList(listId);
    if (result.success) {
      toast({
        title: "List deleted",
        description: "Shopping list has been removed.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete list",
        variant: "destructive",
      });
    }
    setDeletingList(null);
  };

  const handleAddItem = async (listId: string) => {
    if (!newItemName.trim()) return;
    
    setAddingToList(listId);
    const result = await addItemToList(listId, newItemName.trim(), 1, "piece");
    
    if (result.success) {
      setNewItemName("");
      toast({
        title: "Item added",
        description: `${newItemName} added to your list.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add item",
        variant: "destructive",
      });
    }
    setAddingToList(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    const result = await removeItemFromList(itemId);
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (shoppingLists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No shopping lists yet</p>
            <p className="text-sm">Generate one from a saved meal plan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Shopping Lists ({shoppingLists.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            {shoppingLists.map((list) => {
              const totalItems = list.items?.length || 0;
              const purchasedItems = list.items?.filter(i => i.is_purchased).length || 0;
              const isExpanded = expandedList === list.id;
              
              return (
                <div key={list.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedList(isExpanded ? null : list.id)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{list.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Package className="h-3 w-3 mr-1" />
                          {purchasedItems}/{totalItems} items
                        </Badge>
                        {purchasedItems === totalItems && totalItems > 0 && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Check className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                        disabled={deletingList === list.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {deletingList === list.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t p-4 space-y-3 bg-muted/20">
                      {/* Add new item */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add item..."
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddItem(list.id);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(list.id)}
                          disabled={addingToList === list.id || !newItemName.trim()}
                        >
                          {addingToList === list.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Item list */}
                      <div className="space-y-2">
                        {list.items?.map((item) => (
                          <div 
                            key={item.id} 
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                              item.is_purchased ? 'bg-muted/50' : 'bg-background'
                            }`}
                          >
                            <Checkbox
                              checked={item.is_purchased}
                              onCheckedChange={(checked) => 
                                handleToggleItem(item.id, checked as boolean)
                              }
                            />
                            <span className={`flex-1 ${
                              item.is_purchased ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {item.product_name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.quantity} {item.unit}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        
                        {(!list.items || list.items.length === 0) && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No items in this list
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
