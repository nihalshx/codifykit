export const KITTO_GREETING = "Hi, I'm Kitto! What are you building? I can help you figure out where to start.";
export const KITTO_CHIPS = [
  { label: "A website", prompt: "I need a website." },
  { label: "An Android or iOS app", prompt: "I want to build an Android and iOS app." },
  { label: "Logo, posters or videos", prompt: "I need help with branding and content: a logo, posters or videos." },
  { label: "A CRM or ERP", prompt: "We need a CRM or ERP for our team." },
  { label: "Marketing & ads", prompt: "I need help with marketing and ads." },
  { label: "My college project", prompt: "I need help with my college project." },
];

const DRAFT_KEY = "kitto-draft";
export function stashDraft(text: string) {
  try { sessionStorage.setItem(DRAFT_KEY, text); } catch { /* ignore */ }
}
export function takeDraft() {
  try {
    const v = sessionStorage.getItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    return v;
  } catch {
    return null;
  }
}
