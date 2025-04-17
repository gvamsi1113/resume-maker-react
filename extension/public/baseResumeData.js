// Holds different sections of the base resume structured as JavaScript objects conforming to the JSON schema.

/**
 * Base resume data for the 'basics' section.
 * Includes name, contact information, location, and profiles.
 * @type {object}
 */
export const BASE_RESUME_BASICS = {
  basics: {
    name: "YOUR NAME",
    label: "Frontend Engineer",
    email: "your.email@example.com",
    phone: "(123) 456-7890",
    url: "",
    location: { city: "City", region: "State" },
    profiles: [
      {
        network: "github",
        username: "yourusername",
        url: "github.com/yourusername",
      },
      {
        network: "linkedin",
        username: "yourprofile",
        url: "linkedin.com/in/yourprofile",
      },
    ],
  },
};

/**
 * Base resume data for the 'summary' section.
 * Contains a professional summary paragraph.
 * @type {object}
 */
export const BASE_RESUME_SUMMARY = {
  summary: `Results-driven Frontend Engineer with 3+ years of non-internship experience specializing in building intuitive, high-performance web applications using React, Next.js, and TypeScript. Proven ability to enhance user experiences, optimize complex workflows, and ensure application stability and quality. Leverages a unique architectural background to inform user-centric design and technical solutions. Committed to operational excellence, collaborative problem-solving, and delivering measurable outcomes within fast-paced Agile environments.`,
};

/**
 * Base resume data for the 'work' section.
 * Contains an array of work experience items.
 * @type {object}
 */
export const BASE_RESUME_WORK = {
  work: [
    {
      name: "Conduent Inc.",
      position: "Frontend Engineer",
      url: "",
      startDate: "2024-01",
      endDate: "Present",
      story: null,
      highlights: [
        "Transformed the E-ZPass account creation workflow within the Next.js application via intuitive React/MUI redesigns, slashing clicks (24->15), improving efficiency, and ensuring full keyboard accessibility.",
        "Engineered critical modules within a complex Next.js distributed architecture, implementing resilient state synchronization and fault tolerance patterns for interacting with multiple backend microservices, ensuring data consistency.",
        "Fortified stability by eliminating 100+ bugs, implementing 100% complex validation (Yup/RHF) including handling asynchronous backend checks/workflows, achieving ~70% test coverage, enhancing data integrity.",
        "Accelerated frontend performance via deep-dive analysis (Chrome Profiler) and targeted Next.js/React rendering & data fetching optimizations, enhancing local Core Web Vitals (LCP/FID) by ~25%.",
        "Accelerated critical error resolution for operational excellence by leveraging Sentry monitoring to rapidly diagnose bugs with detailed context, significantly aiding faster MTTR on critical user-facing issues.",
        "Mastered TypeScript and GraphQL integration (mutations, fragments) within the Next.js architecture, applying strict typing and delivering dynamic Strapi CMS features with i18n support (EN/ES) ahead of schedule.",
        "Accelerated feature delivery within Agile sprints by contributing key insights during ceremonies, adapting effectively to evolving requirements to improve team workflow and ensure predictable milestone completion.",
      ],
    },
    {
      name: "Cubastion Consulting",
      position: "Software Developer",
      url: "",
      startDate: "2019-06",
      endDate: "2021-06",
      story: null,
      highlights: [
        "Addressed cumbersome dealer quoting processes while adapting to frequent scope changes, orchestrating frontend development (React/Redux) for new B2B features, driving 12% increase in dealer promotion adoption.",
        "Engineered frontend solutions within a complex microservices architecture, implementing robust patterns for asynchronous data synchronization and fault tolerance across distributed backend services, cutting integration failures by 25%.",
        "Architected predictable state management for asynchronous, multi-stage ordering workflows using Redux Saga/Thunk, ensuring data integrity during long-running operations and cutting related transaction errors by 15%.",
        "Solved poor performance rendering large parts catalogs 10k+ items implementing virtualization (react-window) and code-splitting optimizations, improving key page load metrics such as LCP by 20% for a seamless dealer experience.",
        "Ensured reliable global access for dealerships by configuring and managing frontend deployments using AWS S3 and CloudFront CDN involving S3 configuration and caching strategies, optimizing delivery speed and availability across India/Japan.",
        "Reduced cross-team integration friction by spearheading frontend collaboration on REST API design using OpenAPI specifications, decreasing integration bugs by 25% and enabling faster feature delivery.",
      ],
    },
    {
      name: "PrakritiFresh",
      position: "UI/UX Designer & Frontend Developer (Founding Team)",
      url: "",
      startDate: "2018-01",
      endDate: "2019-05",
      story: null,
      highlights: [
        "Championed user-centric design via direct field research, enabling 50+ low-tech rickshaw pullers through highly accessible interfaces featuring simplified layouts, offline-first considerations, and voice prompts.",
        "Spearheaded the initial UI/UX design across 3 core platform components (consumer app, delivery interface, dashboard), creating intuitive flows and a consistent visual language using React Native/React.",
        "Accelerated core feature delivery (browsing, cart, order) amidst rapidly shifting startup priorities by quickly mastering React Native and adapting implementation plans to evolving user feedback/business needs.",
        "Collaborated cross-functionally to launch an internal analytics dashboard frontend (React), visualizing 10+ key operational metrics by consuming REST APIs deployed on AWS EC2 querying DynamoDB.",
      ],
    },
  ],
};

