/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-careers block.
 * Source: https://careers.ralphlauren.com/
 * Model fields: bg_image (reference), bg_imageAlt (collapsed), content_text (richtext)
 * Grouped fields: bg_ prefix → column 1 (image), content_ prefix → column 2 (text)
 * Generated: 2026-03-15
 */
export default function parse(element, { document }) {
  // The hero banner: .headerBanner with background image and heading
  const heading = element.querySelector('h2, h1');
  const headingText = heading ? heading.textContent.trim() : '';

  // Get background image from computed style or CSS
  let bgImageUrl = '';
  const style = element.getAttribute('style') || '';
  const bgMatch = style.match(/background-image:\s*url\(["']?(.*?)["']?\)/);
  if (bgMatch) {
    bgImageUrl = bgMatch[1];
  }

  // Column 1: Image (bg_image + bg_imageAlt grouped by prefix)
  const imgFrag = document.createDocumentFragment();
  if (bgImageUrl) {
    const img = document.createElement('img');
    img.src = bgImageUrl;
    img.alt = headingText;
    imgFrag.appendChild(img);
  }

  // Column 2: Text content (content_text)
  const textFrag = document.createDocumentFragment();
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    textFrag.appendChild(h2);
  }

  const cells = [[imgFrag, textFrag]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero Careers', cells });
  element.replaceWith(block);
}
