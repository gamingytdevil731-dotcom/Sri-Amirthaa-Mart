import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  product: Tables<"products">;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find(i => i.product_id === product.id);

  return (
    <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group animate-fade-in">
      <div className="aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.unit}</p>
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
          {cartItem ? (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-semibold text-sm w-6 text-center">{cartItem.quantity}</span>
              <Button size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => addToCart(product.id)} disabled={product.stock_quantity === 0}>
              <Plus className="h-4 w-4 mr-1" />
              {product.stock_quantity === 0 ? "Out" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
