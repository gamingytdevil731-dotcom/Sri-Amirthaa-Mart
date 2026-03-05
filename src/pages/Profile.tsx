import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "", city: "", pincode: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name || "", phone: data.phone || "", address: data.address || "", city: data.city || "", pincode: data.pincode || "" });
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update(profile).eq("user_id", user.id);
    if (error) toast.error("Failed to update"); else toast.success("Profile updated!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-main py-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">My Profile</h1>
        <form onSubmit={handleSave} className="max-w-md bg-card rounded-xl border p-6 space-y-4">
          <div><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
          {[
            { key: "full_name", label: "Full Name" },
            { key: "phone", label: "Phone" },
            { key: "address", label: "Address" },
            { key: "city", label: "City" },
            { key: "pincode", label: "Pincode" },
          ].map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input value={(profile as any)[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </form>
      </main>
    </div>
  );
};

export default Profile;
