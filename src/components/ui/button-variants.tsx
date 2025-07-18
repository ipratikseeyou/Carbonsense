
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-premium hover:shadow-premium-lg transition-all duration-400 hover:scale-[1.02]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        premium: "bg-gradient-to-r from-copper-accent to-gold-warm text-white font-semibold hover:shadow-lg hover:shadow-copper-accent/30 transition-all duration-400 hover:scale-[1.02] btn-premium",
        glass: "bg-glass-bg backdrop-blur-xl text-foreground hover:bg-glass-bg/80 border border-glass-border hover:border-primary/30 transition-all duration-400",
        satellite: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-lg hover:shadow-primary-glow/30 transition-all duration-500 transform hover:scale-[1.02] btn-premium",
        earth: "bg-gradient-to-r from-earth-green to-earth-teal text-white hover:shadow-lg hover:shadow-earth-green/30 transition-all duration-400 hover:scale-[1.02] btn-premium",
        copper: "bg-gradient-to-r from-copper-accent to-gold-warm text-white hover:from-copper-light hover:to-gold-light transition-all duration-400 hover:scale-[1.02] btn-premium shadow-lg shadow-copper-accent/20",
        "outline-premium": "border-2 border-copper-accent bg-transparent text-copper-accent hover:bg-copper-accent hover:text-white transition-all duration-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-copper-accent/30"
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg font-semibold",
        xxl: "h-16 rounded-2xl px-12 text-xl font-semibold",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
