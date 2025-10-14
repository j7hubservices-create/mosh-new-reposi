import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import logo from "@/assets/logo.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
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
      <Link to="/products" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
        Products
      </Link>
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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Mosh Apparels" className="h-12 w-auto" />
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
              <SheetContent>
                <div className="flex flex-col gap-6 mt-8">
                  <NavLinks />
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
