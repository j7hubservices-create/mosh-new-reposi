import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShoppingBag, Heart, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">About Mosh Wearhouse Studio</h1>
            <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">Your premier destination for quality fashion and style</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mosh Wearhouse Studio was founded with a passion for bringing quality, stylish fashion to everyone. We believe that great clothing should be accessible, affordable, and timeless. Our carefully curated collection features the latest trends alongside classic pieces that never go out of style.
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
                  <h3 className="font-semibold mb-2">Quality Products</h3>
                  <p className="text-sm text-muted-foreground">Every item is carefully selected for quality, comfort, and style.</p>
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
                To provide exceptional fashion experiences through quality products, outstanding customer service, and a commitment to making style accessible to everyone. We're here to help you look and feel your best, every day.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;