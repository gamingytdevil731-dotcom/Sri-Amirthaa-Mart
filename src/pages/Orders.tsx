import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  status: string;
  total_price: number;
  payment_method: string;
  created_at: string;
  order_items: { id: string; product_name: string; price: number; quantity: number }[];
}

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Preparing: "bg-primary/10 text-primary border-primary/20",
  "Out for Delivery": "bg-accent/10 text-accent border-accent/20",
  Delivered: "bg-success/10 text-success border-success/20",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="container-main py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Sign in to view orders</h2>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-main py-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">My Orders</h1>
        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <Link to="/products"><Button>Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-card rounded-xl border p-5 animate-fade-in">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                </div>
                <div className="space-y-1 mb-3">
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">💵 {order.payment_method}</span>
                  <span className="font-bold text-primary text-lg">${order.total_price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
