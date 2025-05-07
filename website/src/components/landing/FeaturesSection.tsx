import Link from "next/link";
import IconPlaceholder from "@/components/ui/IconPlaceholder"; // Assuming you might need icons

const FeaturesSection = () => {
  return (
    <section id="why-rezoome" className="bg-transparent py-16 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-screen-lg px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary">
          Tailoring is Mandatory. Doing It Manually Is Optional.
        </h2>
        <p className="max-w-2xl text-lg text-foreground-muted mx-auto mb-12">
          Generic résumés get ignored. Recruiters want alignment. But tailoring every time? That's exhausting. Rezoome does it for you — fast, accurate, and job-specific.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Bullet 1 */}
          <div className="flex flex-col items-center p-6 bg-muted/50 backdrop-blur-sm rounded-lg border border-border">
            {/* <IconPlaceholder className="w-8 h-8 mb-4 text-accent" /> Replace with actual icon */}
            <p className="font-semibold text-lg text-primary mb-2">75%</p>
            <p className="text-foreground-muted text-sm">
              of résumés are rejected by ATS before a human sees them
            </p>
          </div>

          {/* Bullet 2 */}
          <div className="flex flex-col items-center p-6 bg-muted/50 backdrop-blur-sm rounded-lg border border-border">
            {/* <IconPlaceholder className="w-8 h-8 mb-4 text-accent" /> */}
            <p className="font-semibold text-lg text-primary mb-2">30+ Minutes</p>
            <p className="text-foreground-muted text-sm">
              Manual tailoring takes per job
            </p>
          </div>

          {/* Bullet 3 */}
          <div className="flex flex-col items-center p-6 bg-muted/50 backdrop-blur-sm rounded-lg border border-border">
            {/* <IconPlaceholder className="w-8 h-8 mb-4 text-accent" /> */}
            <p className="font-semibold text-lg text-primary mb-2">6 Seconds</p>
            <p className="text-foreground-muted text-sm">
              Most recruiters spend just scanning a résumé
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/generate" // Or appropriate link
          className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-12 px-8 bg-primary-foreground/90 text-primary hover:bg-primary-foreground"
        >
          Get Seen Instantly
        </Link>
      </div>
    </section>
  );
};

export default FeaturesSection; 