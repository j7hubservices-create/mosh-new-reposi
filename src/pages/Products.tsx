import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<string>('none');
  const [loading, setLoading] = useState(true);

  const shopCategories = {
    Ladies: ['Ladies - Tops', 'Ladies - Skirts', 'Ladies - Pants', 'Ladies - Gowns'],
    Men: ['Men - Tops', 'Men - Pants', 'Men - Shorts'],
    Kids: ['Kids - Boy', 'Kids - Girl'],
    Bales: ['Bales'],
    Unisex: ['Unisex']
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Parse URL query (?category=ladies-skirts, men-tops, kids-boy, bales, unisex)
  useEffect(() => {
    const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.length > 0) {
      const paramSlug = categoryParam.toLowerCase();

      // Try match a specific subcategory by name
      const matchedCategory = categories.find(cat => toSlug(cat.name) === paramSlug);
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.id);
        const [mainCat] = matchedCategory.name.split(' - ');
        if (shopCategories[mainCat as keyof typeof shopCategories]) {
          setSelectedMainCategory(mainCat);
        } else {
          setSelectedMainCategory('all');
        }
        return;
      }

      // Fallback: treat it as a main category
      const matchedMain = Object.keys(shopCategories).find(main => toSlug(main) === paramSlug);
      if (matchedMain) {
        setSelectedMainCategory(matchedMain);
        setSelectedCategory('all');
        return;
      }
    }
  }, [categories, searchParams]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchProducts();
    }
  }, [selectedCategory, selectedMainCategory, categories]);

  useEffect(() => {
    applyFilters();
  }, [allProducts, selectedSize, priceSort]);

  // SEO: update title, meta description, and canonical URL for category pages
  useEffect(() => {
    const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const main = selectedMainCategory !== 'all' ? selectedMainCategory : 'Products';
    const subCat = selectedCategory !== 'all'
      ? categories.find((c) => c.id === selectedCategory)?.name.split(' - ')[1]
      : undefined;

    const pageTitle = subCat ? `${subCat} - ${main} | Mosh Apparels` : `${main} | Mosh Apparels`;
    document.title = pageTitle;

    const descriptionBase = subCat ? `${subCat} ${main.toLowerCase()} collection` : `${main.toLowerCase()} collection`;
    const description = `Shop ${descriptionBase} at Mosh Apparels. New arrivals, quality thrift, great prices.`;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, [selectedMainCategory, selectedCategory, categories]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) setCategories(data);
  };

  // Group categories by main category (Ladies, Men, Kids)
  const groupedCategories = categories.reduce((acc, cat) => {
    const [mainCat, subCat] = cat.name.split(' - ');
    if (!acc[mainCat]) acc[mainCat] = [];
    acc[mainCat].push({ ...cat, subName: subCat || cat.name });
    return acc;
  }, {} as Record<string, any[]>);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, categories(name)');

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    } else if (selectedMainCategory !== 'all') {
      // Filter by main category prefix
      const subCategories = categories.filter(cat => 
        shopCategories[selectedMainCategory as keyof typeof shopCategories]?.includes(cat.name)
      );
      if (subCategories.length > 0) {
        query = query.in('category_id', subCategories.map(c => c.id));
      }
    }

    const { data } = await query.order('created_at', { ascending: false });
    
    if (data) {
      setAllProducts(data);
      setProducts(data);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Filter by size
    if (selectedSize !== 'all') {
      filtered = filtered.filter(p => p.size === selectedSize);
    }

    // Sort by price
    if (priceSort === 'low-to-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high-to-low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setProducts(filtered);
  };

  const availableSizes = Array.from(new Set(allProducts.map(p => p.size).filter(Boolean)));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-muted-foreground text-lg">Discover our latest collection</p>
        </div>

        <div className="mb-8 space-y-4">
          <div>
            <span className="text-sm font-medium mb-2 block">Main Category:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMainCategory === 'all' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedMainCategory('all');
                  setSelectedCategory('all');
                }}
              >
                All
              </Button>
              {Object.keys(groupedCategories).map((mainCat) => (
                <Button
                  key={mainCat}
                  variant={selectedMainCategory === mainCat ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedMainCategory(mainCat);
                    setSelectedCategory('all');
                  }}
                >
                  {mainCat}
                </Button>
              ))}
            </div>
          </div>

          {selectedMainCategory !== 'all' && (
            <div>
              <span className="text-sm font-medium mb-2 block">Subcategory:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  size="sm"
                >
                  All {selectedMainCategory}
                </Button>
                {(groupedCategories[selectedMainCategory] || []).map((cat: any) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.subName}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <span className="text-sm font-medium mb-2 block">Size:</span>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <span className="text-sm font-medium mb-2 block">Price:</span>
              <Select value={priceSort} onValueChange={setPriceSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default</SelectItem>
                  <SelectItem value="low-to-high">Price: Low to High</SelectItem>
                  <SelectItem value="high-to-low">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
