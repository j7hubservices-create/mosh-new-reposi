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
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const storeInfo = {
    name: "Mosh Apparels",
    phone: "+2348100510611",
    address: "9, Bolanle Awosika Street, Coca Cola Road, Oju Oore, Ota, Ogun State",
    whatsapp: "https://wa.me/2348100510611",
    instagram: "https://www.instagram.com/moshapparels",
    tiktok: "https://www.tiktok.com/@moshapparels",
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

  const checkAdminStatus = async (userId) => {
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
      const total = guestCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // ✅ No subcategories for Bales
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
  ];

  const NavLinks = () => (
    <ul className="flex items-center gap-8 list-none">
      <li><Link to="/" className="hover:text-primary">Home</Link></li>

      {shopSections.map((section) => (
        <li key={section.title} className="relative group">
          <button className="flex items-center gap-1 font-medium hover:text-primary">
            {section.title}
          </button>
          <ul className="absolute hidden group-hover:flex flex-col bg-white shadow-lg rounded-md p-2 top-full left-0 w-48 z-50">
            {section.items.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 text-sm hover:bg-primary/10 rounded-md"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}

      {/* ✅ Bales is now a single category */}
      <li><Link to="/products?category=bales" className="hover:text-primary">Bales</Link></li>
      <li><Link to="/products?category=unisex" className="hover:text-primary">Unisex</Link></li>
      <li><Link to="/size-chart" className="hover:text-primary">Size Chart</Link></li>
      <li><Link to="/about" className="hover:text-primary">About</Link></li>
      <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>

      {isAdmin && (
        <li><Link to="/admin" className="hover:text-primary font-semibold">Admin</Link></li>
      )}
    </ul>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">

      {/* ✅ Top Bar */}
      <div className="bg-primary text-white py-2">
        <div className="container mx-auto flex justify-between items-center text-xs sm:text-sm px-4">

          {/* Desktop: Full info */}
          <div className="hidden md:flex items-center gap-4">
            <a href={`tel:${storeInfo.phone}`} className="flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" /> {storeInfo.phone}
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(storeInfo.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              <MapPin className="h-3 w-3" /> {storeInfo.address}
            </a>
          </div>

          {/* Mobile: Icons only */}
          <div className="flex md:hidden items-center gap-3">
            <a href={`tel:${storeInfo.phone}`}><Phone className="h-4 w-4" /></a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(storeInfo.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin className="h-4 w-4" />
            </a>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a href={storeInfo.whatsapp} target="_blank" rel="noreferrer">
              <FaWhatsapp className="hover:text-green-400" />
            </a>
            <a href={storeInfo.instagram} target="_blank" rel="noreferrer">
              <FaInstagram className="hover:text-pink-400" />
            </a>
            <a href={storeInfo.tiktok} target="_blank" rel="noreferrer">
              <FaTiktok className="hover:text-gray-200" />
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Main Navbar */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Mosh Apparels" className="h-12 w-auto" />
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl">Mosh Apparels</span>
            <span className="text-xs text-muted-foreground">Quality Thrift Store</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
        </div>

        {/* Cart & Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate("/account")}>
                <User className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")}>Login</Button>
          )}
        </div>

        {/* ✅ Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-72 bg-white p-5 overflow-y-auto shadow-lg"
            >
              <div className="flex flex-col gap-4 text-lg font-medium text-gray-800">
                <Link to="/" className="hover:text-primary">Home</Link>

                {/* Accordion for shop sections */}
                <Accordion type="single" collapsible>
                  {shopSections.map((section) => (
                    <AccordionItem key={section.title} value={section.title}>
                      <AccordionTrigger className="text-base font-semibold">
                        {section.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="flex flex-col gap-2 pl-2">
                          {section.items.map((item) => (
                            <li key={item.path}>
                              <Link
                                to={item.path}
                                className="block py-1 px-2 hover:bg-primary/10 rounded-md text-sm"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {/* ✅ Single Bales Link */}
                <Link to="/products?category=bales" className="hover:text-primary">Bales</Link>
                <Link to="/products?category=unisex" className="hover:text-primary">Unisex</Link>
                <Link to="/size-chart" className="hover:text-primary">Size Chart</Link>
                <Link to="/about" className="hover:text-primary">About</Link>
                <Link to="/contact" className="hover:text-primary">Contact</Link>
                {isAdmin && <Link to="/admin" className="hover:text-primary">Admin</Link>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
