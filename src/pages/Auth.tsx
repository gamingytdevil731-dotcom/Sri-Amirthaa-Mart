import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Shield } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin || isAdminLogin) {
      const loginEmail = isAdminLogin ? email : email;
      const { error } = await signIn(loginEmail, password);
      if (error) toast.error(error.message);
      else {
        toast.success(isAdminLogin ? "Welcome, Admin!" : "Welcome back!");
        navigate(isAdminLogin ? "/admin" : "/");
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error.message);
      else toast.success("Account created! You can now sign in.");
    }
    setLoading(false);
  };

  const switchToAdmin = () => {
    setIsAdminLogin(true);
    setIsLogin(true);
    setEmail("admin@smartmart.com");
    setPassword("");
  };

  const switchToUser = () => {
    setIsAdminLogin(false);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-main py-10 flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${isAdminLogin ? "bg-accent" : "bg-primary"}`}>
              {isAdminLogin ? (
                <Shield className="h-7 w-7 text-accent-foreground" />
              ) : (
                <span className="text-primary-foreground font-bold text-2xl">S</span>
              )}
            </div>
            <h1 className="text-3xl font-display font-bold">
              {isAdminLogin ? "Admin Login" : isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdminLogin
                ? "Sign in to the SmartMart admin dashboard"
                : isLogin
                ? "Sign in to your SmartMart account"
                : "Join SmartMart for fresh groceries"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 space-y-4">
            {!isLogin && !isAdminLogin && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">{isAdminLogin ? "Admin Email" : "Email"}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={isAdminLogin ? "admin@smartmart.com" : "you@example.com"}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Please wait..." : isAdminLogin ? "Admin Sign In" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {!isAdminLogin && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}

          <div className="mt-6 border-t pt-6">
            {isAdminLogin ? (
              <Button variant="outline" className="w-full" onClick={switchToUser}>
                ← Back to Customer Login
              </Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={switchToAdmin}>
                <Shield className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
