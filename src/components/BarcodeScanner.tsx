import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scan, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BarcodeScannerProps {
  onFoodFound: (foodData: any) => void;
}

export const BarcodeScanner = ({ onFoodFound }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isScanning) {
      const newScanner = new Html5QrcodeScanner(
        "barcode-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      newScanner.render(
        async (decodedText) => {
          console.log('Barcode scanned:', decodedText);
          
          // Look up product in food database
          try {
            const { data, error } = await supabase.functions.invoke('search-food', {
              body: { barcode: decodedText }
            });

            if (error) throw error;

            if (data && data.foods && data.foods.length > 0) {
              const food = data.foods[0];
              onFoodFound({
                ...food,
                barcode: decodedText
              });
              toast({
                title: "Food found!",
                description: `${food.food_name} - ${food.calories} cal`,
              });
              setIsScanning(false);
              newScanner.clear();
            } else {
              toast({
                title: "Product not found",
                description: "Try searching manually or add custom food",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error('Error looking up barcode:', error);
            toast({
              title: "Lookup failed",
              description: "Could not find product information",
              variant: "destructive",
            });
          }
        },
        (error) => {
          console.warn('Barcode scan error:', error);
        }
      );

      setScanner(newScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const handleClose = () => {
    if (scanner) {
      scanner.clear().catch(console.error);
    }
    setIsScanning(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsScanning(true)}
        variant="outline"
        className="w-full"
      >
        <Scan className="mr-2 h-4 w-4" />
        Scan Barcode
      </Button>

      <Dialog open={isScanning} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Scan Food Barcode
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Position the barcode within the frame to scan
            </p>
            <div id="barcode-reader" className="w-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
