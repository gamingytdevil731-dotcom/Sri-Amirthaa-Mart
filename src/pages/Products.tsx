import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Tables<"products">[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const selectedCategory = searchParams.get("category");

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => data && setCategories(data));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from("products").select("*").order("name");
      if (selectedCategory) query = query.eq("category_id", selectedCategory);
      if (searchParams.get("search")) query = query.ilike("name", `%${searchParams.get("search")}%`);
      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, [selectedCategory, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) params.set("search", searchTerm); else params.delete("search");
    setSearchParams(params);
  };

  const setCategory = (catId: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (catId) params.set("category", catId); else params.delete("category");
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-main py-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">All Products</h1>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search products..." className="pl-10" />
          </div>
        </form>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={!selectedCategory ? "default" : "outline"} size="sm" onClick={() => setCategory(null)}>All</Button>
          {categories.map(cat => (
            <Button key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setCategory(cat.id)}>
              {cat.icon} {cat.name}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
