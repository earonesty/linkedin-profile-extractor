export type ActivitySection = {
  activities: Array<{ text: string | null; link: string | null }>;
};

export function parseActivity(el: Element): ActivitySection {
  const activities: Array<{ text: string | null; link: string | null }> = [];
  const listItems = el.querySelectorAll("li");

  for (const li of Array.from(listItems)) {
    const link = li.querySelector("a");
    const text = (li.textContent ?? "").trim() || null;
    const href = link?.getAttribute("href") ?? null;
    if (text || href) {
      activities.push({ text, link: href });
    }
  }

  return { activities };
}
