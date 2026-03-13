import { cleanTextContent } from "./dom-utils";

export type ActivitySection = {
  activities: Array<{ text: string | null; link: string | null }>;
};

/**
 * Parses activity/posts from the LinkedIn DOM.
 *
 * Uses structural DOM cleanup (removing <button>, <video>,
 * [role="dialog"] elements) rather than regex-based text filtering
 * to strip video player and UI chrome noise.
 */
export function parseActivity(el: Element): ActivitySection {
  const activities: Array<{ text: string | null; link: string | null }> = [];
  // Use direct children of the first <ul> to avoid nested <li> items
  // from video player menus, chapter lists, etc.
  const ul = el.querySelector("ul");
  const listItems = ul ? ul.querySelectorAll(":scope > li") : el.querySelectorAll(":scope > li");

  for (const li of Array.from(listItems)) {
    const link = li.querySelector("a");
    const href = link?.getAttribute("href") ?? null;
    const text = cleanTextContent(li);
    if (text && text.length > 3) {
      activities.push({ text, link: href });
    }
  }

  return { activities };
}
