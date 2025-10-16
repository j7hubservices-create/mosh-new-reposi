import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, ChevronDown } from "lucide-react";
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
  const [categories, setCategories] = useState<any[]>([]);

  const storeInfo = {
    name: "Mosh Apparels",
    phone: "+234 812 345 6789",
    address: "9, Bolanle Awosika street, Coca cola road, Oju Oore, Ota, Ogun state"
  };

  useEffect(() => {
    fetchCategories();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
        fetchCartCount(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
        fetchCartCount(session.user.id);
      } else {
        setIsAdmin(false);
        setCartCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const fetchCartCount = async (userId: string) => {
    const { data } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', userId);
    
    const total = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    setCartCount(total);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
        Home
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none">
          Shop <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover z-50">
          <DropdownMenuItem asChild>
            <Link to="/products" className="w-full cursor-pointer">All Products</Link>
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link to={`/products?category=${category.id}`} className="w-full cursor-pointer">
                {category.name}
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
      {/* Top Bar with Contact Info */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-1 sm:gap-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="whitespace-nowrap">📞 {storeInfo.phone}</span>
              <span className="hidden lg:inline text-center">📍 {storeInfo.address}</span>
            </div>
            <span className="font-semibold">{storeInfo.name}</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Mosh Apparels" className="h-12 w-auto" />
            <span className="font-bold text-lg md:text-xl">Mosh Apparels</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}
            {user ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate('/account')}>
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Login
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <div className="flex flex-col gap-6 mt-8">
                  <Link to="/" className="hover:text-primary transition-colors font-medium" onClick={() => setMobileOpen(false)}>
                    Home
                  </Link>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="shop" className="border-b-0">
                      <AccordionTrigger className="py-2 hover:text-primary font-medium">Shop</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2 pl-4">
                          <Link 
                            to="/products" 
                            className="py-2 hover:text-primary transition-colors text-sm"
                            onClick={() => setMobileOpen(false)}
                          >
                            All Products
                          </Link>
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              to={`/products?category=${category.id}`}
                              className="py-2 hover:text-primary transition-colors text-sm"
                              onClick={() => setMobileOpen(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Link to="/about" className="hover:text-primary transition-colors font-medium" onClick={() => setMobileOpen(false)}>
                    About
                  </Link>
                  <Link to="/contact" className="hover:text-primary transition-colors font-medium" onClick={() => setMobileOpen(false)}>
                    Contact
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="hover:text-primary transition-colors font-semibold" onClick={() => setMobileOpen(false)}>
                      Admin
                    </Link>
                  )}
                  
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    {user ? (
                      <>
                        <Button variant="outline" onClick={() => { navigate('/account'); setMobileOpen(false); }}>
                          My Account
                        </Button>
                        <Button variant="outline" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => { navigate('/auth'); setMobileOpen(false); }}>
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
