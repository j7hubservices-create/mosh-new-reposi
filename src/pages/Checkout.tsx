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
});

const statesInNigeria = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // showPaymentPanel used to show card inputs (only when card selected)
  const [selectedPayment, setSelectedPayment] = useState<"card" | "bank" | "none">("none");
  const [showCardInputs, setShowCardInputs] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    deliveryMethod: "doorstep" as "doorstep" | "park" | "pickup",
  });

  const [cardData, setCardData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCart(session.user.id);
        setFormData(prev => ({ ...prev, email: session.user.email || "" }));
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

    const productIds = guestCart.map((i:any) => i.product_id);
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
          products: products.find((p:any) => p.id === item.product_id),
        }))
        .filter((x:any) => x.products);
      setCartItems(cartData);
    }
    setLoading(false);
  };

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.products.price * item.quantity, 0);

  // Submit the delivery & contact info first (validate). Payment handled separately.
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      checkoutSchema.parse(formData);
      toast.success("Delivery details saved. Please select a payment option below.");
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.errors[0].message);
    }
  };

  // Comprehensive payment handler with full validation
  const handlePayNow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // First, validate delivery details
    try {
      checkoutSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error("Please complete delivery details: " + err.errors[0].message);
        return;
      }
    }

    // Validate payment method is selected
    if (selectedPayment === "none") {
      toast.error("Please select a payment method");
      return;
    }

    // If card selected, validate card fields
    if (selectedPayment === "card") {
      if (!cardData.cardName.trim()) {
        toast.error("Enter cardholder name");
        return;
      }
      if (cardData.cardNumber.replace(/\s+/g, "").length < 16) {
        toast.error("Enter a valid 16-digit card number");
        return;
      }
      if (!cardData.expiry.trim() || cardData.expiry.length < 5) {
        toast.error("Enter valid expiry date (MM/YY)");
        return;
      }
      if (!cardData.cvv.trim() || cardData.cvv.length < 3) {
        toast.error("Enter valid CVV");
        return;
      }
    }

    setSubmitting(true);
    try {
      // create an order (simulate). In production you would call payment API then create order after successful payment.
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          total: getTotalPrice(),
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_address:
            formData.deliveryMethod === "doorstep"
              ? `${formData.address} - ${formData.state || ""}`
              : formData.deliveryMethod === "park"
              ? `Park: ${formData.address} - ${formData.state || ""}`
              : "Pickup - 9, Bolanle Awosika Street, Coca Cola Road, Oju Oore, Ota, Ogun State",
          delivery_method: formData.deliveryMethod,
          payment_method: selectedPayment === "card" ? "card" : "bank_transfer",
          status: selectedPayment === "card" ? "paid" : "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(it => ({
        order_id: order.id,
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.products.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // clear cart
      if (user) {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
      } else {
        localStorage.removeItem("guestCart");
      }

      toast.success("Order confirmed — thank you!");
      window.dispatchEvent(new Event('cart-updated'));
      navigate("/thank-you");
    } catch (err: any) {
      toast.error(err?.message || "Payment / order failed");
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
        {/* top message */}
        <div className="bg-purple-50 border border-purple-100 text-purple-800 text-sm py-3 px-4 rounded-md mb-6 text-center">
          ⚠️ Please make sure you <strong>screenshot your order</strong> or save your order reference.
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* RIGHT SECTION (Order summary + payment) — on mobile it appears first */}
          <div className="order-1 lg:order-2 lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items in cart.</p>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.products.name}</div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
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
                <span className="text-purple-700">₦{getTotalPrice().toLocaleString()}</span>
              </div>

              {/* Payment area: visible on right panel */}
              <div className="mt-2">
                <h3 className="text-lg font-semibold mb-3">Payment</h3>

                {/* Bank transfer — always visible */}
                <div className="border rounded-lg p-4 mb-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-xs text-muted-foreground">Pay directly to our account</div>
                      </div>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === "bank"}
                        onChange={() => { setSelectedPayment("bank"); setShowCardInputs(false); }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground">
                    <div><strong>Account Name:</strong> Mosh Apparels Ventures</div>
                    <div><strong>Bank:</strong> OPay</div>
                    <div><strong>Account Number:</strong> 6142257816</div>
                    <div className="mt-2 text-xs">Please screenshot your order after payment and keep your receipt.</div>
                  </div>
                </div>

                {/* Card payment */}
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Card Payment</div>
                        <div className="text-xs text-muted-foreground">Pay with card (Visa, Mastercard, Verve)</div>
                      </div>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === "card"}
                        onChange={() => { setSelectedPayment("card"); setShowCardInputs(true); }}
                      />
                    </div>
                  </div>

                  {/* Card inputs shown only when selected */}
                  {selectedPayment === "card" && (
                    <form onSubmit={handlePayNow} className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Cardholder name</Label>
                          <Input
                            value={cardData.cardName}
                            onChange={(e) => setCardData({...cardData, cardName: e.target.value})}
                            placeholder="Full name as on card"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Card number</Label>
                          <Input
                            value={cardData.cardNumber}
                            onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Expiry (MM/YY)</Label>
                          <Input
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">CVV</Label>
                          <Input
                            value={cardData.cvv}
                            onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 items-center">
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={submitting}>
                          {submitting ? "Processing..." : "Pay Now"}
                        </Button>
                        <div className="text-sm text-muted-foreground">Secure payment — card details handled safely.</div>
                      </div>
                    </form>
                  )}

                  {/* If bank is selected, show quick pay button to continue */}
                  {selectedPayment === "bank" && (
                    <div className="mt-4">
                      <Button onClick={handlePayNow} className="bg-white border border-purple-200 text-purple-700" disabled={submitting}>
                        I have paid — Confirm Order
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* LEFT SECTION (Delivery & contact) — appears second on mobile, left on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Delivery Information</h2>

              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} required />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} required />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} required />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Fulfillment Method</Label>
                  <RadioGroup value={formData.deliveryMethod} onValueChange={(v)=>setFormData({...formData, deliveryMethod: v as any})} className="grid grid-cols-3 gap-3">
                    <div>
                      <RadioGroupItem value="doorstep" id="doorstep" className="peer sr-only" />
                      <Label htmlFor="doorstep" className={`p-3 rounded-md border ${formData.deliveryMethod === "doorstep" ? "border-purple-500 bg-purple-50" : "border-muted"} cursor-pointer`}>
                        <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-purple-600" /><span className="text-sm font-medium">Doorstep</span></div>
                        <div className="text-xs text-muted-foreground">Delivered to your address</div>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem value="park" id="park" className="peer sr-only" />
                      <Label htmlFor="park" className={`p-3 rounded-md border ${formData.deliveryMethod === "park" ? "border-purple-500 bg-purple-50" : "border-muted"} cursor-pointer`}>
                        <div className="flex items-center gap-2"><Package className="h-4 w-4 text-purple-600" /><span className="text-sm font-medium">Park</span></div>
                        <div className="text-xs text-muted-foreground">Pick up at nearest park / terminal</div>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                      <Label htmlFor="pickup" className={`p-3 rounded-md border ${formData.deliveryMethod === "pickup" ? "border-purple-500 bg-purple-50" : "border-muted"} cursor-pointer`}>
                        <div className="flex items-center gap-2"><Store className="h-4 w-4 text-purple-600" /><span className="text-sm font-medium">Pickup</span></div>
                        <div className="text-xs text-muted-foreground">Collect from store</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* State selector + address area */}
                {formData.deliveryMethod !== "pickup" && (
                  <>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        list="nigerian-states"
                        id="state"
                        placeholder="Start typing to search state"
                        value={formData.state}
                        onChange={(e)=>setFormData({...formData, state: e.target.value})}
                        required
                      />
                      <datalist id="nigerian-states">
                        {statesInNigeria.map(s => <option key={s} value={s} />)}
                      </datalist>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" rows={3} placeholder={formData.deliveryMethod === "doorstep" ? "Street, house number, area" : "Nearest park / terminal"} value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} required />
                    </div>
                  </>
                )}

                {/* Pickup location display */}
                {formData.deliveryMethod === "pickup" && (
                  <div className="bg-purple-50 border border-purple-100 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Pickup location</div>
                        <div className="text-sm text-muted-foreground">
                          9, Bolanle Awosika Street, Coca Cola Road, Oju Oore, Ota, Ogun State
                        </div>
                      </div>
                    </div>
                    <div className="text-xs mt-2 text-muted-foreground">We’ll notify you when your order is ready for pickup.</div>
                  </div>
                )}

                <div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">Save & Continue</Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
