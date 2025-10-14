import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center">Terms of Service</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Mosh Wearhouse Studio's website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Use of Service</h2>
              <p className="text-muted-foreground mb-2">You agree to use our service only for lawful purposes. You must not:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Interfere with the security of the service</li>
                <li>Attempt unauthorized access to our systems</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Product Information</h2>
              <p className="text-muted-foreground">
                We strive to provide accurate product descriptions and images. However, we do not guarantee that product descriptions, colors, or other content is accurate, complete, or error-free.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Pricing and Payment</h2>
              <p className="text-muted-foreground">
                All prices are in Nigerian Naira (₦) and are subject to change without notice. We reserve the right to refuse or cancel any order for any reason, including pricing errors.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Account Responsibilities</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on this website, including text, graphics, logos, and images, is the property of Mosh Wearhouse Studio and is protected by copyright and trademark laws.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Mosh Wearhouse Studio shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us through our Contact page.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;