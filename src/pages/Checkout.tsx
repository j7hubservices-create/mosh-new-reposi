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

const statesInNigeria = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryMethod: "doorstep" as "doorstep" | "park" | "pickup",
    state: "",
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
      toast.success("Order placed successfully!");
      navigate("/thank-you");
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
        <div className="bg-purple-100 text-purple-800 text-sm p-3 rounded-lg mb-6 font-medium text-center">
          ⚠️ Please make sure you screenshot your order.
        </div>

        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Order Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Method */}
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
                    {[
                      { id: "doorstep", label: "Doorstep", icon: <Truck className="h-6 w-6 mb-2" /> },
                      { id: "park", label: "Park", icon: <Package className="h-6 w-6 mb-2" /> },
                      { id: "pickup", label: "Pickup", icon: <Store className="h-6 w-6 mb-2" /> },
                    ].map((m) => (
                      <div key={m.id}>
                        <RadioGroupItem
                          value={m.id}
                          id={m.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={m.id}
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-purple-200 bg-white p-4 hover:bg-purple-50 peer-data-[state=checked]:border-purple-500 cursor-pointer transition"
                        >
                          {m.icon}
                          <span className="font-semibold">{m.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Basic Info */}
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

                {/* Address / Park / Pickup */}
                {formData.deliveryMethod === "doorstep" && (
                  <>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        list="nigerian-states"
                        id="state"
                        placeholder="Select your state"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        required
                      />
                      <datalist id="nigerian-states">
                        {statesInNigeria.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>
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
                  </>
                )}
              </form>
            </Card>
          </div>

          {/* RIGHT SECTION - ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-4">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.products.name} x {item.quantity}</span>
                    <span className="font-semibold">
                      ₦{(item.products.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-xl border-t pt-3 mb-4">
                <span>Total</span>
                <span className="text-purple-600">
                  ₦{getTotalPrice().toLocaleString()}
                </span>
              </div>

              {/* PAYMENT METHODS */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Payment Method</h3>
                <RadioGroup
                  value={selectedPayment}
                  onValueChange={(v) => setSelectedPayment(v)}
                  className="space-y-3"
                >
                  <div>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      Card Payment
                    </Label>
                    {selectedPayment === "card" && (
                      <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => setShowConfirm(true)}
                        >
                          Pay Now
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="bank" id="bank" />
                      Bank Transfer
                    </Label>
                    {selectedPayment === "bank" && (
                      <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-200 text-sm">
                        <p><strong>Account Number:</strong> 6142257816</p>
                        <p><strong>Bank:</strong> OPay</p>
                        <p><strong>Account Name:</strong> Mosh Apparels Ventures</p>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-3">Proceed to secure payment?</h3>
            <p className="text-sm text-gray-500 mb-6">
              You’ll be redirected to complete payment securely.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  setShowConfirm(false);
                  handleSubmit();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
