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
import { Truck, Store, MapPin, Package, CreditCard, Banknote } from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  deliveryMethod: z.string(),
  paymentMethod: z.string(),
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
    paymentMethod: "transfer" as "transfer" | "card",
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
            payment_method: formData.paymentMethod,
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
      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Info Message */}
        <div className="bg-yellow-100 text-yellow-800 text-sm font-medium py-3 px-4 rounded-lg mb-6 text-center shadow-sm">
          ⚠️ Please make sure you <b>screenshot your order confirmation</b> or save your order number for reference.
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SIDE - FORM */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Delivery Method</h2>
              <RadioGroup
                value={formData.deliveryMethod}
                onValueChange={(value) =>
                  setFormData({ ...formData, deliveryMethod: value })
                }
                className="grid sm:grid-cols-3 gap-4"
              >
                <Label
                  htmlFor="doorstep"
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center ${
                    formData.deliveryMethod === "doorstep"
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }`}
                >
                  <Truck className="h-5 w-5 mb-2" />
                  Doorstep
                </Label>
                <Label
                  htmlFor="park"
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center ${
                    formData.deliveryMethod === "park"
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }`}
                >
                  <Package className="h-5 w-5 mb-2" />
                  Park
                </Label>
                <Label
                  htmlFor="pickup"
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center ${
                    formData.deliveryMethod === "pickup"
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }`}
                >
                  <Store className="h-5 w-5 mb-2" />
                  Pickup
                </Label>
              </RadioGroup>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                {formData.deliveryMethod === "doorstep" && (
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

                {formData.deliveryMethod === "park" && (
                  <div>
                    <Label htmlFor="address">Nearest Park *</Label>
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
                    <MapPin className="h-5 w-5 inline mr-2" />
                    <span className="font-medium">Pickup at:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      9, Bolanle Awosika Street, Coca Cola Road, Oju Oore, Ota, Ogun State.
                    </p>
                  </div>
                )}

                {/* PAYMENT METHODS */}
                <div className="mt-6">
                  <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                    className="space-y-3"
                  >
                    {/* BANK TRANSFER */}
                    <div className="border rounded-xl p-4 hover:bg-accent cursor-pointer">
                      <Label className="flex items-center gap-2 font-semibold">
                        <Banknote className="h-5 w-5" /> Bank Transfer
                      </Label>
                      <p className="text-sm text-muted-foreground mt-2">
                        Account Number: <b>6142257816</b> <br />
                        Bank: <b>OPay</b> <br />
                        Account Name: <b>Mosh Apparels Ventures</b>
                      </p>
                    </div>

                    {/* CARD PAYMENT */}
                    <div className="border rounded-xl p-4 hover:bg-accent cursor-pointer">
                      <Label className="flex items-center gap-2 font-semibold">
                        <CreditCard className="h-5 w-5" /> Card Payment
                      </Label>
                      <div className="flex items-center gap-3 mt-2">
                        <img src="/visa.png" alt="Visa" className="h-6" />
                        <img src="/mastercard.png" alt="Mastercard" className="h-6" />
                        <img src="/verve.png" alt="Verve" className="h-6" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <Input placeholder="Card Number" />
                        <Input placeholder="Cardholder Name" />
                        <Input placeholder="MM/YY" />
                        <Input placeholder="CVV" />
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" size="lg" className="w-full mt-6" disabled={submitting}>
                  {submitting ? "Processing..." : "Complete Order"}
                </Button>
              </form>
            </Card>
          </div>

          {/* RIGHT SIDE - ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.products.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₦{(item.products.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-3">
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
