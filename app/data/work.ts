export type Work = {
  slug: string;
  kind: "experience" | "project";
  org: string;
  role: string;
  location?: string;
  dates?: string;
  /** Card accent color */
  color: string;
  tagline: string;
  bullets: string[];
  skills: string[];
};

export const experiences: Work[] = [
  {
    slug: "bereal",
    kind: "experience",
    org: "BeReal",
    role: "Product Manager Apprenticeship",
    location: "Remote",
    dates: "August 2026 – Present",
    color: "#F6B8C8",
    tagline: "Finding engagement gaps on a 40M-user social platform",
    bullets: [
      "Analyzed user behavior and product features to understand engagement patterns and identify opportunities to improve the user experience on BeReal.",
      "Mapped user behavior across BeReal's 40M-user platform and compared TikTok, Instagram, and Snapchat to identify engagement gaps, user drop-off points, and opportunities to grow monthly active users (MAUs).",
      "Designed and tested a clickable feature prototype using usability testing and real user feedback, turning findings into a feature proposal and rollout strategy presented to BeReal leadership.",
    ],
    skills: ["Product Strategy", "User Research", "Competitive Analysis", "Prototyping", "Usability Testing"],
  },
  {
    slug: "codepath",
    kind: "experience",
    org: "CodePath",
    role: "Applied AI Engineering Fellow",
    location: "Remote",
    dates: "August 2026 – Present",
    color: "#A9D3F5",
    tagline: "Building real AI apps end-to-end with Claude Code",
    bullets: [
      "Built a fully functional AI-powered therapy chat app using Claude Code, applying AI engineering skills to develop a real-world application.",
      "Strengthened AI fluency and vibe-coding skills by using Claude and Claude Code to build applications end-to-end.",
      "Developed an advanced open-source capstone project, demonstrating practical AI engineering and application development skills.",
    ],
    skills: ["Claude Code", "AI Engineering", "App Development", "Open Source"],
  },
  {
    slug: "gen-ai-robotics-lab",
    kind: "experience",
    org: "Generative AI & Collaborative Robotics Lab",
    role: "Researcher · Virginia Commonwealth University",
    location: "Richmond, VA",
    dates: "August 2026 – Present",
    color: "#C9B8F0",
    tagline: "Teaching robots to understand tasks and work alongside people",
    bullets: [
      "Developed AI-powered robotics applications by integrating generative AI with mobile robots, drones, and collaborative robots to support autonomous decision-making and human-robot interaction.",
      "Built and tested AI-driven robotic workflows using Python and AI frameworks, evaluating how robots can better understand tasks, make decisions, and work alongside people.",
      "Collaborated with an interdisciplinary research team to prototype, test, and present robotics solutions, contributing to research demonstrations and publications.",
    ],
    skills: ["Python", "Generative AI", "Robotics", "Human-Robot Interaction", "Research"],
  },
  {
    slug: "be-fluent",
    kind: "experience",
    org: "Be Fluent Language Academy",
    role: "EdTech Program Manager",
    location: "Washington, DC",
    dates: "August 2021 – August 2023",
    color: "#F7D774",
    tagline: "Founded and scaled a language platform for 1,000+ learners",
    bullets: [
      "Founded and scaled a language-learning platform serving 1,000+ global learners in English, French, German, Arabic, and Spanish, built on cognitive learning research, immersive technology, and storytelling.",
      "Shaped the product vision and roadmap through hands-on market and competitive research to identify gaps in the language-learning industry.",
      "Led in-depth user research and persona development, translating learner needs into prioritized features and measurable OKRs/KPIs.",
    ],
    skills: ["Product Vision", "Roadmapping", "Market Research", "User Personas", "OKRs & KPIs"],
  },
  {
    slug: "technica",
    kind: "experience",
    org: "Technica",
    role: "Software Developer Fellow",
    location: "College Park, Maryland",
    dates: "June 2026 – August 2026",
    color: "#9FDBB4",
    tagline: "An AI-powered task manager, built the Agile way",
    bullets: [
      "Built an AI-powered task management application by developing task organization, deadline tracking, and automated reminder features based on project and user requirements.",
      "Delivered product features within an Agile development environment by collaborating with teammates through Git/GitHub and iterating on functionality throughout development.",
      "Improved task-management functionality by integrating AI capabilities and refining features based on user needs and project requirements.",
    ],
    skills: ["AI Integration", "Agile", "Git & GitHub", "Feature Development"],
  },
  {
    slug: "kode-with-klossy",
    kind: "experience",
    org: "Kode with Klossy",
    role: "Machine Learning Engineer Fellow",
    location: "Washington, DC",
    dates: "June 2025 – July 2025",
    color: "#F9C59B",
    tagline: "GPT-4 powered, personalized mental health support",
    bullets: [
      "Built an AI-powered mental health support platform by collaborating with a team to integrate GPT-4 for personalized conversations, wellness recommendations, mood tracking, and goal setting, expanding the platform's ability to provide personalized wellness support.",
      "Enabled personalized user interactions by implementing NLP workflows with Python, Hugging Face, and OpenAI APIs, supporting responsive conversations and individualized wellness recommendations while prioritizing secure data handling.",
    ],
    skills: ["Python", "NLP", "Hugging Face", "OpenAI API", "GPT-4"],
  },
  {
    slug: "rewriting-the-code",
    kind: "experience",
    org: "Rewriting the Code",
    role: "Mentor",
    location: "Richmond, VA",
    dates: "March 2025 – August 2025",
    color: "#F4A7B9",
    tagline: "15+ hands-on workshops on generative AI tools",
    bullets: [
      "Facilitated 15+ technical workshops on generative AI and emerging AI tools, increasing AI adoption and literacy by 25% and task completion by 35% through hands-on training in research, brainstorming, problem-solving, and project development.",
    ],
    skills: ["Workshops", "Generative AI", "Teaching", "Mentorship"],
  },
];

export const projects: Work[] = [
  {
    slug: "therapy-cafe",
    kind: "project",
    org: "Therapy Cafe",
    role: "AI Mental Health Support",
    color: "#E8C9A8",
    tagline: "A cozy corner of the internet to talk, reflect, and grow",
    bullets: [
      "Developed an AI-powered mental health support platform leveraging GPT-4 to provide personalized conversations, wellness recommendations, mood tracking, and goal-setting features.",
      "Implemented natural language processing workflows using Python, Hugging Face, and OpenAI APIs to deliver personalized user interactions while prioritizing secure data handling.",
    ],
    skills: ["GPT-4", "Python", "NLP", "Hugging Face", "OpenAI API"],
  },
];

export const allWork: Work[] = [...experiences, ...projects];

export function getWork(slug: string): Work | undefined {
  return allWork.find((w) => w.slug === slug);
}
