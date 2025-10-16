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
      .limit(6);
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
      
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Welcome to Mosh Apparels
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Discover premium fashion for Men, Women & Kids. Style that speaks to you.
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
        <div className="container mx-auto px-4 max-w-7xl">
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

      {/* Dynamic Admin-Configurable Carousel Section */}
      {homepageSection && dynamicProducts.length > 0 && (
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{homepageSection.title}</h2>
                {homepageSection.description && (
                  <p className="text-muted-foreground">{homepageSection.description}</p>
                )}
              </div>
              <Button variant="outline" onClick={() => navigate('/products')}>
                View All
              </Button>
            </div>
            
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {dynamicProducts.map((product) => (
                  <CarouselItem key={product.id}>
                    <div className="px-4 md:px-12">
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image_url={product.image_url}
                        size={product.size}
                        stock={product.stock}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
            <Button variant="outline" onClick={() => navigate('/products')}>
              View All
            </Button>
          </div>

          {featuredProducts.length > 0 ? (
            <Carousel
              opts={{ align: "center", loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id}>
                    <div className="px-4 md:px-12">
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image_url={product.image_url}
                        size={product.size}
                        stock={product.stock}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found in this category</p>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Crown className="w-8 h-8 text-primary" />
                Best Sellers
              </h2>
              <p className="text-muted-foreground">Customer favorites you'll love</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')}>
              View All
            </Button>
          </div>
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellers.map((product) => (
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
              <p className="text-muted-foreground">Coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Tag className="w-8 h-8 text-primary" />
                Special Offers
              </h2>
              <p className="text-muted-foreground">Limited time deals you don't want to miss</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Shop Deals
            </Button>
          </div>
          {saleItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <section className="py-16 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                <Star className="w-8 h-8 text-primary fill-primary" />
                What Our Customers Say
              </h2>
              <p className="text-muted-foreground">Real feedback from our amazing customers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{review.review_text}"</p>
                  <p className="font-semibold text-sm">- {review.customer_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Community Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <Instagram className="w-8 h-8 text-primary" />
              Join Our Instagram Community
            </h2>
            <p className="text-muted-foreground">Follow us @moshapparels for style inspiration</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          </div>
          <div className="text-center mt-8">
            <Button
              size="lg"
              onClick={() => window.open('https://instagram.com/moshapparels', '_blank')}
              className="gap-2"
            >
              <Instagram className="w-5 h-5" />
              Follow @moshapparels
            </Button>
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
