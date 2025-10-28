import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Truck, Store, MapPin, Package, Banknote } from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  deliveryMethod: z.string(),
});

const Checkout = () => {
  const navigate = useNavigate();
  const paymentRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const productIds = guestCart.map((i: any) => i.product_id);
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
          products: products.find((p: any) => p.id === item.product_id),
        }))
        .filter((x: any) => x.products);
      setCartItems(cartData);
    }
    setLoading(false);
  };

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.products.price * item.quantity, 0);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      checkoutSchema.parse(formData);
      toast.success("Delivery details saved. Please confirm your payment below.");
      setTimeout(() => {
        paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.errors[0].message);
    }
  };

  const handleConfirmOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      checkoutSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error("Please complete delivery details: " + err.errors[0].message);
        return;
      }
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        user_id: user?.id ?? null,
        total: getTotalPrice(),
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address:
          formData.deliveryMethod === "doorstep"
            ? formData.address
            : formData.deliveryMethod === "park"
            ? `Park: ${formData.address}`
            : "Pickup - 9, Bolanle Awosika Street, Coca Cola Road, Oju Oore, Ota, Ogun State",
        delivery_method: formData.deliveryMethod,
        payment_method: "bank_transfer",
        status: "pending",
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();
      if (orderError) throw orderError;

      const orderItems = cartItems.map((it) => ({
        order_id: order.id,
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.products.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      if (user) {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
      } else {
        localStorage.removeItem("guestCart");
      }

      setShowBankModal(true);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err: any) {
      toast.error(err?.message || "Order submission failed");
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="text-center bg-purple-50 border border-purple-100 text-purple-800 text-sm py-3 px-4 rounded-md mb-6">
          ⚠️ Please screenshot your order or save your order reference.
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Summary */}
          <div className="order-1 lg:order-2 lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items in cart.</p>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.products.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">
                        ₦{(item.products.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center font-bold text-lg border-t pt-3 mb-4">
                <span>Total</span>
                <span className="text-purple-700">
                  ₦{getTotalPrice().toLocaleString()}
                </span>
              </div>

              {/* Bank Transfer Section */}
              <div ref={paymentRef}>
                <h3 className="text-lg font-semibold mb-3">Bank Transfer</h3>

                <div className="border rounded-lg p-4 bg-white space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Banknote className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Pay directly to our account</div>
                      <div className="text-xs text-muted-foreground">
                        Use your name as payment reference
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <div>
                      <strong>Account Name:</strong> Mosh Apparels Ventures
                    </div>
                    <div>
                      <strong>Bank:</strong> OPay
                    </div>
                    <div>
                      <strong>Account Number:</strong> 6142257816
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    After transfer, click <strong>“I have paid — Confirm Order”</strong>.
                  </div>

                  <Button
                    onClick={handleConfirmOrder}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "I have paid — Confirm Order"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Delivery Form */}
          {/* Delivery Form — appears after summary on mobile */}
<div className="order-2 lg:order-1 lg:col-span-2">

            <Card className="p-6">
             <div className="grid gap-8 lg:grid-cols-3">
  {/* Order Summary first for mobile */}
  <div className="order-1 lg:order-2 lg:col-span-1">


              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
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
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="phone">Phone</Label>
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

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Fulfillment Method
                  </Label>
                  <RadioGroup
                    value={formData.deliveryMethod}
                    onValueChange={(v) =>
                      setFormData({ ...formData, deliveryMethod: v as any })
                    }
                    className="grid grid-cols-3 gap-3"
                  >
                    <LabelOption
                      value="doorstep"
                      label="Doorstep"
                      description="Delivered to your address"
                      icon={<Truck className="h-4 w-4 text-purple-600" />}
                      formData={formData}
                    />
                    <LabelOption
                      value="park"
                      label="Park"
                      description="Pick up at nearest park / terminal"
                      icon={<Package className="h-4 w-4 text-purple-600" />}
                      formData={formData}
                    />
                    <LabelOption
                      value="pickup"
                      label="Pickup"
                      description="Collect from store"
                      icon={<Store className="h-4 w-4 text-purple-600" />}
                      formData={formData}
                    />
                  </RadioGroup>
                </div>

                {formData.deliveryMethod !== "pickup" && (
                  <div>
                    <Label htmlFor="address">
                      {formData.deliveryMethod === "doorstep"
                        ? "Delivery Address"
                        : "Nearest Park / Terminal"}
                    </Label>
                    <Textarea
                      id="address"
                      rows={3}
                      placeholder={
                        formData.deliveryMethod === "doorstep"
                          ? "Street, house number, area"
                          : "Nearest park / terminal"
                      }
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

                {formData.deliveryMethod === "pickup" && (
                  <div className="bg-purple-50 border border-purple-100 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Pickup location</div>
                        <div className="text-sm text-muted-foreground">
                          9, Bolanle Awosika Street, Coca Cola Road, Oju Oore,
                          Ota, Ogun State
                        </div>
                      </div>
                    </div>
                    <div className="text-xs mt-2 text-muted-foreground">
                      We’ll notify you when your order is ready for pickup.
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save & Continue
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-3">Order Confirmed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Thank you — your order has been recorded as pending while we await
              payment confirmation. Please keep your payment receipt and a
              screenshot of this order.
            </p>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Account Name:</strong> Mosh Apparels Ventures
              </div>
              <div>
                <strong>Bank:</strong> OPay
              </div>
              <div>
                <strong>Account Number:</strong> 6142257816
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBankModal(false);
                  navigate("/");
                }}
              >
                Done
              </Button>
              <Button
                onClick={() => {
                  setShowBankModal(false);
                  navigate("/thank-you");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                I’ve Paid — Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// helper component for radio options
const LabelOption = ({
  value,
  label,
  description,
  icon,
  formData,
}: any) => (
  <div>
    <RadioGroupItem value={value} id={value} className="peer sr-only" />
    <Label
      htmlFor={value}
      className={`p-3 rounded-md border ${
        formData.deliveryMethod === value
          ? "border-purple-500 bg-purple-50"
          : "border-muted bg-white"
      } cursor-pointer block`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </Label>
  </div>
);

export default Checkout;
