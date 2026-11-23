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
  /** Short product name, for "About …" */
  name?: string;
  /** A paragraph describing the project, shown instead of bullets */
  summary?: string;
  /** Screenshots of the project, in /public */
  screenshots?: { src: string; caption: string }[];
  /** Link to the live site */
  site?: string;
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
    slug: "elara-task-management",
    kind: "project",
    org: "Elara Task Management",
    name: "Elara",
    role: "AI Productivity Platform",
    color: "#9FDBB4",
    tagline: "Helping people organize tasks, manage deadlines, and stay productive",
    story: [],
    summary:
      "Elara is an interactive productivity platform designed to make organizing daily tasks simple and efficient. The platform helps users manage their responsibilities, track upcoming deadlines, and stay organized through a clean and user-friendly interface. With an AI-powered assistant that allows users to ask questions about their schedules and upcoming tasks, Elara Task Management creates a personalized experience that helps users prioritize their work, manage their time, and stay productive throughout the day.",
    screenshots: [
      { src: "/projects/elara/welcome.jpg", caption: "Welcome to Elara" },
      { src: "/projects/elara/task-organization.jpg", caption: "Task Organization" },
      { src: "/projects/elara/deadline-tracking.jpg", caption: "Deadline Tracking" },
      { src: "/projects/elara/reminders.jpg", caption: "Reminders" },
      { src: "/projects/elara/chatbot.jpg", caption: "Elara Chatbot" },
    ],
    site: "https://taskmanagment-vsgo.vercel.app/",
    tech: ["Python", "Claude API", "Git/GitHub"],
    skills: ["AI task prioritization", "Smart scheduling", "Automated reminders", "Designing, testing & refining features", "Agile development", "Team collaboration"],
  },
  {
    slug: "softly-cafe",
    kind: "project",
    org: "Softly Café",
    name: "Softly Café",
    role: "AI Mental Health Support Platform",
    color: "#E8C9A8",
    tagline: "Personalized conversations, wellness recommendations, and mood tracking",
    story: [],
    summary:
      "Softly Café is an AI-powered mental wellness platform designed to make emotional support feel warm, comforting, and accessible. Inspired by the cozy atmosphere of a café, the platform creates a welcoming space where users can share their thoughts, express their feelings, and receive personalized support through an interactive AI chatbot. Through thoughtful conversations, mood tracking, wellness goals, and a collection of virtual treats like coffee, cakes, and cookies, Softly Café encourages users to reflect on their emotions, build healthy habits, and prioritize their mental well-being in a fun and engaging way.",
    screenshots: [
      { src: "/projects/softly-cafe/welcome.jpg", caption: "Welcome to Softly Café" },
      { src: "/projects/softly-cafe/cafe-chat.jpg", caption: "Café Chat" },
      { src: "/projects/softly-cafe/sign-up.jpg", caption: "Creating an account" },
      { src: "/projects/softly-cafe/mood.jpg", caption: "Mood" },
      { src: "/projects/softly-cafe/goals.jpg", caption: "Goals" },
      { src: "/projects/softly-cafe/collection.jpg", caption: "Collection" },
    ],
    site: "https://cafe-ten-mocha.vercel.app/",
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
