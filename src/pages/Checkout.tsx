import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  Truck,
  Store,
  MapPin,
  Package,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  const [showDelivery, setShowDelivery] = useState(false);
  const [showContact, setShowContact] = useState(false);

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
    if (!data?.length) navigate("/cart");
    else setCartItems(data);
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

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="bg-purple-100 text-purple-900 text-sm font-medium py-3 px-4 rounded-lg mb-6 text-center shadow">
          ⚠️ Please make sure you <b>screenshot your order confirmation</b> or
          save your order number for reference.
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-purple-700">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Section */}
            <Card
              className="p-6 border-purple-200 cursor-pointer"
              onClick={() => setShowDelivery(!showDelivery)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-purple-700">
                  Delivery Method
                </h2>
                {showDelivery ? (
                  <ChevronUp className="h-5 w-5 text-purple-700" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-purple-700" />
                )}
              </div>

              {showDelivery && (
                <div className="mt-4">
                  <RadioGroup
                    value={formData.deliveryMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deliveryMethod: value })
                    }
                    className="grid sm:grid-cols-3 gap-3"
                  >
                    {[
                      { id: "doorstep", label: "Doorstep", icon: Truck },
                      { id: "park", label: "Park", icon: Package },
                      { id: "pickup", label: "Pickup", icon: Store },
                    ].map(({ id, label, icon: Icon }) => (
                      <Label
                        key={id}
                        className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center transition ${
                          formData.deliveryMethod === id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, deliveryMethod: id })
                        }
                      >
                        <Icon className="h-5 w-5 mb-1 text-purple-600" />
                        {label}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </Card>

            {/* Contact Section */}
            <Card
              className="p-6 border-purple-200 cursor-pointer"
              onClick={() => setShowContact(!showContact)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-purple-700">
                  Contact Information
                </h2>
                {showContact ? (
                  <ChevronUp className="h-5 w-5 text-purple-700" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-purple-700" />
                )}
              </div>

              {showContact && (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Phone *</Label>
                    <Input
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
                      <Label>Delivery Address *</Label>
                      <Textarea
                        rows={3}
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  )}
                </form>
              )}
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-purple-700">
                Order Summary
              </h2>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-2">
                  <span>
                    {item.products.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-purple-700">
                    ₦{(item.products.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="flex justify-between font-bold border-t pt-3 mt-3 text-lg">
                <span>Total</span>
                <span className="text-purple-700">
                  ₦{getTotalPrice().toLocaleString()}
                </span>
              </div>
            </Card>

            {/* PAYMENT METHOD */}
            <Card className="p-6 border-purple-300 shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-3">
                Payment Method
              </h2>

              {/* Bank Transfer */}
              <div className="border rounded-lg p-4 mb-4 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="text-purple-700 h-5 w-5" />
                  <span className="font-medium">Bank Transfer</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Account Number: <b>6142257816</b> <br />
                  Bank: <b>OPay</b> <br />
                  Account Name: <b>Mosh Apparels Ventures</b>
                </p>
              </div>

              {/* Card Payment */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="text-purple-700 h-5 w-5" />
                  <span className="font-medium">Card Payment</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <img src="/visa.png" alt="Visa" className="h-6" />
                  <img src="/mastercard.png" alt="MasterCard" className="h-6" />
                  <img src="/verve.png" alt="Verve" className="h-6" />
                </div>

                {/* Hidden Paystack button (for live use later) */}
                <Button
                  size="lg"
                  className="w-full bg-purple-600 text-white mt-2"
                  disabled
                >
                  Pay with Card (Coming Soon)
                </Button>
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
