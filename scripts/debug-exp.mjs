import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
import fs from 'fs';

const html = fs.readFileSync('fixtures/profiles/real-linkedin-dom.xml', 'utf-8');
const dom = new JSDOM(html, { url: 'https://www.linkedin.com/in/earonesty' });
const doc = dom.window.document;
const exp = doc.querySelector('[data-view-name="profile-card-experience"]');

const hrs = exp.querySelectorAll('hr[role="presentation"]');
console.log('Total HR count:', hrs.length);

const first = hrs[0];
const hrParent = first.parentElement;
console.log('\nHR parent tag:', hrParent.tagName, 'children:', hrParent.children.length);

const itemContainer = hrParent.parentElement;
console.log('Container tag:', itemContainer.tagName, 'children:', itemContainer.children.length);

for (const child of itemContainer.children) {
  const hasHr = child.querySelector('hr') !== null;
  const pCount = child.querySelectorAll('p').length;
  const firstP = child.querySelector('p');
  const text = firstP ? firstP.textContent.trim().slice(0, 60) : '(no p)';
  console.log(`  ${child.tagName} hasHr=${hasHr} ps=${pCount} firstP="${text}"`);
}