/**
 * Base resume data for the 'education' section.
 * Contains an array of educational qualifications.
 * @type {object}
 */
export const BASE_RESUME_EDUCATION = {
  education: [
    {
      institution: "Arizona State University",
      area: "Information Technology",
      studyType: "Master of Science",
      startDate: "",
      endDate: "2023-12",
      gpa: "3.6/4.0",
    },
    {
      institution: "Indian Institute of Technology, Kharagpur",
      area: "Architecture",
      studyType: "Bachelor of Architecture",
      startDate: "",
      endDate: "2019-06",
      gpa: "",
    },
  ],
};

/**
 * Base resume data for the 'projects' section.
 * Contains an array of personal or professional projects.
 * @type {object}
 */
export const BASE_RESUME_PROJECTS = {
  projects: [
    {
      name: "Serverless E-Commerce Platform",
      description:
        "Designed and implemented a fully serverless e-commerce application using AWS services; created a scalable architecture handling dynamic catalog, auth, and order processing with sub-200ms response times. Implemented responsive, accessible UI using React composition patterns and CSS Grid/Flexbox; achieved a 98% Lighthouse accessibility score and consistent cross-device performance.",
      url: "",
      keywords: [
        "React.js",
        "AWS Amplify",
        "Lambda",
        "DynamoDB",
        "API Gateway",
        "Cognito",
      ],
    },
    {
      name: "ISBL - Distributed File Management System",
      description:
        "Architected a microservice-based file management system for 10GB+ document data; implemented event-driven architecture (S3 triggers, Lambda), reducing file access time to under 3 minutes. Developed a fault-tolerant frontend with graceful degradation and offline capabilities using Service Workers and IndexedDB, ensuring key functionality during network interruptions.",
      url: "",
      keywords: ["React.js", "Next.js", "AWS S3", "DynamoDB", "Elasticsearch"],
    },
  ],
};

/**
 * Base resume data for the 'skills' section.
 * Contains an array of skill categories with associated keywords.
 * @type {object}
 */
export const BASE_RESUME_SKILLS = {
  skills: [
    {
      name: "Frontend",
      keywords: [
        "React.js",
        "JavaScript (ES6+)",
        "TypeScript",
        "HTML5",
        "CSS3",
        "Next.js",
        "Redux",
        "Context API",
        "Zustand",
        "Responsive Design",
        "Cross-Browser Compatibility",
        "RESTful APIs",
        "GraphQL",
        "Material UI",
        "Tailwind CSS",
      ],
    },
    {
      name: "AWS Services",
      keywords: [
        "S3",
        "CloudFront",
        "Lambda",
        "DynamoDB",
        "API Gateway",
        "Cognito",
        "Amplify",
        "CloudWatch",
        "EC2 (Exposure)",
      ],
    },
    {
      name: "CS Fundamentals",
      keywords: [
        "Data Structures",
        "Algorithms",
        "Distributed Systems",
        "API Design",
        "Object-Oriented Design",
        "Complexity Analysis",
      ],
    },
    {
      name: "Performance & Optimization",
      keywords: [
        "Code Splitting",
        "Lazy Loading",
        "Virtualization",
        "Image Optimization",
        "Browser Caching",
        "Profiling (DevTools, Lighthouse)",
        "Core Web Vitals",
      ],
    },
    {
      name: "DevOps & Testing",
      keywords: [
        "CI/CD Awareness",
        "Monitoring (Sentry)",
        "Alerting Concepts",
        "Incident Response Concepts",
        "Jest/RTL (Exposure)",
        "Git",
        "JIRA",
      ],
    },
  ],
};

/**
 * Base resume data for optional sections like 'certificates' and 'languages'.
 * Contains empty arrays by default.
 * @type {object}
 */
export const BASE_RESUME_OTHER = {
  certificates: [],
  languages: [],
};
