import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import SafeImage from "./ui/safe-image";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  size?: string;
  stock: number;
}

export const ProductCard = ({ id, name, price, original_price, image_url, size, stock }: ProductCardProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (stock === 0) {
      toast.error("This item is out of stock");
      return;
    }

    try {
      if (user) {
        // Authenticated user - save to database
        const { data: existing } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({ user_id: user.id, product_id: id, quantity: 1 });
        }
      } else {
        // Guest user - save to localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingIndex = guestCart.findIndex((item: any) => item.product_id === id);
        
        if (existingIndex > -1) {
          guestCart[existingIndex].quantity += 1;
        } else {
          guestCart.push({ product_id: id, quantity: 1 });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      }

      toast.success("Added to cart!");
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-all hover:shadow-elevated h-full flex flex-col"
      onClick={() => navigate(`/products/${id}`)}
    >
      <CardContent className="p-0 flex-shrink-0">
        <div className="relative w-full aspect-square overflow-hidden bg-muted">
          <SafeImage
            src={image_url}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 sm:gap-3 p-3 sm:p-4 flex-1">
        <div className="w-full flex-1">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-2">{name}</h3>
          <div className="flex items-center gap-2 mt-1 sm:mt-2 flex-wrap">
            {original_price && (
              <span className="text-sm sm:text-base line-through text-muted-foreground">₦{original_price.toLocaleString()}</span>
            )}
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">₦{price.toLocaleString()}</p>
            {original_price && (
              <span className="text-xs sm:text-sm text-green-600 font-semibold">
                {Math.round(((original_price - price) / original_price) * 100)}% OFF
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
            {size && <span className="text-xs sm:text-sm text-muted-foreground">Size {size}</span>}
            {stock === 0 && (
              <p className="text-xs sm:text-sm text-destructive">Out of Stock</p>
            )}
          </div>
        </div>
        <Button
          className="w-full text-sm sm:text-base"
          onClick={handleAddToCart}
          disabled={stock === 0}
          size="sm"
        >
          <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
