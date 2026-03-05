import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroBanner = () => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border">
      <div className="px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
        <div className="max-w-lg">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Fresh & Local</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-4">
            Groceries Delivered<br />
            <span className="text-primary">To Your Door</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 max-w-md">
            Shop fresh produce, dairy, snacks and more from SmartMart. Pay with Cash on Delivery — no hassle.
          </p>
          <Link to="/products">
            <Button size="lg" className="group">
              Shop Now
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary/5" />
        <div className="absolute top-8 right-8 text-8xl opacity-20 rotate-12">🛒</div>
        <div className="absolute bottom-12 right-16 text-6xl opacity-15 -rotate-6">🥬</div>
        <div className="absolute top-1/2 right-32 text-7xl opacity-10 rotate-3">🍎</div>
      </div>
    </div>
  );
};

export default HeroBanner;
