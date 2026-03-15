/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-careers. Base: hero.
 * Source: https://careers.ralphlauren.com/
 * Model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Generated: 2026-03-12
 */
export default function parse(element, { document }) {
  // Model fields: image (reference) + imageAlt (text) → column 1, text (richtext) → column 2
  // Block structure: 1 row, 2 columns

  // Column 1: image + imageAlt (grouped by "image" prefix)
  const bgImage = element.querySelector(':scope > img');
  const imageCol = document.createDocumentFragment();
  if (bgImage) {
    imageCol.appendChild(bgImage);
  }

  // Column 2: text (richtext — heading + quote + signature)
  const heading = element.querySelector('h2.headerBannerTitle, h2, h1');
  const quoteText = element.querySelector('p.text-quote, p');
  const signatureImg = element.querySelector('span > img');

  const textCol = document.createDocumentFragment();
  if (heading) textCol.appendChild(heading);
  if (quoteText) textCol.appendChild(quoteText);
  if (signatureImg) {
    const p = document.createElement('p');
    p.appendChild(signatureImg);
    textCol.appendChild(p);
  }

  // Single row with both columns — even if image is empty, the column must exist
  const cells = [[imageCol, textCol]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-careers', cells });
  element.replaceWith(block);
}
