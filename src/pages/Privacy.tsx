import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center">Privacy Policy</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-4">
                At Mosh Wearhouse Studio, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground mb-2">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Name and contact information</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and our services</li>
                <li>Improve our products and services</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us through our Contact page.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;