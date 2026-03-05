import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, loading } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-main py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Sign in to view your cart</h2>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-main py-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">Start adding fresh groceries!</p>
            <Link to="/products"><Button>Browse Products</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-card rounded-xl border p-4 animate-fade-in">
                  <img src={item.product.image_url || "/placeholder.svg"} alt={item.product.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.product.unit}</p>
                    <p className="font-bold text-primary mt-1">${item.product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <Button size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[70px]">
                    <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="sm" className="text-destructive mt-1 h-7 px-2" onClick={() => removeFromCart(item.product_id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl border p-6 h-fit sticky top-20">
              <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-success">Free</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span><span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="block mt-4">
                <Button className="w-full" size="lg">Proceed to Checkout</Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center mt-3">💵 Cash on Delivery only</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
