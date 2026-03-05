import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

interface CategoryGridProps {
  categories: Tables<"categories">[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/products?category=${cat.id}`}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border hover:border-primary hover:shadow-md transition-all duration-300 group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon || "📦"}</span>
          <span className="text-xs font-medium text-foreground text-center leading-tight">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;
