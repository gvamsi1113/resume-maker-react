import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="container mx-auto max-w-screen-md px-4 md:px-6 lg:px-8 py-24 md:py-32 lg:py-40 text-center">
      <h1 className="text-3xl md:text-6xl lg:text-5xl font-bold tracking-tight mb-6 text-primary">
         {/* Headline: */}
         Résumé <br/> Tailored for each Role <br/> Ready in seconds.
       </h1>
      <p className="max-w-xl text-foreground-muted md:text-xl lg:text-lg mx-auto mb-10">
        {/* Subheadline: */}
        Tailored for the job — delivered before they even finish reading the JD.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
         {/* CTA Button 1: White/Translucent Style */}
         <Link href="/generate" className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-12 px-8 bg-primary-foreground/90 text-primary hover:bg-primary-foreground">
           Generate My Résumé
         </Link>
         {/* CTA Button 2: Bordered Style, white hover */}
         <Link href="/chrome-extension" className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors border border-border h-12 px-8 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
           Add to Chrome
         </Link>
      </div>
    </section>
  );
};

export default HeroSection; 