import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, ChevronDown, Phone, MapPin } from "lucide-react";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
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

  const shopCategories = {
    Ladies: [
      { name: "Tops", path: "/products?category=ladies-tops" },
      { name: "Skirts", path: "/products?category=ladies-skirts" },
      { name: "Pants", path: "/products?category=ladies-pants" },
      { name: "Gowns", path: "/products?category=ladies-gowns" },
    ],
    Men: [
      { name: "Tops", path: "/products?category=men-tops" },
      { name: "Pants", path: "/products?category=men-pants" },
      { name: "Shorts", path: "/products?category=men-shorts" },
    ],
    Kids: [
      { name: "Boy", path: "/products?category=kids-boy" },
      { name: "Girl", path: "/products?category=kids-girl" },
    ],
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
        Home
      </Link>

      {/* Ladies Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none">
          Ladies <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover z-50 w-48">
          {shopCategories.Ladies.map((item) => (
            <DropdownMenuItem key={item.path} asChild>
              <Link to={item.path} className="w-full cursor-pointer">
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Men Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none">
          Men <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover z-50 w-48">
          {shopCategories.Men.map((item) => (
            <DropdownMenuItem key={item.path} asChild>
              <Link to={item.path} className="w-full cursor-pointer">
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Kids Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none">
          Kids <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover z-50 w-48">
          {shopCategories.Kids.map((item) => (
            <DropdownMenuItem key={item.path} asChild>
              <Link to={item.path} className="w-full cursor-pointer">
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Link to="/about" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
        About
      </Link>
      <Link to="/contact" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
        Contact
      </Link>
      {isAdmin && (
        <Link to="/admin" className="hover:text-primary transition-colors font-semibold" onClick={() => setMobileOpen(false)}>
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <a href={`tel:${storeInfo.phone}`} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{storeInfo.phone}</span>
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(storeInfo.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <MapPin className="h-4 w-4" />
                <span>{storeInfo.address}</span>
              </a>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden sm:inline font-semibold">{storeInfo.name}</span>
              <div className="flex items-center gap-2 sm:gap-3">
                <a href="https://wa.me/2348123456789" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <FaWhatsapp className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://instagram.com/moshapparels" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <FaInstagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://tiktok.com/@moshapparels" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
          </div>

          {/* Right Icons */}
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

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="relative">
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

                  {/* Ladies Accordion */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="ladies">
                      <AccordionTrigger>Ladies</AccordionTrigger>
                      <AccordionContent>
                        {shopCategories.Ladies.map((item) => (
                          <Link key={item.path} to={item.path} className="block py-1.5 pl-4 hover:text-primary" onClick={() => setMobileOpen(false)}>
                            {item.name}
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Men */}
                    <AccordionItem value="men">
                      <AccordionTrigger>Men</AccordionTrigger>
                      <AccordionContent>
                        {shopCategories.Men.map((item) => (
                          <Link key={item.path} to={item.path} className="block py-1.5 pl-4 hover:text-primary" onClick={() => setMobileOpen(false)}>
                            {item.name}
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Kids */}
                    <AccordionItem value="kids">
                      <AccordionTrigger>Kids</AccordionTrigger>
                      <AccordionContent>
                        {shopCategories.Kids.map((item) => (
                          <Link key={item.path} to={item.path} className="block py-1.5 pl-4 hover:text-primary" onClick={() => setMobileOpen(false)}>
                            {item.name}
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

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
                      <Button onClick={() => { navigate("/auth"); setMobileOpen(false); }}>
                        Login
                      </Button>
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
