export default function BentoLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* You can add common layout elements here, like a specific navbar or footer if needed */}
      {children}
    </section>
  );
} 