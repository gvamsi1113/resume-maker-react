import Link from "next/link";
import IconPlaceholder from "@/components/ui/IconPlaceholder"; // Adjusted import path
import styles from "@/components/ui/effects.module.css"; // Import CSS Module
import clsx from 'clsx'; // Import clsx for combining classes

const PricingSection = () => {
  return (
    <section id="pricing" className="bg-transparent py-16 md:py-24 lg:py-32">
       <div className="container mx-auto max-w-screen-lg px-4 md:px-6 lg:px-8">
         <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-16 text-primary">
           Simple, Transparent Pricing
         </h2>
         {/* Adjusted gap, card styles, highlight effect */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
           {/* Plan 1: Free - Apply glassmorphism, glare */}
           <div className={clsx(
               styles.glareEffect,
               "border border-border rounded-[var(--border-radius-card)] p-8 text-center bg-muted/30 backdrop-blur-md flex flex-col transition-transform duration-300 ease-out"
             )}>
             <h3 className="text-xl font-semibold mb-2 text-primary">Free</h3>
             <p className="text-foreground-muted mb-6 text-sm">Perfect for starting out</p>
             <p className="text-4xl font-bold mb-6 text-primary">$0<span className="text-base font-normal text-foreground-muted">/month</span></p>
             <ul className="space-y-3 text-left text-sm text-foreground-muted mb-8 flex-grow">
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> 3 AI Generations/month</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> Standard Templates</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> PDF Download</li>
             </ul>
             <Link href="/signup?plan=free" className="mt-auto w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-primary-foreground/90 text-primary hover:bg-primary-foreground">
               Get Started
             </Link>
           </div>

           {/* Plan 2: Pro (Highlight) - Apply glassmorphism, glare */}
           <div className={clsx(
               styles.glareEffect,
               "border-2 border-accent rounded-[var(--border-radius-card)] p-8 text-center bg-muted/50 backdrop-blur-md shadow-lg flex flex-col scale-105 transition-transform duration-300 ease-out"
             )}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white px-3 py-0.5 rounded-full text-xs font-semibold">Most Popular</div>
             <h3 className="text-xl font-semibold mb-2 text-primary">Pro</h3>
             <p className="text-foreground-muted mb-6 text-sm">For active job seekers</p>
             <p className="text-4xl font-bold mb-6 text-primary">$15<span className="text-base font-normal text-foreground-muted">/month</span></p>
             <ul className="space-y-3 text-left text-sm text-foreground-muted mb-8 flex-grow">
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> Unlimited AI Generations</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> Premium Templates</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> PDF, DOCX Downloads</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> Chrome Extension Access</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> Priority Support</li>
             </ul>
             <Link href="/signup?plan=pro" className="mt-auto w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-primary-foreground/90 text-primary hover:bg-primary-foreground">
               Choose Pro
             </Link>
           </div>

           {/* Plan 3: Premium - Apply glassmorphism, glare */}
            <div className={clsx(
                styles.glareEffect,
                "border border-border rounded-[var(--border-radius-card)] p-8 text-center bg-muted/30 backdrop-blur-md flex flex-col transition-transform duration-300 ease-out"
              )}>
             <h3 className="text-xl font-semibold mb-2 text-primary">Premium</h3>
             <p className="text-foreground-muted mb-6 text-sm">For power users & teams</p>
             <p className="text-4xl font-bold mb-6 text-primary">$25<span className="text-base font-normal text-foreground-muted">/month</span></p>
             <ul className="space-y-3 text-left text-sm text-foreground-muted mb-8 flex-grow">
                <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> Everything in Pro</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" /> Advanced AI Suggestions</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-foreground-muted flex-shrink-0" /> Team Features (Soon)</li>
               <li className="flex items-center"><IconPlaceholder className="w-4 h-4 mr-3 text-foreground-muted flex-shrink-0" /> API Access (Soon)</li>
             </ul>
              <Link href="/signup?plan=premium" className="mt-auto w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-primary-foreground/90 text-primary hover:bg-primary-foreground">
               Go Premium
             </Link>
           </div>
         </div>
          <p className="text-center text-foreground-muted mt-10 text-sm">
            Annual billing available for discounted rates. Need an enterprise plan? <Link href="/contact" className="font-medium text-accent hover:text-accent-light underline">Contact Us</Link>
          </p>
       </div>
    </section>
  );
};

export default PricingSection; 