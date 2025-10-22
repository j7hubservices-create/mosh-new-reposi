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

    {/* Unisex as single menu link */}
    <li>
      <Link to="/products?category=unisex" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
        Unisex
      </Link>
    </li>

    {/* ✅ Size Chart link added here */}
    <li>
      <Link to="/size-chart" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
        Size Chart
      </Link>
    </li>

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
