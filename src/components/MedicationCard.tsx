import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, AlertCircle, CheckCircle, ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/currency";
import React from "react";

interface MedicationCardProps {
  medicationId: number;
  name: string;
  description: string;
  dosage: string;
  availability: "available" | "limited" | "unavailable";
  price: string; // Keep price as string to match CartItem type
  pharmacyId: number;
  pharmacyName: string;
  pharmacyAddress: string;
}

const MedicationCard = ({ 
  medicationId,
  name, 
  description, 
  dosage, 
  availability, 
  price,
  pharmacyId,
  pharmacyName,
  pharmacyAddress
}: MedicationCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's onClick if any
    const itemToAdd = {
      medicationId,
      medicationName: name,
      price,
      pharmacyId,
      pharmacyName,
      pharmacyAddress,
    };
    addToCart(itemToAdd);
    // Optional: Add toast notification here
  };

  const getAvailabilityIcon = () => {
    switch (availability) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case "limited":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "unavailable":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getAvailabilityText = () => {
    switch (availability) {
      case "available":
        return "Disponible";
      case "limited":
        return "Stock limité";
      case "unavailable":
        return "Non disponible";
    }
  };

  const getAvailabilityColor = () => {
    switch (availability) {
      case "available":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "limited":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "unavailable":
        return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  return (
    <Card className="card-apple p-6 split-on-hover cursor-pointer flex flex-col h-full">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg glass-accent-pink">
          <Pill className="h-5 w-5 text-accent-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground text-lg leading-tight">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {dosage}
              </p>
            </div>
            
            {price && (
              <div className="text-right">
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(price)}
                </div>
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-grow">
            {description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <Badge variant="outline" className={`flex-shrink-0 ${getAvailabilityColor()}`}>
          <div className="flex items-center gap-2">
            {getAvailabilityIcon()}
            <span>{getAvailabilityText()}</span>
          </div>
        </Badge>
        
        {availability !== "unavailable" && (
          <Button variant="ghost" size="sm" onClick={handleAddToCart} className="text-primary hover:bg-primary/10">
            <ShoppingBasket className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MedicationCard;