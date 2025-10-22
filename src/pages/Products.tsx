import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<string>("none");
  const [loading, setLoading] = useState(true);

  // ✅ Updated Bale categories
  const shopCategories = {
    Ladies: ["Ladies - Tops", "Ladies - Skirts", "Ladies - Pants", "Ladies - Gowns"],
    Men: ["Men - Tops", "Men - Pants", "Men - Shorts"],
    Kids: ["Kids - Boy", "Kids - Girl"],
    Bales: ["Ladies Bale", "Men Bale", "Kids Bale"], // ✅ Added Ladies Bale & Men Bale
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, selectedMainCategory, categories]);

  useEffect(() => {
    applyFilters();
  }, [allProducts, selectedSize, priceSort]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (data) setCategories(data);
  };

  // Group categories by main category (Ladies, Men, Kids, etc.)
  const groupedCategories = categories.reduce((acc, cat) => {
    const [mainCat, subCat] = cat.name.split(" - ");
    if (!acc[mainCat]) acc[mainCat] = [];
    acc[mainCat].push({ ...cat, subName: subCat || cat.name });
    return acc;
  }, {} as Record<string, any[]>);

  const fetchProducts = async () => {
    setLoading(true);
    const categoryFromUrl = searchParams.get("category");

    let query = supabase.from("products").select("*, categories(name)");

    if (categoryFromUrl && categoryFromUrl !== "all") {
      query = query.eq("category_id", categoryFromUrl);
      setSelectedCategory(categoryFromUrl);
    } else if (selectedMainCategory !== "all") {
      const subCategories = categories.filter((cat) =>
        shopCategories[selectedMainCategory as keyof typeof shopCategories]?.includes(cat.name)
      );
      if (subCategories.length > 0) {
        query = query.in("category_id", subCategories.map((c) => c.id));
      }
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) console.error(error);
    else {
      setAllProducts(data);
      setProducts(data);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    if (selectedSize !== "all") {
      filtered = filtered.filter((p) => p.size === selectedSize);
    }

    if (priceSort === "low-to-high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === "high-to-low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setProducts(filtered);
  };

  const availableSizes = Array.from(
    new Set(allProducts.map((p) => p.size).filter(Boolean))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-muted-foreground text-lg">
            Discover our latest collection
          </p>
        </div>

        <div className="mb-8 space-y-4">
          {/* MAIN CATEGORY */}
          <div>
            <span className="text-sm font-medium mb-2 block">Main Category:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMainCategory === "all" ? "default" : "outline"}
                onClick={() => {
                  setSelectedMainCategory("all");
                  setSelectedCategory("all");
                }}
              >
                All
              </Button>
              {Object.keys(groupedCategories).map((mainCat) => (
                <Button
                  key={mainCat}
                  variant={selectedMainCategory === mainCat ? "default" : "outline"}
                  onClick={() => {
                    setSelectedMainCategory(mainCat);
                    setSelectedCategory("all");
                  }}
                >
                  {mainCat}
                </Button>
              ))}
            </div>
          </div>

          {/* SUBCATEGORY */}
          {selectedMainCategory !== "all" && (
            <div>
              <span className="text-sm font-medium mb-2 block">Subcategory:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  size="sm"
                >
                  All {selectedMainCategory}
                </Button>
                {(groupedCategories[selectedMainCategory] || []).map((cat: any) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.subName}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* SIZE & PRICE FILTERS */}
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
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
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

        {/* PRODUCT GRID */}
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
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
