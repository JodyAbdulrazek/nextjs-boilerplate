/**
 * Portfolio content. Every bullet is the exact wording Judy provided; each entry's
 * bullets are arranged into a short story (what I explored → what I worked on →
 * what I built / the impact) for its detail page.
 */

export type StoryHeading = "What I explored" | "What I worked on" | "What I built" | "The impact";
export type StorySection = { heading: StoryHeading; items: string[] };
/** Extra detail-page sections, shown after the story (e.g. suggested features) */
export type ExtraSection = { heading: string; intro?: string; items?: { title: string; text: string }[]; outro?: string[] };

export type Work = {
  slug: string;
  kind: "experience" | "project" | "leadership";
  org: string;
  role: string;
  location?: string;
  dates?: string;
  /** Card accent color */
  color: string;
  /** Organization logo in /public/logos (`wide` for wordmarks) */
  logo?: { src: string; wide?: boolean };
  /** One-line summary for cards */
  tagline: string;
  story: StorySection[];
  extras?: ExtraSection[];
  /**
   * Order of the bullets as originally written, as indexes into the story's items
   * read top to bottom. Omit when the story already follows that order.
   */
  order?: number[];
  /** Only technologies named in the source content */
  tech: string[];
  skills: string[];
};

export const experiences: Work[] = [
  {
    slug: "bereal",
    logo: { src: "/logos/bereal.png" },
    kind: "experience",
    org: "BeReal",
    role: "Product Manager Apprentice",
    location: "Remote",
    dates: "August 2026 – Present",
    color: "#F6B8C8",
    tagline: "Making interactions between close friends more meaningful",
    story: [
      {
        heading: "What I explored",
        items: [
          "Studied user engagement and compared BeReal with TikTok, Instagram, and Snapchat.",
          "Identified opportunities to make interactions between close friends more meaningful.",
        ],
      },
      {
        heading: "What I built",
        items: [
          "Designed a clickable prototype for BeReal Circles, a feature that allows users to create private groups with close friends.",
          "Explored group activity, reactions, and optional reminders to encourage meaningful interactions.",
          "Used user feedback to refine the concept and presented a feature proposal and rollout strategy to BeReal leadership.",
        ],
      },
    ],
    extras: [
      {
        heading: "Suggested BeReal Features",
        items: [
          { title: "Daily Memories", text: "Let users revisit past BeReal posts from the same day in previous years to encourage them to keep sharing." },
          { title: "BeReal Circles", text: "Allow users to create smaller groups with close friends and interact through private group activity." },
          { title: "Daily Friend Prompts", text: "Give friends optional daily questions to answer through comments or reactions, creating more conversations." },
          { title: "RealMoji Improvements", text: "Make it easier to react to friends' posts with personalized expressions and more interactive reactions." },
          {
            title: "Personal Activity Recap",
            text: "Show users their posting history, memories, and interactions over the past month without public rankings or competitive streaks.",
          },
        ],
      },
      {
        heading: "Recommended Technologies",
        intro: "Use the following technology stack for the mobile feature prototype:",
        items: [
          { title: "TypeScript", text: "Main application language." },
          { title: "React Native", text: "Build the mobile app." },
          { title: "Expo", text: "Run and test the mobile prototype." },
          { title: "Firebase", text: "User accounts, database, and notifications." },
          { title: "Figma", text: "Design the screens before coding." },
        ],
        outro: [
          "Recommended stack: TypeScript + React Native + Expo.",
          "This combination is suitable for building a realistic mobile social media prototype.",
        ],
      },
      {
        heading: "Project Direction",
        intro:
          "Focus on BeReal Circles or Daily Memories first. Both are manageable projects that demonstrate product research, feature design, development, usability testing, and iteration.",
      },
    ],
    tech: [],
    skills: ["User Research", "Competitive Analysis", "Product Strategy", "Figma", "Prototyping", "Usability Testing", "Feature Development"],
  },
  {
    slug: "codepath",
    logo: { src: "/logos/codepath.png" },
    kind: "experience",
    org: "CodePath",
    role: "Applied AI Engineering Fellow",
    location: "Remote",
    dates: "August 2026 – Present",
    color: "#A9D3F5",
    tagline: "Turning ideas into working AI applications with Claude Code",
    order: [1, 0, 2],
    story: [
      {
        heading: "What I worked on",
        items: ["Used Claude and Claude Code to plan, build, test, and improve application features from start to finish."],
      },
      {
        heading: "What I built",
        items: [
          "Built an AI-powered therapy chat application using Claude Code, turning an idea into a working application.",
          "Developed an open-source capstone project, applying AI engineering concepts to solve a real-world problem.",
        ],
      },
    ],
    tech: ["Claude", "Claude Code"],
    skills: ["AI engineering", "Planning, building & testing features", "Open-source development"],
  },
  {
    slug: "gen-ai-robotics-lab",
    logo: { src: "/logos/vcu.png" },
    kind: "experience",
    org: "Generative AI & Collaborative Robotics Lab",
    role: "Researcher · Virginia Commonwealth University",
    location: "Richmond, VA",
    dates: "August 2026 – Present",
    color: "#C9B8F0",
    tagline: "Building a responsible AI academic assistant for VCU students",
    story: [
      {
        heading: "What I worked on",
        items: [
          "Collaborating with a team to develop an AI-powered academic assistant for VCU students that helps them understand assignment instructions, break down complex tasks, and clarify course concepts, offering guidance without completing work for them.",
        ],
      },
      {
        heading: "What I built",
        items: [
          "Contributing to application development, exploring AI capabilities, and testing functionality using Python for AI and backend services and TypeScript for the frontend, while researching Canvas integration through the Canvas API and LTI 1.3, pending VCU approval.",
        ],
      },
      {
        heading: "What I explored",
        items: [
          "Working through the real challenges of deploying AI in a university, including institutional approval, secure handling of student data, protecting academic integrity, and making the assistant genuinely useful, with the goal of making academic support more accessible.",
        ],
      },
    ],
    tech: ["Python", "TypeScript", "Generative AI"],
    skills: [
      "Application development",
      "Exploring AI capabilities",
      "Testing",
      "Canvas integration research",
      "Responsible AI in education",
      "Team collaboration",
    ],
  },
  {
    slug: "be-fluent",
    logo: { src: "/logos/be-fluent.jpg" },
    kind: "experience",
    org: "Be Fluent Language Academy",
    role: "Founder",
    location: "Washington, DC",
    dates: "August 2021 – August 2023",
    color: "#F7D774",
    tagline: "Founded and grew a language platform for 1,000+ learners",
    order: [3, 0, 1, 2],
    story: [
      {
        heading: "What I explored",
        items: [
          "Researched the language learning market, studied competing platforms, and identified opportunities to make language learning more engaging and accessible.",
        ],
      },
      {
        heading: "What I worked on",
        items: [
          "Conducted user research, developed learner personas, and used feedback to shape the product roadmap, prioritize features, and establish measurable goals (OKRs/KPIs).",
          "Used cognitive learning research, storytelling, and immersive technology to develop a more interactive learning experience.",
        ],
      },
      {
        heading: "The impact",
        items: [
          "Founded and grew a language learning platform serving 1,000+ learners worldwide across English, French, German, Arabic, and Spanish.",
        ],
      },
    ],
    tech: ["Immersive technology"],
    skills: [
      "Program management",
      "Project management",
      "Market research",
      "Competitive analysis",
      "User research",
      "Learner personas",
      "Product roadmapping",
      "Feature prioritization",
      "OKRs & KPIs",
      "Cognitive learning research",
      "Storytelling",
    ],
  },
  {
    slug: "kode-with-klossy",
    logo: { src: "/logos/kode-with-klossy.jpg" },
    kind: "experience",
    org: "Kode With Klossy",
    role: "Machine Learning Engineer Fellow",
    location: "Washington, DC",
    dates: "June 2025 – July 2025",
    color: "#F9C59B",
    tagline: "AI-powered, personalized mental health support",
    story: [
      {
        heading: "What I built",
        items: [
          "Collaborated with a team to build an AI-powered mental health support platform using GPT-4, addressing the need for more personalized wellness support.",
        ],
      },
      {
        heading: "What I worked on",
        items: [
          "Developed NLP workflows using Python, Hugging Face, and OpenAI APIs to support personalized conversations, wellness recommendations, mood tracking, and goal setting.",
          "Focused on creating responsive user interactions while considering secure handling of user information.",
        ],
      },
    ],
    tech: ["GPT-4", "Python", "Hugging Face", "OpenAI APIs", "NLP"],
    skills: ["Team collaboration", "NLP workflows", "Responsive user interactions", "Secure handling of user information"],
  },
];

