import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Package, ShoppingBag, Users, DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";

const STATUS_OPTIONS = ["Pending", "Preparing", "Out for Delivery", "Delivered"];

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Tables<"products">[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0, totalCustomers: 0 });
  const [editProduct, setEditProduct] = useState<Partial<Tables<"products">> | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    const [{ data: prods }, { data: cats }, { data: ords }] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("categories").select("*"),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setOrders(ords || []);
    if (ords) {
      setStats({
        totalOrders: ords.length,
        totalSales: ords.reduce((s: number, o: any) => s + Number(o.total_price), 0),
        totalCustomers: new Set(ords.map((o: any) => o.user_id)).size,
      });
    }
  };

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  const handleSaveProduct = async () => {
    if (!editProduct?.name || !editProduct?.price) { toast.error("Name and price required"); return; }
    if (editProduct.id) {
      await supabase.from("products").update({
        name: editProduct.name, description: editProduct.description, price: Number(editProduct.price),
        category_id: editProduct.category_id, stock_quantity: Number(editProduct.stock_quantity || 0),
        image_url: editProduct.image_url, is_featured: editProduct.is_featured, is_popular: editProduct.is_popular, unit: editProduct.unit,
      }).eq("id", editProduct.id);
      toast.success("Product updated");
    } else {
      await supabase.from("products").insert({
        name: editProduct.name, description: editProduct.description || "", price: Number(editProduct.price),
        category_id: editProduct.category_id || null, stock_quantity: Number(editProduct.stock_quantity || 0),
        image_url: editProduct.image_url || "", is_featured: editProduct.is_featured || false,
        is_popular: editProduct.is_popular || false, unit: editProduct.unit || "piece",
      });
      toast.success("Product added");
    }
    setProductDialogOpen(false);
    setEditProduct(null);
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted");
    fetchData();
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    toast.success(`Status updated to ${status}`);
    fetchData();
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-main py-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: ShoppingBag, label: "Total Orders", value: stats.totalOrders, color: "text-primary" },
            { icon: DollarSign, label: "Total Sales", value: `$${stats.totalSales.toFixed(2)}`, color: "text-success" },
            { icon: Package, label: "Products", value: products.length, color: "text-accent" },
            { icon: Users, label: "Customers", value: stats.totalCustomers, color: "text-primary" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border p-4">
              <s.icon className={`h-6 w-6 ${s.color} mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="bg-card rounded-xl border p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <div>
                      <p className="font-semibold">{order.full_name}</p>
                      <p className="text-sm text-muted-foreground">📞 {order.phone} • {order.city}, {order.pincode}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={order.status} onValueChange={v => updateOrderStatus(order.id, v)}>
                        <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between">
                    <span className="text-sm text-muted-foreground">💵 COD</span>
                    <span className="font-bold text-primary">${Number(order.total_price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders yet</p>}
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mb-4" onClick={() => setEditProduct({ name: "", price: 0, stock_quantity: 0, unit: "piece", is_featured: false, is_popular: false })}>
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editProduct?.id ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
                {editProduct && (
                  <div className="space-y-3">
                    <div><Label>Name</Label><Input value={editProduct.name || ""} onChange={e => setEditProduct(p => ({ ...p!, name: e.target.value }))} /></div>
                    <div><Label>Description</Label><Input value={editProduct.description || ""} onChange={e => setEditProduct(p => ({ ...p!, description: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Price</Label><Input type="number" step="0.01" value={editProduct.price || ""} onChange={e => setEditProduct(p => ({ ...p!, price: Number(e.target.value) }))} /></div>
                      <div><Label>Stock</Label><Input type="number" value={editProduct.stock_quantity || ""} onChange={e => setEditProduct(p => ({ ...p!, stock_quantity: Number(e.target.value) }))} /></div>
                    </div>
                    <div><Label>Category</Label>
                      <Select value={editProduct.category_id || ""} onValueChange={v => setEditProduct(p => ({ ...p!, category_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Image URL</Label><Input value={editProduct.image_url || ""} onChange={e => setEditProduct(p => ({ ...p!, image_url: e.target.value }))} /></div>
                    <div><Label>Unit</Label><Input value={editProduct.unit || ""} onChange={e => setEditProduct(p => ({ ...p!, unit: e.target.value }))} /></div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editProduct.is_featured || false} onChange={e => setEditProduct(p => ({ ...p!, is_featured: e.target.checked }))} /> Featured</label>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editProduct.is_popular || false} onChange={e => setEditProduct(p => ({ ...p!, is_popular: e.target.checked }))} /> Popular</label>
                    </div>
                    <Button onClick={handleSaveProduct} className="w-full">Save Product</Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <div className="space-y-2">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-4 bg-card rounded-lg border p-3">
                  <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">${p.price.toFixed(2)} • Stock: {p.stock_quantity}</p>
                  </div>
                  <div className="flex gap-1">
                    {p.is_featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditProduct(p); setProductDialogOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteProduct(p.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
