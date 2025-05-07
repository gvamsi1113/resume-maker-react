import Link from 'next/link';

const FinalCtaSection = () => {
  return (
    <section id="final-cta" className="py-24 md:py-32 lg:py-40 bg-gradient-to-t from-muted to-background">
      <div className="container mx-auto max-w-screen-md px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary">
          You're Qualified. Make Sure They Know It.
        </h2>
        <p className="max-w-xl text-lg text-foreground-muted mx-auto mb-12">
          You've done the work — let your résumé prove it, instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
           <Link
             href="/generate"
             className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-12 px-8 bg-primary-foreground/90 text-primary hover:bg-primary-foreground"
           >
             Generate My Résumé
           </Link>
           <Link
             href="/chrome-extension"
             className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors border border-border h-12 px-8 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
           >
             Add Extension
           </Link>
        </div>

        {/* Trust Bar */}
        <p className="text-sm text-foreground-muted">
          Trained on 1M+ job descriptions for maximum accuracy.
        </p>
      </div>
    </section>
  );
};

export default FinalCtaSection; 