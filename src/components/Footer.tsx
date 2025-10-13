import { MapPin, Phone, Instagram } from "lucide-react";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src={logo} alt="Mosh Apparels" className="h-16 w-auto mb-4" />
            <p className="text-muted-foreground">
              ...look great, feel great, pay less
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>9, Bolanle Awosika street, Coca cola road, Oju Oore, Ota, Ogun state</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <a href="tel:08100510612" className="hover:text-primary transition-colors">
                  08100510612
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.tiktok.com/@mosh_apparels"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <FaTiktok className="h-5 w-5" />
                <span>@mosh_apparels</span>
              </a>
              <a
                href="https://wa.me/2349015375444"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span>WhatsApp Us</span>
              </a>
              <a
                href="https://www.instagram.com/mosh_apparels"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span>@mosh_apparels</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Mosh Apparels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
