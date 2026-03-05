import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { z } from "zod";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone required").max(15),
  address: z.string().trim().min(5, "Address is required").max(500),
  city: z.string().trim().min(2, "City is required").max(100),
  pincode: z.string().trim().min(4, "Pincode is required").max(10),
});

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", city: "", pincode: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(i => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!user || items.length === 0) return;

    setLoading(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id, full_name: form.fullName, phone: form.phone,
      address: form.address, city: form.city, pincode: form.pincode,
      payment_method: "COD", total_price: totalPrice,
    }).select().single();

    if (error || !order) { toast.error("Failed to place order"); setLoading(false); return; }

    const orderItems = items.map(i => ({
      order_id: order.id, product_id: i.product_id,
      product_name: i.product.name, price: i.product.price, quantity: i.quantity,
    }));
    await supabase.from("order_items").insert(orderItems);
    await clearCart();
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-main py-16 text-center animate-scale-in">
          <CheckCircle className="h-20 w-20 mx-auto text-success mb-4" />
          <h1 className="text-3xl font-display font-bold mb-3">Order Placed Successfully!</h1>
          <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
            Your order has been placed successfully. Please pay cash when the order is delivered.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/orders")}>View Orders</Button>
            <Button variant="outline" onClick={() => navigate("/products")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-main py-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Delivery Details</h2>
            {[
              { key: "fullName", label: "Full Name", placeholder: "John Doe" },
              { key: "phone", label: "Phone Number", placeholder: "+91 9876543210" },
              { key: "address", label: "Delivery Address", placeholder: "123 Main Street, Apt 4" },
              { key: "city", label: "City", placeholder: "Mumbai" },
              { key: "pincode", label: "Pincode", placeholder: "400001" },
            ].map(f => (
              <div key={f.key}>
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input id={f.key} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                {errors[f.key] && <p className="text-sm text-destructive mt-1">{errors[f.key]}</p>}
              </div>
            ))}

            <div className="bg-secondary rounded-lg p-4 mt-4">
              <p className="font-semibold mb-1">Payment Method</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
                <span>💵 Cash on Delivery (COD)</span>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Placing Order..." : `Place Order • $${totalPrice.toFixed(2)}`}
            </Button>
          </form>

          <div className="bg-card rounded-xl border p-6 h-fit">
            <h3 className="font-display text-xl font-bold mb-4">Order Items</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.product.image_url || "/placeholder.svg"} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span><span className="text-primary">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
