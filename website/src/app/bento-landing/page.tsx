import React from 'react';

// ======== CONSTANTS ========

/** SVG stroke width for regular icons. */
const SVG_STROKE_WIDTH = 1.5;
/** SVG stroke width for bold icons. */
const SVG_STROKE_WIDTH_BOLD = 2;

/** Grid layout definition for the main content area (columns). */
const MAIN_CONTENT_GRID_LAYOUT = "4fr 6fr 3fr";
/** Grid layout definition for the primary structure of the left column. */
const LEFT_COLUMN_MAIN_LAYOUT = "2fr 1fr 3fr";
/** Grid layout definition for the sub-grid within the third vertical part of the left column. */
const LEFT_COLUMN_SUB_GRID_LAYOUT_3V = "5fr 2fr";
/** Grid layout definition for the sub-grid within the horizontal part of the left column's 3v section. */
const LEFT_COLUMN_SUB_GRID_LAYOUT_3V_2H = "2fr 5fr";
/** Grid layout definition for the center column. */
const CENTER_COLUMN_LAYOUT = "3fr 1fr";
/** Grid layout definition for the right column. */
const RIGHT_COLUMN_LAYOUT = "2fr 9fr 2fr";

/** Primary orange color, potentially for dynamic inline styles. */
const PRIMARY_ORANGE = "#E44903"; // Retained as per user request for potential dynamic use

/** Data for features list in the right column. */
const FEATURES_LIST = [
  'Standard Titles', 'File Labeling', 'Custom Summary', 'ATS-Friendly',
  'Action-Oriented', 'Professional Font', 'Consistent Format',
  'Advanced Analytics', 'Keyword Optimization', 'Industry Templates'
];

/** Data for company logos in the footer. */
const COMPANY_LOGOS = ['NETFLIX', 'Google', '', 'Meta', 'amazon'];

// ======== CORE LAYOUT COMPONENTS ========

/**
 * Represents the main header of the Bento page.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Content to be rendered inside the header.
 */
const BentoPageHeader = ({ children }: { children: React.ReactNode }) => (
  <header
    style={{
      height: 'var(--header-footer-height)',
      padding: 'var(--card-padding)',
      borderRadius: 'var(--large-rounding)'
    }}
    className="flex items-center justify-between bento-card-style"
  >
    {children}
  </header>
);

/**
 * Represents the main footer of the Bento page.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Content to be rendered inside the footer.
 */
const BentoPageFooter = ({ children }: { children: React.ReactNode }) => (
  <footer
    style={{
      height: 'var(--header-footer-height)',
      padding: 'var(--card-padding)',
      borderRadius: 'var(--large-rounding)'
    }}
    className="flex items-center justify-center bento-card-style"
  >
    {children}
  </footer>
);

/**
 * Props for the BentoCard component.
 */
interface BentoCardProps {
  className?: string;
  children: React.ReactNode;
  noPadding?: boolean;
  style?: React.CSSProperties;
  isCtaContainer?: boolean;
  centerContent?: boolean;
}

/**
 * A versatile card component for the Bento grid layout.
 * It supports optional padding, custom styles, specific CTA container styling,
 * and an option to center its content vertically and horizontally.
 */
const BentoCard = ({
  className = "",
  children,
  noPadding = false,
  style: customStyle,
  isCtaContainer = false,
  centerContent = false,
}: BentoCardProps) => {
  const cardStyle: React.CSSProperties = {
    borderRadius: 'var(--large-rounding)',
    padding: noPadding ? '0' : 'var(--card-padding)',
    ...customStyle,
  };

  const alignmentClasses = centerContent ? "flex flex-col justify-center items-center text-center" : "";
  //Ensures that dynamic classes are combined correctly without extra spaces and existing className is respected.
  const combinedClassName = [
    className,
    alignmentClasses,
    'bento-card-style',
    isCtaContainer ? 'bento-card-cta-container' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      style={cardStyle}
      className={combinedClassName}
    >
      {children}
    </div>
  );
};

// ======== PAGE HEADER CONTENT ========

/**
 * Renders the content specifically for the page header, including logo, title, and navigation.
 */
