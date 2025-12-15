import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, Phone, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/currency';

const CartPanel = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPharmacyInfo, setShowPharmacyInfo] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await createOrder(cartItems);
      toast({
        title: "Réservation confirmée !",
        description: "Votre commande a été transmise à la pharmacie.",
        variant: "success",
      });
      clearCart();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create order:", error);
      toast({
        title: "Erreur de réservation",
        description: "Impossible de finaliser la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  const pharmacyName = cartItems.length > 0 ? cartItems[0].pharmacyName : "";
  const pharmacyAddress = cartItems.length > 0 ? cartItems[0].pharmacyAddress : "";

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative rounded-full w-12 h-12 p-0">
          <ShoppingCart className="h-6 w-6 text-primary" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs leading-5 text-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Votre Panier</SheetTitle>
        </SheetHeader>
        {cartItems.length > 0 ? (
          <>
            {/* Pharmacy Info Section */}
            <div className="mb-4 border rounded-lg overflow-hidden bg-muted/30">
              <button
                onClick={() => setShowPharmacyInfo(!showPharmacyInfo)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">{pharmacyName}</span>
                </div>
                {showPharmacyInfo ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {showPharmacyInfo && (
                <div className="px-4 py-3 border-t space-y-2 text-sm animate-slide-in-left">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{pharmacyAddress}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Les détails complets de votre réservation seront confirmés après validation
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.medicationId} className="flex items-center gap-4 animate-fade-in">
                    <div className="flex-1">
                      <p className="font-semibold">{item.medicationName}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.medicationId, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.medicationId, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => removeFromCart(item.medicationId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto pt-6">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <Button
                  className="w-full btn-apple-rounded bg-secondary text-secondary-foreground hover:opacity-90"
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? "Validation..." : "Valider ma réservation"}
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="font-semibold">Votre panier est vide</p>
            <p className="text-sm text-muted-foreground">Ajoutez des médicaments pour commencer.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartPanel;