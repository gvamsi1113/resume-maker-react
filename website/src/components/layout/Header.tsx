import Link from "next/link";
import IconPlaceholder from "@/components/ui/IconPlaceholder"; // Adjusted import path

const Header = () => {
  return (
    <header className="sticky top-4 z-50 w-full px-4">
      {/* Apply max width, center it, add padding, background, rounding, and shadow - Reduce height */}
      <div className="container mx-auto flex h-14 max-w-screen-lg items-center justify-between rounded-full bg-muted/60 px-6 py-2 backdrop-blur-lg shadow-md border border-border">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <IconPlaceholder className="h-6 w-6 text-primary" /> {/* Replace with actual logo */}
          <span className="font-bold text-xl text-primary">Rezoome</span>
        </Link>

        {/* Navigation (Optional) */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {/* Adjusted hover effect and color */}
          <Link href="#features" className="text-foreground-muted transition-colors hover:text-primary">Features</Link>
          <Link href="#pricing" className="text-foreground-muted transition-colors hover:text-primary">Pricing</Link>
          <Link href="#faq" className="text-foreground-muted transition-colors hover:text-primary">FAQ</Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-4">
           {/* Removed extension button for cleaner look like screenshot */}
           {/* Login Button: Subtle text style */}
           <Link href="/login" className="text-sm font-medium text-foreground-muted transition-colors hover:text-primary">
             Log In
           </Link>
           {/* Sign Up Button: White/light background, dark text, rounded */}
           <Link href="/signup" className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-background hover:bg-primary/90 h-10 px-5 py-2">
             Sign Up
           </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 