export const projects: Work[] = [
  {
    slug: "ai-task-management-app",
    kind: "project",
    org: "AI Task Management App",
    role: "AI Productivity Platform",
    color: "#9FDBB4",
    tagline: "Helping people organize tasks, manage deadlines, and stay productive",
    story: [
      {
        heading: "What I built",
        items: [
          "Built an AI-powered task management application using TypeScript, Python, and Claude API to help users organize tasks, manage deadlines, and improve productivity.",
          "Developed features for AI task prioritization, smart scheduling, automated reminders, and breaking larger projects into manageable steps.",
        ],
      },
      {
        heading: "What I worked on",
        items: [
          "Designed, tested, and refined application features to create a more personalized and efficient task management experience.",
          "Delivered product features within an Agile development environment by collaborating with teammates through Git/GitHub and iterating on functionality throughout development.",
        ],
      },
    ],
    tech: ["TypeScript", "Python", "Claude API", "Git/GitHub"],
    skills: ["AI task prioritization", "Smart scheduling", "Automated reminders", "Designing, testing & refining features", "Agile development", "Team collaboration"],
  },
  {
    slug: "therapy-cafe",
    kind: "project",
    org: "Therapy Cafe",
    role: "AI Mental Health Support Platform",
    color: "#E8C9A8",
    tagline: "Personalized conversations, wellness recommendations, and mood tracking",
    story: [
      {
        heading: "What I built",
        items: [
          "Built an AI-powered mental health support platform using GPT-4 to provide personalized conversations, wellness recommendations, mood tracking, and goal setting.",
        ],
      },
      {
        heading: "What I worked on",
        items: ["Integrated Python, Hugging Face, and OpenAI APIs to develop NLP workflows and support personalized user interactions."],
      },
    ],
    tech: ["GPT-4", "Python", "Hugging Face", "OpenAI APIs", "NLP"],
    skills: ["NLP workflows", "Personalized user interactions"],
  },
];

