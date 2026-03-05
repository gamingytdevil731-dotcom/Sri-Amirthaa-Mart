import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [featured, setFeatured] = useState<Tables<"products">[]>([]);
  const [popular, setPopular] = useState<Tables<"products">[]>([]);

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => data && setCategories(data));
    supabase.from("products").select("*").eq("is_featured", true).limit(8).then(({ data }) => data && setFeatured(data));
    supabase.from("products").select("*").eq("is_popular", true).limit(8).then(({ data }) => data && setPopular(data));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-main py-6 space-y-10">
        <HeroBanner />

        <section>
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">Shop by Category</h2>
          <CategoryGrid categories={categories} />
        </section>

        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Featured Products</h2>
              <Link to="/products"><Button variant="ghost" size="sm">View All <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {popular.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Popular Products</h2>
              <Link to="/products"><Button variant="ghost" size="sm">View All <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {popular.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        <footer className="border-t pt-8 pb-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} SmartMart Supermarket. All rights reserved.</p>
          <p className="mt-1">Cash on Delivery only • Fast local delivery</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
