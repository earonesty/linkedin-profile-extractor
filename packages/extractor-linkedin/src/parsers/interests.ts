export type InterestsSection = {
  interests: string[];
};

export function parseInterests(el: Element): InterestsSection {
  const interests: string[] = [];
  const listItems = el.querySelectorAll("li");

  for (const li of Array.from(listItems)) {
    const links = li.querySelectorAll("a");
    for (const link of Array.from(links)) {
      const text = link.textContent?.trim();
      if (text && !interests.includes(text)) {
        interests.push(text);
      }
    }
    if (links.length === 0) {
      const text = (li.textContent ?? "").trim();
      if (text && text.length < 100 && !interests.includes(text)) {
        interests.push(text);
      }
    }
  }

  return { interests };
}
