import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Package, RefreshCw, Clock, CheckCircle } from "lucide-react";

const Returns = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Returns & Refunds Policy</h1>
            <p className="text-center text-lg text-muted-foreground">We want you to love your purchase</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">14 Days</h3>
                <p className="text-sm text-muted-foreground">Return window</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Unused Items</h3>
                <p className="text-sm text-muted-foreground">Original condition</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Easy Process</h3>
                <p className="text-sm text-muted-foreground">Hassle-free returns</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Full Refund</h3>
                <p className="text-sm text-muted-foreground">Money back guarantee</p>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Return Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We offer a 14-day return policy from the date you receive your order. If you're not completely satisfied with your purchase, you can return it for a full refund or exchange.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Eligibility Requirements</h2>
                <p className="text-muted-foreground mb-2">To be eligible for a return, items must:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Be in original, unworn, and unwashed condition</li>
                  <li>Have all original tags attached</li>
                  <li>Be returned in original packaging</li>
                  <li>Be accompanied by proof of purchase</li>
                  <li>Not be final sale or clearance items</li>
                </ul>
              </section>

              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">How to Return</h2>
                <ol className="list-decimal pl-6 text-muted-foreground space-y-3">
                  <li>Contact our customer service team through the Contact page</li>
                  <li>Receive your return authorization and instructions</li>
                  <li>Pack your items securely in original packaging</li>
                  <li>Include your order number and reason for return</li>
                  <li>Ship the package to our returns address</li>
                </ol>
              </section>

              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Refund Process</h2>
                <p className="text-muted-foreground mb-4">
                  Once we receive and inspect your return, we'll process your refund within 5-7 business days. Refunds will be issued to your original payment method. Please note that it may take additional time for your bank to process the refund.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Exchanges</h2>
                <p className="text-muted-foreground mb-4">
                  If you need a different size or color, we're happy to help! Contact us to arrange an exchange. We'll process exchanges as quickly as possible, subject to stock availability.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Shipping Costs</h2>
                <p className="text-muted-foreground mb-4">
                  Return shipping costs are the responsibility of the customer unless the return is due to our error (wrong item sent, defective product, etc.). We recommend using a trackable shipping method.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Non-Returnable Items</h2>
                <p className="text-muted-foreground mb-2">The following items cannot be returned:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Items marked as final sale</li>
                  <li>Worn or washed items</li>
                  <li>Items without original tags</li>
                  <li>Damaged items (not caused by us)</li>
                </ul>
              </section>

              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Questions?</h2>
                <p className="text-muted-foreground">
                  If you have any questions about our return and refund policy, please don't hesitate to contact us through our Contact page. We're here to help!
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Returns;