import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShoppingBag, Heart, Users, Award, Phone, MapPin, Instagram } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">About Mosh Apparels</h1>
            <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">Your Premier Thrift Store for Quality Fashion</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mosh Apparels is your trusted thrift store, founded with a passion for bringing quality, stylish fashion to everyone at affordable prices. We believe that great clothing should be accessible to all. As a thrift store, we specialize in carefully curated pre-loved fashion, bales, and wholesale options that combine sustainability with style. Our collection features timeless pieces and trending fashion finds that prove second-hand doesn't mean second-best.
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Quality Thrift Products</h3>
                  <p className="text-sm text-muted-foreground">Every pre-loved item is carefully inspected and selected for quality, comfort, and style.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer First</h3>
                  <p className="text-sm text-muted-foreground">Your satisfaction is our top priority, always.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">We're building a community of fashion enthusiasts.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">We strive for excellence in everything we do.</p>
                </div>
              </div>
            </div>

            <section>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To provide exceptional thrift fashion experiences through quality pre-loved products, bales, and wholesale options, outstanding customer service, and a commitment to making sustainable style accessible and affordable to everyone. We're here to help you look and feel your best while making conscious fashion choices, every day.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Contact Us</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <a href="tel:08100510611" className="text-muted-foreground hover:text-primary transition-colors">
                      08100510611
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Visit Us</h3>
                    <p className="text-muted-foreground text-sm">
                      9, Bolanle Awosika street<br />
                      Coca cola road, Oju Oore<br />
                      Ota, Ogun state
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Instagram className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Follow Us</h3>
                    <div className="space-y-1">
                      <a
                        href="https://www.instagram.com/mosh_apparels"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors text-sm block"
                      >
                        @mosh_apparels
                      </a>
                      <a
                        href="https://www.tiktok.com/@mosh_apparels"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors text-sm block"
                      >
                        TikTok: @mosh_apparels
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/2349015375444"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      Chat with us
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;