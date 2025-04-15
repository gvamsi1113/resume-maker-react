// extension/public/baseResumeData.js - Holds base resume text and structured JSON

// Holds different sections of the base resume as plain text strings.
export const BASE_RESUME_BASICS = `YOUR NAME
City, State | your.email@example.com | (123) 456-7890 | github.com/yourusername | linkedin.com/in/yourprofile`;

export const BASE_RESUME_SUMMARY = `PROFESSIONAL SUMMARY
Results-driven Frontend Engineer with 3+ years of non-internship experience specializing in building intuitive, high-performance web applications using React, Next.js, and TypeScript. Proven ability to enhance user experiences, optimize complex workflows, and ensure application stability and quality. Leverages a unique architectural background to inform user-centric design and technical solutions. Committed to operational excellence, collaborative problem-solving, and delivering measurable outcomes within fast-paced Agile environments.`;

export const BASE_RESUME_WORK = `PROFESSIONAL EXPERIENCE

Frontend Engineer
Conduent Inc. | January 2024 - Present

*   Transformed the E-ZPass account creation workflow within the Next.js application via intuitive React/MUI redesigns, slashing clicks (24->15), improving efficiency, and ensuring full keyboard accessibility.
*   Engineered critical modules within a complex Next.js distributed architecture, implementing resilient state synchronization and fault tolerance patterns for interacting with multiple backend microservices, ensuring data consistency.
*   Fortified stability by eliminating 100+ bugs, implementing 100% complex validation (Yup/RHF) including handling asynchronous backend checks/workflows, achieving ~70% test coverage, enhancing data integrity.
*   Accelerated frontend performance via deep-dive analysis (Chrome Profiler) and targeted Next.js/React rendering & data fetching optimizations, enhancing local Core Web Vitals (LCP/FID) by ~25%.
*   Accelerated critical error resolution for operational excellence by leveraging Sentry monitoring to rapidly diagnose bugs with detailed context, significantly aiding faster MTTR on critical user-facing issues.
*   Mastered TypeScript and GraphQL integration (mutations, fragments) within the Next.js architecture, applying strict typing and delivering dynamic Strapi CMS features with i18n support (EN/ES) ahead of schedule.
*   Accelerated feature delivery within Agile sprints by contributing key insights during ceremonies, adapting effectively to evolving requirements to improve team workflow and ensure predictable milestone completion.
*   Environment: JavaScript, TypeScript, HTML5, CSS3, React.js, Next.js, Material UI, Zustand, React Context API, Yup, GraphQL, RESTful APIs, Strapi CMS, Chrome DevTools, React DevTools, Sentry, Adobe XD, Git.

Software Developer
Cubastion Consulting | June 2019 - June 2021

*   Addressed cumbersome dealer quoting processes while adapting to frequent scope changes, orchestrating frontend development (React/Redux) for new B2B features, driving 12% increase in dealer promotion adoption.
*   Engineered frontend solutions within a complex microservices architecture, implementing robust patterns for asynchronous data synchronization and fault tolerance across distributed backend services, cutting integration failures by 25%.
*   Architected predictable state management for asynchronous, multi-stage ordering workflows using Redux Saga/Thunk, ensuring data integrity during long-running operations and cutting related transaction errors by 15%.
*   Solved poor performance rendering large parts catalogs 10k+ items implementing virtualization (react-window) and code-splitting optimizations, improving key page load metrics such as LCP by 20% for a seamless dealer experience.
*   Ensured reliable global access for dealerships by configuring and managing frontend deployments using AWS S3 and CloudFront CDN involving S3 configuration and caching strategies, optimizing delivery speed and availability across India/Japan.
*   Reduced cross-team integration friction by spearheading frontend collaboration on REST API design using OpenAPI specifications, decreasing integration bugs by 25% and enabling faster feature delivery.
*   Environment: React.js, JavaScript, Typescript, Node.js, Redux (Redux Saga/Thunk exposure), HTML5, CSS3, Tailwind CSS, REST APIs, OpenAPI, Jest/RTL, AWS S3, CloudFront, API Gateway, Lambdas, DynamoDB, Git, JIRA, Analytics Tools.

UI/UX Designer & Frontend Developer (Founding Team)
PrakritiFresh | January 2018 - May 2019

*   Championed user-centric design via direct field research, enabling 50+ low-tech rickshaw pullers through highly accessible interfaces featuring simplified layouts, offline-first considerations, and voice prompts.
*   Spearheaded the initial UI/UX design across 3 core platform components (consumer app, delivery interface, dashboard), creating intuitive flows and a consistent visual language using React Native/React.
*   Accelerated core feature delivery (browsing, cart, order) amidst rapidly shifting startup priorities by quickly mastering React Native and adapting implementation plans to evolving user feedback/business needs.
*   Collaborated cross-functionally to launch an internal analytics dashboard frontend (React), visualizing 10+ key operational metrics by consuming REST APIs deployed on AWS EC2 querying DynamoDB.
*   Environment: JavaScript, React Native, React, HTML5, CSS3, Git, Wireframing Tools, Qualitative User Research Methods, AWS (EC2, DynamoDB exposure).`;