const PageHeaderContent = () => (
  <>
    <div className="flex items-center" style={{gap: 'var(--small-padding)'}}>
      <img
        src="/logo.png"
        alt="Rezoome Logo"
        style={{
          width: 'var(--logo-size)',
          height: 'var(--logo-size)',
          borderRadius: 'var(--small-rounding)'
        }}
        className="object-contain"
      />
      <span className="text-2xl font-bold metallic-text">Rezoome</span>
    </div>
    <div className="hidden md:flex items-center" style={{gap: `calc(var(--main-gap) * 1.5)`}}>
      <a href="#" className="text-helper hover:text-white text-sm">Pricing</a>
      <a href="#" className="text-helper hover:text-white text-sm">Sign In</a>
      <button
        style={{
          backgroundColor: 'white',
          color: 'black',
          borderRadius: 'var(--small-rounding)',
          padding: `var(--small-padding) var(--card-padding)`
        }}
        className="text-sm font-semibold hover:bg-gray-200"
      >
        Download Extension
      </button>
    </div>
    <div className="md:hidden">
      <button className="text-white" aria-label="Open menu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={SVG_STROKE_WIDTH} stroke="currentColor" style={{width: 'var(--icon-size-medium)', height: 'var(--icon-size-medium)'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </div>
  </>
);

// ======== LEFT COLUMN COMPONENTS ========

/**
 * Renders the content for the left column of the Bento grid.
 */
