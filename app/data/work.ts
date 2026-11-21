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

export const allWork: Work[] = [...projects];

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