export const BASE_RESUME_EDUCATION = `EDUCATION

Master of Science in Information Technology
Arizona State University | Graduated: December 2023 | GPA: 3.6/4.0
Relevant Coursework: Advanced Web Development, Distributed Systems Architecture, Cloud Computing, Data Structures & Algorithms

Bachelor of Architecture
Indian Institute of Technology, Kharagpur | Graduated: June 2019
Applied architectural skills in design thinking, spatial visualization, and user journey planning to enhance digital interface design and user experience.`;

export const BASE_RESUME_PROJECTS = `PROJECTS

Serverless E-Commerce Platform
Technologies: React.js, AWS Amplify, Lambda, DynamoDB, API Gateway, Cognito | March 2023 - Present
*   Designed and implemented a fully serverless e-commerce application using AWS services; created a scalable architecture handling dynamic catalog, auth, and order processing with sub-200ms response times.
*   Implemented responsive, accessible UI using React composition patterns and CSS Grid/Flexbox; achieved a 98% Lighthouse accessibility score and consistent cross-device performance.

ISBL - Distributed File Management System
Technologies: React.js, Next.js, AWS S3, DynamoDB, Elasticsearch | January 2021 - July 2021
*   Architected a microservice-based file management system for 10GB+ document data; implemented event-driven architecture (S3 triggers, Lambda), reducing file access time to under 3 minutes.
*   Developed a fault-tolerant frontend with graceful degradation and offline capabilities using Service Workers and IndexedDB, ensuring key functionality during network interruptions.`;

export const BASE_RESUME_SKILLS = `TECHNICAL SKILLS

Frontend: React.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Next.js, Redux, Context API, Zustand, Responsive Design, Cross-Browser Compatibility, RESTful APIs, GraphQL, Material UI, Tailwind CSS
AWS Services: S3, CloudFront, Lambda, DynamoDB, API Gateway, Cognito, Amplify, CloudWatch, EC2 (Exposure)
CS Fundamentals: Data Structures, Algorithms, Distributed Systems, API Design, Object-Oriented Design, Complexity Analysis
Performance & Optimization: Code Splitting, Lazy Loading, Virtualization, Image Optimization, Browser Caching, Profiling (DevTools, Lighthouse), Core Web Vitals
DevOps & Testing: CI/CD Awareness, Monitoring (Sentry), Alerting Concepts, Incident Response Concepts, Jest/RTL (Exposure), Git, JIRA`;

// Holds different sections of the base resume structured as JavaScript objects conforming to the JSON schema.
export const BASE_JSON_BASICS = {
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
    summary: "", // Summary text handled separately initially
  },
};

export const BASE_JSON_SUMMARY = {
  summary: `Results-driven Frontend Engineer with 3+ years of non-internship experience specializing in building intuitive, high-performance web applications using React, Next.js, and TypeScript. Proven ability to enhance user experiences, optimize complex workflows, and ensure application stability and quality. Leverages a unique architectural background to inform user-centric design and technical solutions. Committed to operational excellence, collaborative problem-solving, and delivering measurable outcomes within fast-paced Agile environments.`,
};

export const BASE_JSON_WORK = {
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

export const BASE_JSON_EDUCATION = {
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

export const BASE_JSON_PROJECTS = {
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

export const BASE_JSON_SKILLS = {
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

export const BASE_JSON_OTHER = {
  certificates: [],
  languages: [],
};

// Combines all base resume text chunks into a single string for the API prompt.
export const BASE_RESUME = `${BASE_RESUME_BASICS}\n${BASE_RESUME_SUMMARY}\n${BASE_RESUME_WORK}\n${BASE_RESUME_EDUCATION}\n${BASE_RESUME_PROJECTS}\n${BASE_RESUME_SKILLS}`;

// Combines all base resume JSON objects into a single, complete structured object.
export const BASE_RESUME_JSON = {
  ...BASE_JSON_BASICS.basics, // Spread the inner 'basics' object
  summary: BASE_JSON_SUMMARY.summary, // Add the summary string
  work: BASE_JSON_WORK.work,
  education: BASE_JSON_EDUCATION.education,
  projects: BASE_JSON_PROJECTS.projects,
  skills: BASE_JSON_SKILLS.skills,
  ...BASE_JSON_OTHER, // Spread certificates and languages
};