export const leadership: Work[] = [
  {
    slug: "rewriting-the-code",
    logo: { src: "/logos/rewriting-the-code.png" },
    kind: "leadership",
    org: "Rewriting the Code",
    role: "Mentor",
    location: "Richmond, VA",
    dates: "March 2025 – August 2025",
    color: "#F4A7B9",
    tagline: "15+ hands-on workshops introducing students to generative AI",
    story: [
      {
        heading: "What I worked on",
        items: ["Led 15+ hands-on workshops introducing students to generative AI, emerging tools, and practical ways to use AI in their work."],
      },
      {
        heading: "The impact",
        items: [
          "Helped participants apply AI to research, brainstorming, problem-solving, and project development, contributing to a 25% increase in AI adoption and literacy and a 35% improvement in task completion.",
        ],
      },
    ],
    tech: ["Generative AI"],
    skills: ["Workshop facilitation", "Mentoring", "Teaching AI literacy"],
  },
];

export const allWork: Work[] = [...experiences, ...projects, ...leadership];

export const KIND_LABEL: Record<Work["kind"], string> = {
  experience: "experience",
  project: "passion project",
  leadership: "leadership",
};

/** Every bullet for an entry, in the order it was originally written */
export function bulletsOf(w: Work): string[] {
  const flat = w.story.flatMap((s) => s.items);
  return w.order ? w.order.map((i) => flat[i]) : flat;
}

export function getWork(slug: string): Work | undefined {
  return allWork.find((w) => w.slug === slug);
}
