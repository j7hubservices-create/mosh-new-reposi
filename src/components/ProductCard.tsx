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
  image_url: string;
  size?: string;
  stock: number;
}

export const ProductCard = ({ id, name, price, image_url, size, stock }: ProductCardProps) => {
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

    if (!user) {
      toast.error("Please login to add items to cart");
      navigate('/auth');
      return;
    }

    if (stock === 0) {
      toast.error("This item is out of stock");
      return;
    }

    try {
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

      toast.success("Added to cart!");
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-all hover:shadow-elevated"
      onClick={() => navigate(`/products/${id}`)}
    >
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden bg-muted">
          <SafeImage
            src={image_url}
            alt={name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 p-4">
        <div className="w-full">
          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-primary">₦{price.toLocaleString()}</p>
            {size && <span className="text-sm text-muted-foreground">Size {size}</span>}
          </div>
          {stock === 0 && (
            <p className="text-sm text-destructive mt-1">Out of Stock</p>
          )}
        </div>
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