const LeftColumnContent = () => (
  <div style={{ display: 'grid', gridTemplateRows: LEFT_COLUMN_MAIN_LAYOUT, gap: 'var(--main-gap)' }} className="overflow-y-auto custom-scrollbar">
    {/* Upper section: Tailor resume & CTA */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--main-gap)'}}>
      <BentoCard>
        <p className="text-helper text-sm">Tailor your resume to JD in just</p>
        <p className="metallic-text text-5xl font-bold" style={{marginBlock: 'var(--small-padding)'}}>9.2 secs</p>
        <p className="text-helper text-sm">Be the applicant #1 not #151</p>
      </BentoCard>
      <BentoCard noPadding isCtaContainer>
        <button
          style={{
            borderRadius: 'var(--large-rounding)',
            padding: `var(--medium-padding) 0`,
            gap: 'var(--small-padding)'
          }}
          className="w-full h-full cta-gradient text-black font-semibold flex items-center justify-center hover:opacity-90 text-lg leading-none"
        >
          <span>Fix yours now</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={SVG_STROKE_WIDTH_BOLD} stroke="currentColor" style={{width: 'var(--button-icon-size)', height: 'var(--button-icon-size)'}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-xs opacity-75">upload resume</span>
        </button>
      </BentoCard>
    </div>

    {/* Middle section: Pricing */}
    <BentoCard>
      <p className="text-helper text-sm">Pricing Plans</p>
      <p className="metallic-text text-4xl font-bold">$20<span className="text-xl font-normal text-helper">/mon</span></p>
      <p className="text-xs text-helper opacity-80" style={{marginTop: 'var(--small-padding)'}}>upto 200 resumes</p>
      <p className="metallic-text text-xl font-semibold" style={{marginTop: 'var(--medium-padding)'}}>Pay-as-you-go</p>
      <p className="text-xs text-helper opacity-80" style={{marginTop: 'var(--small-padding)'}}>$1/resume - No Limits</p>
    </BentoCard>

    {/* Lower section: Subdivided content */}
    <div style={{ display: 'grid', gridTemplateColumns: LEFT_COLUMN_SUB_GRID_LAYOUT_3V, gap: 'var(--main-gap)' }}>
      <BentoCard centerContent>
        <p className="metallic-text text-3xl font-bold">24701</p>
        <p className="text-xs text-helper leading-tight">resumes</p>
        <p className="text-xs text-helper leading-tight">tailored</p>
      </BentoCard>
      <div style={{ display: 'grid', gridTemplateRows: LEFT_COLUMN_SUB_GRID_LAYOUT_3V_2H, gap: 'var(--main-gap)' }}>
        <BentoCard>
          <p className="text-helper text-sm" style={{marginBottom: 'var(--small-padding)'}}>Download file-types</p>
          <p className="metallic-text font-mono text-lg leading-tight">.pdf</p>
          <p className="metallic-text font-mono text-lg leading-tight">.doc</p>
          <p className="metallic-text font-mono text-lg leading-tight">.txt</p>
        </BentoCard>
        <BentoCard centerContent><span className="text-helper text-xs">Empty/Placeholder</span></BentoCard>
      </div>
    </div>
  </div>
);

// ======== CENTER COLUMN COMPONENTS ========

/**
 * Renders the content for the center column of the Bento grid.
 */
const CenterColumnContent = () => (
  <div style={{ display: 'grid', gridTemplateRows: CENTER_COLUMN_LAYOUT, gap: 'var(--main-gap)' }} className="overflow-hidden">
    <BentoCard
      noPadding
      style={{
        height: 'var(--image-card-height)',
        backgroundImage: "url('https://user-images.githubusercontent.com/126299464/293522313-1e61868a-1925-4079-83c7-6a4b7c9487e1.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      className="flex flex-col justify-between overflow-hidden"
    >
      {/* Content inside image card, if any, can be placed here. E.g., overlay text. */}
      {/* For now, keeping the placeholder text as an example of potential content. */}
      <div className='p-4 text-white opacity-75'>Mockup Image Area</div>
    </BentoCard>
    <BentoCard centerContent className="flex-grow">
        <p className="text-helper text-sm" style={{marginBottom: 'var(--small-padding)'}}>Generic gets ignored. Applicant #135 gets buried</p>
        <p className="metallic-text text-2xl md:text-3xl font-bold">Get tailored fast. Skip the pile.</p>
    </BentoCard>
  </div>
);

// ======== RIGHT COLUMN COMPONENTS ========

/**
 * Props for the FeatureListItem component.
 */
interface FeatureListItemProps {
  text: string;
}

/**
 * Renders a single item in the features list.
 */
const FeatureListItem = ({ text }: FeatureListItemProps) => (
  <div
    style={{
      borderRadius: 'var(--small-rounding)',
      padding: 'var(--medium-padding)',
      gap: 'var(--small-padding)'
    }}
    className="bg-[#2D2D2D] flex items-center text-sm"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width: 'var(--icon-size-small)', height: 'var(--icon-size-small)'}} className="metallic-text">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
    <span className="metallic-text">{text}</span>
  </div>
);

/**
 * Renders the content for the right column of the Bento grid.
 */
const RightColumnContent = () => (
  <div style={{ display: 'grid', gridTemplateRows: RIGHT_COLUMN_LAYOUT, gap: 'var(--main-gap)' }} className="overflow-y-auto custom-scrollbar">
    <BentoCard centerContent>
      <p className="text-helper text-sm">Smartest AI models</p>
      <p className="metallic-text text-2xl font-semibold flex items-center">
        <span className="text-3xl" style={{marginRight: 'var(--small-padding)'}}>✦</span>Gemini 2.5
      </p>
    </BentoCard>

    <BentoCard noPadding className="flex-grow overflow-hidden">
      <div className="h-full overflow-y-auto custom-scrollbar flex flex-col" style={{gap: 'var(--main-gap)'}}>
        {FEATURES_LIST.map((feature, index) => (
          <FeatureListItem key={index} text={feature} />
        ))}
      </div>
    </BentoCard>

    <BentoCard className="flex flex-row items-center justify-between" style={{gap: 'var(--medium-padding)'}}>
      <div>
          <p className="text-helper text-sm">Tailored resume</p>
          <p className="text-helper text-sm" style={{marginBottom: `calc(var(--small-padding) / 2)`}}>Download in a</p>
      </div>
      <div className="text-right">
          <p className="metallic-text text-3xl font-bold">Single</p>
          <p className="metallic-text text-3xl font-bold">Click</p>
      </div>
    </BentoCard>
  </div>
);


// ======== PAGE FOOTER CONTENT ========

/**
 * Renders the content specifically for the page footer, including company logos.
 */
const PageFooterContent = () => (
  <div className="flex flex-col items-center w-full">
      <p className="text-helper text-sm" style={{marginBottom: 'var(--medium-padding)'}}>Get Hired at Top Companies</p>
      <div style={{gap: `calc(var(--main-gap) * 1.5)`}} className="flex flex-wrap justify-center items-center">
      {COMPANY_LOGOS.map((company, index) => (
          <span key={index} className={`metallic-text text-xl md:text-2xl font-semibold ${company === '' ? 'text-3xl' : 'tracking-wider'}`}>{company}</span>
      ))}
      </div>
  </div>
);

// ======== MAIN PAGE COMPONENT ========

/**
 * The main landing page component for the Bento grid layout.
 * It structures the page into a header, main content area (with three columns),
 * and a footer, all within a single file for component definitions.
 */
const BentoLandingPage = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `var(--header-footer-height) 1fr var(--header-footer-height)`,
        padding: 'var(--page-padding)',
        gap: 'var(--main-gap)'
      }}
      className="h-screen w-screen overflow-hidden bg-[#121212] font-['Inter',_sans-serif]"
    >
      <BentoPageHeader>
        <PageHeaderContent />
      </BentoPageHeader>

      <main
        style={{
          display: 'grid',
          gridTemplateColumns: MAIN_CONTENT_GRID_LAYOUT,
          gap: 'var(--main-gap)'
        }}
        className="overflow-hidden"
      >
        <LeftColumnContent />
        <CenterColumnContent />
        <RightColumnContent />
      </main>

      <BentoPageFooter>
        <PageFooterContent />
      </BentoPageFooter>
    </div>
  );
};

export default BentoLandingPage; 