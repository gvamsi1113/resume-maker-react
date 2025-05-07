import Link from 'next/link';

const ManualTailoringNightmareSection = () => {
  return (
    <section id="manual-pain" className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-muted to-background">
      <div className="container mx-auto max-w-screen-md px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-primary">
          Tired of Rewriting the Same Lines?
        </h2>

        {/* Placeholder for Scroll-triggered checklist */}
        <div className="bg-muted/50 backdrop-blur-sm p-8 rounded-lg border border-border mb-12 max-w-sm mx-auto">
          <h4 className="font-semibold text-lg mb-4 text-foreground">The Manual Grind:</h4>
          <ul className="space-y-2 text-left text-foreground-muted list-disc list-inside">
            <li>Reframe intro</li>
            <li>Match company tone</li>
            <li>Reorder sections</li>
            <li>Add keywords</li>
            <li>Fix formatting</li>
            <li>Cut irrelevant roles</li>
            <li>Hope for the best</li>
          </ul>
          <p className="mt-6 font-semibold italic text-accent">
            30 minutes later… you're applicant #1,042.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/generate" // Or appropriate link
          className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-12 px-8 bg-transparent border border-border text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          Skip the Hassle
        </Link>
      </div>
    </section>
  );
};

export default ManualTailoringNightmareSection; 