/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block (image + text card rows).
 * Source: https://careers.ralphlauren.com/CareersCorporate/YourCareer
 * Each .itemBox has: aside > img + main > h4 + p
 * Produces a Columns block with 1 row: [image, text]
 * Generated: 2026-03-15
 */
export default function parse(element, { document }) {
  // element is an .itemBox div
  const img = element.querySelector('aside img');
  const heading = element.querySelector('main h4, main h3');
  const text = element.querySelector('main p.localTitle, main p');

  // Column 1: Image
  const imgFrag = document.createDocumentFragment();
  if (img) {
    imgFrag.appendChild(img.cloneNode(true));
  }

  // Column 2: Heading + Text
  const textFrag = document.createDocumentFragment();
  if (heading) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = heading.textContent.trim();
    textFrag.appendChild(h);
  }
  if (text) {
    const p = document.createElement('p');
    p.innerHTML = text.innerHTML;
    textFrag.appendChild(p);
  }

  const cells = [[imgFrag, textFrag]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
  element.replaceWith(block);
}
