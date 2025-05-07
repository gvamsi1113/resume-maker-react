import Link from 'next/link';

const PressureSection = () => {
  return (
    <section id="pressure" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto max-w-screen-md px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary">
          Others Are Already Applying. You're Still Editing.
        </h2>

        {/* Use muted background and theme border */}
        <div className="relative bg-muted/50 p-8 rounded-lg border border-border mb-12 max-w-md mx-auto h-48 flex flex-col items-center justify-center">
          <p className="text-6xl font-bold text-accent animate-pulse">1,087</p>
          <p className="absolute bottom-4 text-center text-sm text-foreground-muted px-4">
            You're #1,087. Recruiters stop reading after #50.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/generate" // Or appropriate link
          className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-12 px-8 bg-primary-foreground/90 text-primary hover:bg-primary-foreground"
        >
          Beat the Scroll
        </Link>
      </div>
    </section>
  );
};

export default PressureSection; 