export type FeaturedItem = {
  title: string | null;
  link: string | null;
  description: string | null;
};

export type FeaturedSection = {
  items: FeaturedItem[];
};

export function parseFeatured(el: Element): FeaturedSection {
  const items: FeaturedItem[] = [];
  const listItems = el.querySelectorAll("li");

  for (const li of Array.from(listItems)) {
    const link = li.querySelector("a");
    const href = link?.getAttribute("href") ?? null;

    const texts: string[] = [];
    for (const child of Array.from(li.children)) {
      const t = (child.textContent ?? "").trim();
      if (t) texts.push(t);
    }

    const title = texts[0] ?? link?.textContent?.trim() ?? null;
    const description = texts.length > 1 ? texts.slice(1).join(" ") : null;

    if (title || href) {
      items.push({ title, link: href, description });
    }
  }

  return { items };
}
