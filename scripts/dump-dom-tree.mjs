#!/usr/bin/env node

/**
 * Dump a simplified DOM tree for a given data-view-name section
 * from a LinkedIn HTML/XML file.
 *
 * Usage: node scripts/dump-dom-tree.mjs <file> <data-view-name> [maxDepth]
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
import fs from 'fs';

const file = process.argv[2];
const section = process.argv[3] || 'profile-top-card';
const maxDepth = parseInt(process.argv[4] || '10', 10);

if (!file) {
  console.error('Usage: node scripts/dump-dom-tree.mjs <file> <data-view-name> [maxDepth]');
  process.exit(1);
}

const html = fs.readFileSync(file, 'utf-8');
const dom = new JSDOM(html, { url: 'https://www.linkedin.com/in/test' });
const doc = dom.window.document;

function dump(el, indent = 0) {
  if (indent > maxDepth * 2) return;
  const tag = el.tagName?.toLowerCase();
  if (!tag) return;
  const pad = ' '.repeat(indent);
  const attrs = ['data-view-name', 'href', 'role', 'aria-label', 'id', 'alt', 'src']
    .reduce((a, k) => {
      const v = el.getAttribute(k);
      if (v) a.push(`${k}="${v.length > 100 ? v.slice(0, 100) + '...' : v}"`);
      return a;
    }, []);
  const directText = Array.from(el.childNodes)
    .filter(n => n.nodeType === 3)
    .map(n => n.textContent.trim())
    .filter(Boolean)
    .join(' ');
  const text = directText ? `  "${directText.slice(0, 150)}"` : '';
  console.log(`${pad}<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>${text}`);
  for (const child of el.children) dump(child, indent + 2);
}

const el = doc.querySelector(`[data-view-name="${section}"]`);
if (!el) {
  console.log('NOT FOUND:', section);
  process.exit(1);
}
dump(el);
