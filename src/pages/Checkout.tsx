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

// ✅ Form validation schema
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
  const [showPayment, setShowPayment] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryMethod: "doorstep" as "doorstep" | "park" | "pickup",
  });

  const [paymentData, setPaymentData] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // ✅ Fetch session & cart
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

  // ✅ Handle checkout form submit (before payment)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      checkoutSchema.parse(formData);
      setShowPayment(true); // show card form after details are valid
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  // ✅ Simulated Payment Handler
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentData.cardNumber.length < 16) {
      toast.error("Please enter a valid 16-digit card number");
      return;
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
            status: "paid",
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
        localStorage.removeItem("guestCart");
      }

      toast.success("Payment successful! Order confirmed 🎉");
      window.dispatchEvent(new Event("cart-updated"));
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to process payment");
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
          {/* LEFT SIDE */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">
                {showPayment ? "Card Payment" : "Order Information"}
              </h2>

              {!showPayment ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Delivery Options */}
                  <div>
                    <Label className="font-semibold mb-3 block">
                      Fulfillment Method *
                    </Label>
                    <RadioGroup
                      value={formData.deliveryMethod}
                      onValueChange={(v) =>
                        setFormData({ ...formData, deliveryMethod: v })
                      }
                      className="grid grid-cols-3 gap-4"
                    >
                      <DeliveryOption
                        value="doorstep"
                        icon={<Truck className="h-6 w-6 mb-3" />}
                        title="Doorstep"
                        desc="Delivered to your home"
                      />
                      <DeliveryOption
                        value="park"
                        icon={<Package className="h-6 w-6 mb-3" />}
                        title="Park"
                        desc="Pick up at nearest park"
                      />
                      <DeliveryOption
                        value="pickup"
                        icon={<Store className="h-6 w-6 mb-3" />}
                        title="Pickup"
                        desc="Collect in store"
                      />
                    </RadioGroup>
                  </div>

                  <InputField
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />

                  <InputField
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />

                  <InputField
                    label="Phone Number *"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />

                  {formData.deliveryMethod !== "pickup" && (
                    <Textarea
                      placeholder={
                        formData.deliveryMethod === "doorstep"
                          ? "Enter your complete delivery address"
                          : "Enter nearest park or terminal"
                      }
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows={3}
                      required
                    />
                  )}

                  <Button type="submit" size="lg" className="w-full">
                    Proceed to Payment
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePayment} className="space-y-5">
                  <InputField
                    label="Cardholder Name"
                    value={paymentData.name}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, name: e.target.value })
                    }
                  />
                  <InputField
                    label="Card Number"
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cardNumber: e.target.value,
                      })
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={paymentData.expiry}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          expiry: e.target.value,
                        })
                      }
                    />
                    <InputField
                      label="CVV"
                      placeholder="123"
                      maxLength={3}
                      value={paymentData.cvv}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          cvv: e.target.value,
                        })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Pay Now"}
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* RIGHT SIDE */}
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

// ✅ Reusable subcomponents
const InputField = ({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <Label>{label}</Label>
    <Input {...props} />
  </div>
);

const DeliveryOption = ({
  value,
  icon,
  title,
  desc,
}: {
  value: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div>
    <RadioGroupItem value={value} id={value} className="peer sr-only" />
    <Label
      htmlFor={value}
      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
    >
      {icon}
      <div className="text-center">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      </div>
    </Label>
  </div>
);

export default Checkout;
