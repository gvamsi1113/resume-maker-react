import Link from 'next/link';

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 lg:py-32">
       <div className="container mx-auto max-w-screen-lg px-4 md:px-6 lg:px-8 text-center">
         <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 text-primary">
           Get Your Tailored Resume in Minutes
         </h2>
         {/* Simplified grid, added visual appeal */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
           {/* Step 1 */}
           <div className="flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-full bg-muted border-2 border-border text-accent flex items-center justify-center font-bold text-2xl mb-4">1</div>
             <h4 className="font-semibold mb-2 text-primary">Upload / Input</h4>
             <p className="text-sm text-foreground-muted">Provide your base resume or details.</p>
           </div>
            {/* Step 2 */}
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted border-2 border-border text-accent flex items-center justify-center font-bold text-2xl mb-4">2</div>
             <h4 className="font-semibold mb-2 text-primary">Paste Job Desc.</h4>
             <p className="text-sm text-foreground-muted">Add the description for the role you want.</p>
           </div>
            {/* Step 3 */}
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted border-2 border-border text-accent flex items-center justify-center font-bold text-2xl mb-4">3</div>
              <h4 className="font-semibold mb-2 text-primary">Generate & Review</h4>
             <p className="text-sm text-foreground-muted">Let AI tailor it, then review and edit.</p>
           </div>
            {/* Step 4 */}
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted border-2 border-border text-accent flex items-center justify-center font-bold text-2xl mb-4">4</div>
             <h4 className="font-semibold mb-2 text-primary">Download / Apply</h4>
             <p className="text-sm text-foreground-muted">Get your optimized resume (PDF/DOCX).</p>
           </div>
         </div>

        {/* What Rezoome Does Section */}
        <div className="mt-24 pt-16 border-t border-border">
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-primary">
            Paste the JD. Get a Résumé That Fits.
          </h3>
          <p className="max-w-xl text-lg text-foreground-muted mx-auto mb-12">
            We analyze the job. Rewrite your résumé. Format it for ATS. All in a click.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex items-center space-x-3 p-4 bg-muted/50 backdrop-blur-sm rounded-lg border border-border">
              <span className="text-green-400">✅</span>
              <span className="text-foreground-muted">ATS-optimized layout</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-muted/50 backdrop-blur-sm rounded-lg border border-border">
              <span className="text-green-400">✅</span>
              <span className="text-foreground-muted">Tailored tone + keywords</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-muted/50 backdrop-blur-sm rounded-lg border border-border">
              <span className="text-green-400">✅</span>
              <span className="text-foreground-muted">Delivered in seconds</span>
            </div>
          </div>

          {/* Mini Demo Placeholder */}
          <div className="text-center mb-12">
             <span className="text-foreground-muted italic">[Mini Demo: Paste → Click → Download PDF]</span>
           </div>


          {/* CTA */}
          <Link
            href="/generate" // Or appropriate link
            className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-12 px-8 bg-primary-foreground/90 text-primary hover:bg-primary-foreground"
          >
            Build Mine Instantly
          </Link>
        </div>
       </div>
    </section>
  );
};

export default HowItWorksSection; 