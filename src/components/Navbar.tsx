import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, Phone, MapPin } from "lucide-react";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import logo from "@/assets/logo.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const storeInfo = {
    name: "Mosh Apparels",
    phone: "+234 8100510611",
    address: "9, Bolanle Awosika street, Coca cola road, Oju Oore, Ota, Ogun state",
  };

  useEffect(() => {
    updateCartCount();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdminStatus(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdminStatus(session.user.id);
      else setIsAdmin(false);
      updateCartCount();
    });

    const handleCartUpdate = () => updateCartCount();
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const updateCartCount = async () => {
    const session = await supabase.auth.getSession();
    const currentUser = session.data.session?.user;

    if (currentUser) {
      const { data } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", currentUser.id);

      const total = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(total);
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const total = guestCart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(total);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // 🛍️ Updated Shop Sections (Added Unisex and Bales)
  const shopSections = [
    {
      title: "Ladies",
      items: [
        { name: "Tops", path: "/products?category=ladies-tops" },
        { name: "Skirts", path: "/products?category=ladies-skirts" },
        { name: "Pants", path: "/products?category=ladies-pants" },
        { name: "Gowns", path: "/products?category=ladies-gowns" },
      ],
    },
    {
      title: "Men",
      items: [
        { name: "Tops", path: "/products?category=men-tops" },
        { name: "Pants", path: "/products?category=men-pants" },
        { name: "Shorts", path: "/products?category=men-shorts" },
      ],
    },
    {
      title: "Kids",
      items: [
        { name: "Boy", path: "/products?category=kids-boy" },
        { name: "Girl", path: "/products?category=kids-girl" },
      ],
    },
    {
      title: "Unisex",
      items: [
        { name: "Tops", path: "/products?category=unisex-tops" },
        { name: "Jackets", path: "/products?category=unisex-jackets" },
        { name: "Jeans", path: "/products?category=unisex-jeans" },
      ],
    },
    {
      title: "Bales",
      items: [
        { name: "Ladies Bale", path: "/products?category=ladies-bales" },
        { name: "Men Bale", path: "/products?category=men-bales" },
        { name: "Mixed Bale", path: "/products?category=mixed-bales" },
      ],
    },
  ];

  const NavLinks = () => (
    <ul className="flex items-center gap-8 list-none">
      <li>
        <Link to="/" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
          Home
        </Link>
      </li>

      {shopSections.map((section) => (
        <li key={section.title} className="relative group">
          <button className="flex items-center gap-1 font-medium hover:text-primary transition-colors">
            {section.title}
          </button>
          <ul className="absolute hidden group-hover:flex flex-col bg-white shadow-lg rounded-md p-2 top-full left-0 w-48 z-50">
            {section.items.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 text-sm hover:bg-primary/10 rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}

      <li>
        <Link to="/about" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
          About
        </Link>
      </li>
      <li>
        <Link to="/contact" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
          Contact
        </Link>
      </li>
      {isAdmin && (
        <li>
          <Link to="/admin" className="hover:text-primary font-semibold transition-colors" onClick={() => setMobileOpen(false)}>
            Admin
          </Link>
        </li>
      )}
    </ul>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <a href={`tel:${storeInfo.phone}`} className="flex items-center gap-1 hover:opacity-80">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{storeInfo.phone}</span>
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(storeInfo.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1 hover:opacity-80"
              >
                <MapPin className="h-4 w-4" />
                <span>{storeInfo.address}</span>
              </a>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden sm:inline font-semibold">{storeInfo.name}</span>
              <div className="flex items-center gap-2 sm:gap-3">
                <a href="https://wa.me/2348123456789" target="_blank" rel="noopener noreferrer" className="hover:scale-110">
                  <FaWhatsapp className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://instagram.com/moshapparels" target="_blank" rel="noopener noreferrer" className="hover:scale-110">
                  <FaInstagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://tiktok.com/@moshapparels" target="_blank" rel="noopener noreferrer" className="hover:scale-110">
                  <FaTiktok className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Mosh Apparels" className="h-12 w-auto" />
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl">Mosh Apparels</span>
              <span className="text-xs text-muted-foreground">Quality Thrift Store</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {user ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate("/account")}>
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")}>Login</Button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <div className="flex flex-col gap-6 mt-8">
                  <Link to="/" className="hover:text-primary font-medium" onClick={() => setMobileOpen(false)}>
                    Home
                  </Link>

                  {shopSections.map((section) => (
                    <Accordion key={section.title} type="single" collapsible className="w-full">
                      <AccordionItem value={section.title} className="border-b-0">
                        <AccordionTrigger className="py-2 font-medium hover:text-primary">{section.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-2 pl-4">
                            {section.items.map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                className="py-1.5 text-sm hover:text-primary"
                                onClick={() => setMobileOpen(false)}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}

                  <Link to="/about" className="hover:text-primary font-medium" onClick={() => setMobileOpen(false)}>
                    About
                  </Link>
                  <Link to="/contact" className="hover:text-primary font-medium" onClick={() => setMobileOpen(false)}>
                    Contact
                  </Link>

                  {isAdmin && (
                    <Link to="/admin" className="hover:text-primary font-semibold" onClick={() => setMobileOpen(false)}>
                      Admin
                    </Link>
                  )}

                  <div className="flex flex-col gap-2 pt-4 border-t">
                    {user ? (
                      <>
                        <Button variant="outline" onClick={() => { navigate("/account"); setMobileOpen(false); }}>
                          My Account
                        </Button>
                        <Button variant="outline" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Login</Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
