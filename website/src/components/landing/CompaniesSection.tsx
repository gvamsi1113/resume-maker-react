import Link from 'next/link';

// Placeholder for company logos - replace with actual images or SVGs
const CompanyLogo = ({ name }: { name: string }) => (
  <div className="h-10 flex items-center justify-center text-foreground-muted opacity-60 hover:opacity-100 transition-all">
    {/* In real use, replace this with <Image /> or <svg> */}
    <span className="font-semibold text-lg">{name}</span>
  </div>
);

const CompaniesSection = () => {
  const logos = [
    'Google', 'Meta', 'Amazon', 'Microsoft', 'Adobe',
    'Deloitte', 'Airbnb', 'Stripe', 'Netflix', 'IBM'
  ];

  return (
    <section id="companies" className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto max-w-screen-lg px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary">
          Designed to Match the Hiring Bar at Companies Like These.
        </h2>
        <p className="max-w-2xl text-lg text-foreground-muted mx-auto mb-16">
          We've studied the job descriptions of top-tier companies. Rezoome mirrors what they look for.
        </p>

        {/* Scrolling Logos Placeholder - basic grid for now */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-8 mb-16">
          {logos.map((logo) => (
            <CompanyLogo key={logo} name={logo} />
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/generate" // Or appropriate link
          className="inline-flex items-center justify-center rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-12 px-8 bg-transparent border border-border text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          Show Me How Mine Looks
        </Link>
      </div>
    </section>
  );
};

export default CompaniesSection; 