import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import logo from "@/assets/salem-logo-new.jpg";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Auto-close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ✅ Track login status
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-8">
        {/* ✅ Logo */}
        <div
          className="flex items-center cursor-pointer gap-2"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
          <span className="text-xl font-bold text-primary">Mosh Apparels</span>
        </div>

        {/* ✅ Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Bales
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Contact
          </Link>

          {/* ✅ Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/cart")}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>

          {/* ✅ Auth Buttons */}
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/account")}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")}>Signup / Login</Button>
          )}
        </div>

        {/* ✅ Mobile Menu Button */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden">
              {menuOpen ? <X /> : <Menu />}
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-3/4 sm:w-1/2 bg-white">
            <SheetHeader>
              <SheetTitle className="text-left text-lg font-semibold">
                Menu
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4 mt-6">
              <Link
                to="/"
                className="text-base font-medium hover:text-primary"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-base font-medium hover:text-primary"
              >
                Bales
              </Link>
              <Link
                to="/about"
                className="text-base font-medium hover:text-primary"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-base font-medium hover:text-primary"
              >
                Contact
              </Link>
              <Link
                to="/cart"
                className="flex items-center gap-2 text-base font-medium hover:text-primary"
              >
                <ShoppingCart className="h-5 w-5" />
                Cart
              </Link>

              <div className="pt-4 border-t mt-4">
                {user ? (
                  <>
                    <Button
                      className="w-full bg-primary text-white mb-2"
                      onClick={() => navigate("/account")}
                    >
                      Account
                    </Button>
                    <Button
                      className="w-full bg-gray-200 text-gray-800"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-primary text-white"
                    onClick={() => navigate("/auth")}
                  >
                    Signup / Login
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
