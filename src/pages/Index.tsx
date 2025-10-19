import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, TrendingUp, Truck, Store, Sparkles, Crown, Tag, Star, Instagram } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import instagram1 from "@/assets/instagram-1.jpg";
import instagram2 from "@/assets/instagram-2.jpg";
import instagram3 from "@/assets/instagram-3.jpg";
import instagram4 from "@/assets/instagram-4.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [homepageSection, setHomepageSection] = useState<any>(null);
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchBestSellers();
    fetchSaleItems();
    fetchHomepageSection();
    fetchReviews();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);
    if (data) setFeaturedProducts(data);
  };

  const fetchDynamicProducts = async (sectionType: string) => {
    let query = supabase.from('products').select('*').limit(12);
    
    switch (sectionType) {
      case 'latest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'best_sellers':
        query = query.order('stock', { ascending: true });
        break;
      case 'random':
        // For random, we'll get all and shuffle client-side
        query = query.limit(20);
        break;
    }
    
    const { data } = await query;
    if (data) {
      if (sectionType === 'random') {
        setDynamicProducts(data.sort(() => Math.random() - 0.5).slice(0, 12));
      } else {
        setDynamicProducts(data);
      }
    }
  };

  const fetchBestSellers = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: true })
      .limit(3);
    if (data) setBestSellers(data);
  };

  const fetchSaleItems = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    if (data) setSaleItems(data);
  };

  const fetchHomepageSection = async () => {
    const { data } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setHomepageSection(data);
      fetchDynamicProducts(data.section_type);
    }
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('customer_reviews')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(4);
    if (data) setReviews(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex flex-col md:flex-col">
      
      {/* Hero Section */}
      <section 
        className="relative h-[70vh] md:h-[80vh] bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
                Welcome to Mosh Apparels
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Discover premium fashion for Men, Women & Kids.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="px-6 py-5" 
                  onClick={() => navigate('/products')}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-6 py-5 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-muted/30 order-3 md:order-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Quality Products</h3>
              <p className="text-muted-foreground text-sm">Carefully curated fashion</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Trending Styles</h3>
              <p className="text-muted-foreground text-sm">Latest fashion trends</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">Quick and reliable shipping</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Store Pickup</h3>
              <p className="text-muted-foreground text-sm">Collect at your convenience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Admin-Configurable Section */}
      {homepageSection && dynamicProducts.length > 0 && (
        <section className="py-8 bg-muted/20 order-2">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">{homepageSection.title}</h2>
                {homepageSection.description && (
                  <p className="text-muted-foreground text-sm">{homepageSection.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dynamicProducts.slice(0, 6).map((product) => (
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
          </div>
        </section>
      )}

      </div>

      {/* Featured Products Section */}
      <section className="py-8 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
              View All
            </Button>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
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
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          )}
        </div>
      </section>


      {/* Special Offers Section */}
      <section className="py-8 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
                <Tag className="w-6 h-6 text-primary" />
                Special Offers
              </h2>
              <p className="text-muted-foreground text-sm">Limited time deals</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
              Shop Deals
            </Button>
          </div>
          {saleItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
              {saleItems.map((product) => (
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
              <p className="text-muted-foreground">Check back for amazing deals!</p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-8 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-primary fill-primary" />
                Customer Reviews
              </h2>
              <p className="text-muted-foreground text-sm">What our customers say</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 italic">"{review.review_text}"</p>
                  <p className="font-semibold text-sm">- {review.customer_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Community Section */}
      <section className="py-8 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center justify-center gap-2">
              <Instagram className="w-6 h-6 text-primary" />
              Instagram Community
            </h2>
            <p className="text-muted-foreground text-sm">Follow @moshapparels</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="https://instagram.com/moshapparels"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={instagram1}
                alt="Instagram post 1"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
            <a
              href="https://instagram.com/moshapparels"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={instagram2}
                alt="Instagram post 2"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
            <a
              href="https://instagram.com/moshapparels"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={instagram3}
                alt="Instagram post 3"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
            <a
              href="https://instagram.com/moshapparels"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={instagram4}
                alt="Instagram post 4"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Mosh Apparels?</h2>
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
