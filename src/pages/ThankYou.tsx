import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, CreditCard, MapPin, User } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    orderNumber,
    orderItems = [],
    totalAmount = 0,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    deliveryMethod,
    paymentMethod,
  } = (location.state as any) || {};

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          {orderNumber && (
            <p className="text-sm text-gray-500 mb-4">Order # {orderNumber}</p>
          )}

          <p className="text-gray-700 mb-6">
            Your order has been received and is pending payment confirmation.  
            Please ensure your payment matches your order reference.
          </p>

          {/* 🧾 Customer Details */}
          {(customerName || customerEmail || customerPhone) && (
            <div className="text-left mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Contact Details
              </h2>
              <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-700 space-y-1">
                {customerName && <p><strong>Name:</strong> {customerName}</p>}
                {customerEmail && <p><strong>Email:</strong> {customerEmail}</p>}
                {customerPhone && <p><strong>Phone:</strong> {customerPhone}</p>}
                {customerAddress && <p><strong>Address:</strong> {customerAddress}</p>}
                {deliveryMethod && <p><strong>Delivery Method:</strong> {deliveryMethod}</p>}
                {paymentMethod && <p><strong>Payment Method:</strong> {paymentMethod}</p>}
              </div>
            </div>
          )}

          {/* 🧮 Order Summary */}
          {orderItems.length > 0 && (
            <div className="text-left mb-6">
              <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
              <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                {orderItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-purple-700 mt-2 border-t pt-2">
                  <span>Total</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* 💳 Payment Instructions */}
          <div className="mb-6 text-left">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Payment Instructions
            </h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Bank Name:</strong> OPay</p>
              <p><strong>Account Name:</strong> Mosh Apparels Ventures</p>
              <p><strong>Account Number:</strong> 6142257816</p>
              <p>Use your <strong>name or order number</strong> as payment reference.</p>
            </div>
          </div>

          {/* 🚚 Delivery Info */}
          <div className="mb-6 text-left">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Delivery
            </h2>
            <p className="text-sm text-gray-700">
              Your order will be delivered according to the method you selected at checkout.
            </p>
          </div>

          {/* 🔘 Buttons */}
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white w-full md:w-auto"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => window.print()}
            >
              Print Order
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
