import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, TrendingUp, Truck, Store } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchFeaturedProducts = async () => {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }
    
    const { data } = await query;
    if (data) setFeaturedProducts(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Elevate Your Style
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Discover premium fashion that speaks to you. Look great, feel great, pay less.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6" 
                onClick={() => navigate('/products')}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quality Products</h3>
              <p className="text-muted-foreground text-sm">Carefully curated fashion items</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Trending Styles</h3>
              <p className="text-muted-foreground text-sm">Latest fashion trends</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">Quick and reliable shipping</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Store Pickup</h3>
              <p className="text-muted-foreground text-sm">Collect at your convenience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Shop by Category</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              {selectedCategory ? 'Filtered Products' : 'Featured Products'}
            </h2>
            <Button variant="outline" onClick={() => navigate('/products')}>
              View All
            </Button>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image_url={product.image_url}
                  size={product.size}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found in this category</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Mosh Wearhouse Studio?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            We're committed to providing you with the best fashion experience. Quality, style, and affordability - all in one place.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/about')}
          >
            Learn About Us
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
