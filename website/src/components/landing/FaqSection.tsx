// FAQ Item Sub-Component
const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
  <div className="border-b border-border py-6">
    <h4 className="font-semibold text-lg text-primary">{question}</h4>
    <p className="mt-2 text-foreground-muted">{answer}</p>
  </div>
);

// FAQ Section Component
const FaqSection = () => {
  const faqData = [
    {
      question: "Is my resume data kept private and secure?",
      answer: "Absolutely. We prioritize your privacy and security. Data is encrypted in transit and at rest using industry-standard practices. We never share your personal information or resume content without your explicit consent. See our Privacy Policy for full details.",
    },
    {
      question: "How does the AI tailor the resume? What does it look for?",
      answer: "Our AI analyzes the job description you provide, identifies key skills, keywords, qualifications, and tone, and then cross-references this with your base resume/profile. It intelligently rewrites bullet points, summaries, and skill sections to highlight the most relevant aspects of your experience for that specific role, optimizing for both human reviewers and Applicant Tracking Systems (ATS).",
    },
    {
      question: "Can I edit the resume after the AI generates it?",
      answer: "Yes! The AI provides a powerful, tailored draft, but you always have full control. You can easily edit, add, or remove any section of the generated resume using our intuitive editor before finalizing and downloading.",
    },
    {
      question: "What's the difference between the free and paid plans?",
      answer: "The Free plan allows you to experience the core functionality with a limited number of AI generations per month and basic features. Paid plans (Pro/Premium) unlock unlimited AI generations, advanced features like DOCX downloads and the Chrome extension, access to premium templates, and priority support.",
    },
    {
      question: "Does the browser extension work on all job sites?",
      answer: "The Chrome extension is designed for seamless integration with major job boards like LinkedIn, Indeed, Glassdoor, and many others. While we strive for broad compatibility, functionality on some niche or custom-built job portals might vary. We continuously work to expand its compatibility.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 lg:py-32 border-t border-border">
      <div className="container mx-auto max-w-screen-md px-4 md:px-6 lg:px-8">
         <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12 text-primary">
           Frequently Asked Questions
         </h2>
         {/* Kept basic FAQ structure, adjusted spacing */}
         <div className="space-y-1">
           {faqData.map((item, index) => (
             <FaqItem key={index} question={item.question} answer={item.answer} />
           ))}
         </div>
      </div>
    </section>
  );
};

export default FaqSection; 