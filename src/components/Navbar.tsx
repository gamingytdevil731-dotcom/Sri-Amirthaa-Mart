import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b shadow-sm">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-display text-xl font-bold text-foreground hidden sm:block">Mart</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search groceries..."
                className="pl-10 bg-secondary border-none"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-1">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm"><Shield className="h-4 w-4 mr-1" />Admin</Button>
                  </Link>
                )}
                <Link to="/orders">
                  <Button variant="ghost" size="sm"><Package className="h-4 w-4 mr-1" />Orders</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm"><User className="h-4 w-4 mr-1" />Profile</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button size="sm">Sign In</Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groceries..." className="pl-10 bg-secondary border-none" />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              {user ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start"><Shield className="h-4 w-4 mr-2" />Admin Panel</Button></Link>}
                  <Link to="/orders" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start"><Package className="h-4 w-4 mr-2" />My Orders</Button></Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start"><User className="h-4 w-4 mr-2" />Profile</Button></Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { signOut(); setMobileOpen(false); }}><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}><Button className="w-full">Sign In</Button></Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
