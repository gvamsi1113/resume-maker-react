import Link from "next/link";
import IconPlaceholder from "@/components/ui/IconPlaceholder"; // Adjusted import path

const Footer = () => {
  return (
    <footer className="border-t border-border-muted bg-background-muted/30">
      <div className="container mx-auto max-w-screen-xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
           {/* Left Side: Logo & Copyright */}
          <div className="text-center md:text-left">
             <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 mb-4">
               <IconPlaceholder className="h-5 w-5 text-primary" />
               <span className="font-semibold text-lg text-primary">ResumeAI</span>
             </Link>
             <p className="text-sm text-foreground-muted">
               © {new Date().getFullYear()} ResumeAI. All rights reserved.
             </p>
          </div>

           {/* Right Side: Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
            <Link href="#features" className="text-foreground-muted hover:text-primary">Features</Link>
            <Link href="#pricing" className="text-foreground-muted hover:text-primary">Pricing</Link>
            <Link href="/terms" className="text-foreground-muted hover:text-primary">Terms</Link>
            <Link href="/privacy" className="text-foreground-muted hover:text-primary">Privacy</Link>
            <Link href="/contact" className="text-foreground-muted hover:text-primary">Contact</Link>
             {/* Optional Social Links */}
             {/* <Link href="#" className="text-foreground-muted hover:text-primary"><IconPlaceholder className="w-5 h-5" /></Link> */}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 