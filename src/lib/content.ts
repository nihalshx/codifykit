import site from "@content/site.json";
import servicesData from "@content/services.json";
import appsData from "@content/apps.json";
import webData from "@content/web-projects.json";
import postersData from "@content/poster-campaigns.json";
import wheelData from "@content/wheel-cards.json";
import toolsData from "@content/tools.json";

export type AudienceSegment = { text: string; href?: string };
export type Service = (typeof servicesData.services)[number];
export type App = (typeof appsData.apps)[number];
export type WebProject = (typeof webData.projects)[number];
export type Campaign = (typeof postersData.campaigns)[number];
export type WheelCard = {
  id: string;
  type: "reel" | "app" | "poster" | "ai-video";
  label: string;
  cover: string;
  video: string | null;
  href: string;
};

export const SITE = site;
export const CONTACT = site.contact;
export const SERVICES = servicesData.services;
export const MARQUEE = servicesData.marquee;
export const PROCESS = servicesData.process;
export const APPS = appsData.apps;
export const APP_HERO_SCREENS = appsData.heroScreens;
export const PLATFORM_TECH = appsData.platformTech;
export const WEB_PROJECTS = webData.projects;
export const CAMPAIGNS = postersData.campaigns;
export const POSTER_CATEGORIES = postersData.categories;
export const WHEEL_CARDS = wheelData.cards as WheelCard[];
export const TOOLS = toolsData.groups;

/** True for any content value the owner still has to replace. */
export const isPlaceholder = (v: unknown) =>
  typeof v === "string" && /^\[(PLACEHOLDER|FILL IN)/i.test(v.trim());

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);

/** Every case study, across apps, websites and poster campaigns. */
export type CaseStudy = {
  slug: string;
  kind: "Apps" | "Websites" | "Posters";
  title: string;
  client: string;
  type: string;
  year: string;
  builtWith: string[];
  oneLine: string;
  images: string[];
  liveUrl?: string | null;
  facts: string[];
};

export const CASE_STUDIES: CaseStudy[] = [
  ...APPS.map((a) => ({
    slug: a.slug, kind: "Apps" as const, title: a.title, client: a.client,
    type: `${a.platforms.join(" and ")} app`, year: a.year, builtWith: a.builtWith,
    oneLine: a.oneLine, images: a.screens, facts: [],
  })),
  ...WEB_PROJECTS.map((w) => ({
    slug: w.slug, kind: "Websites" as const, title: w.title, client: w.client, type: w.type,
    year: w.year, builtWith: w.builtWith, oneLine: w.oneLine, images: [w.screenshot],
    liveUrl: w.liveUrl, facts: w.facts,
  })),
  ...CAMPAIGNS.map((c) => ({
    slug: c.slug, kind: "Posters" as const, title: c.title, client: c.client, type: c.type,
    year: c.date, builtWith: [], oneLine: c.caption, images: c.posters, facts: c.facts,
  })),
];
