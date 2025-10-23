import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Truck, Store, MapPin, Package } from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  deliveryMethod: z.string(),
});

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryMethod: "doorstep" as "doorstep" | "park" | "pickup",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCart(session.user.id);
        setFormData((prev) => ({ ...prev, email: session.user.email || "" }));
      } else {
        fetchGuestCart();
      }
    });
  }, []);

  const fetchCart = async (userId: string) => {
    const { data } = await supabase
      .from("cart_items")
      .select("*, products (*)")
      .eq("user_id", userId);

    if (!data?.length) {
      navigate("/cart");
    } else {
      setCartItems(data);
    }
    setLoading(false);
  };

  const fetchGuestCart = async () => {
    setLoading(true);
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    if (!guestCart.length) {
      navigate("/cart");
      return;
    }

    const productIds = guestCart.map((item: any) => item.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (products) {
      const cartData = guestCart
        .map((item: any) => ({
          id: item.product_id,
          product_id: item.product_id,
          quantity: item.quantity,
          products: products.find((p) => p.id === item.product_id),
        }))
        .filter((item: any) => item.products);
      setCartItems(cartData);
    }
    setLoading(false);
  };

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) => total + item.products.price * item.quantity,
      0
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      checkoutSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (user) {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            total: getTotalPrice(),
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_address:
              formData.deliveryMethod === "doorstep"
                ? formData.address
                : formData.deliveryMethod === "park"
                ? "Park Delivery"
                : "Pickup",
            delivery_method: formData.deliveryMethod,
            status: "pending",
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItems = cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.products.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        await supabase.from("cart_items").delete().eq("user_id", user.id);
      } else {
        toast.success("Order details collected! Please complete payment.");
        localStorage.removeItem("guestCart");
      }

      toast.success("Order placed successfully!");
      window.dispatchEvent(new Event("cart-updated"));
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Order Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Method Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Fulfillment Method *
                  </Label>
                  <RadioGroup
                    value={formData.deliveryMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deliveryMethod: value })
                    }
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="doorstep"
                        id="doorstep"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="doorstep"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <Truck className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Doorstep</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Delivered to your home
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem
                        value="park"
                        id="park"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="park"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <Package className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Park</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Pick up at nearest park
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem
                        value="pickup"
                        id="pickup"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="pickup"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <Store className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Pickup</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Collect in store
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Contact Information */}
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Conditional Address Field */}
                {formData.deliveryMethod === "doorstep" && (
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows={3}
                      placeholder="Enter your complete delivery address"
                      required
                    />
                  </div>
                )}

                {formData.deliveryMethod === "park" && (
                  <div>
                    <Label htmlFor="address">Nearest Park/Bus Terminal *</Label>
                    <Input
                      id="address"
                      placeholder="E.g. Jibowu Park, Lagos"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

                {formData.deliveryMethod === "pickup" && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Pickup Location
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      9, Bolanle Awosika Street, Coca Cola Road, Oju Oore, Ota,
                      Ogun State
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll receive an SMS when your order is ready for pickup.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </Card>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.products.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₦{(item.products.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-xl border-t pt-3 mb-4">
                <span>Total</span>
                <span className="text-primary">
                  ₦{getTotalPrice().toLocaleString()}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
