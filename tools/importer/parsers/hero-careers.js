/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-careers. Base: hero.
 * Source: https://careers.ralphlauren.com/
 * Model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Generated: 2026-03-12
 */
export default function parse(element, { document }) {
  // Row 1: Background image (found: direct child img in .headerBanner)
  const bgImage = element.querySelector(':scope > img');

  // Row 2: Richtext content
  // Found: h2.headerBannerTitle, p.text-quote, span > img (signature)
  const heading = element.querySelector('h2.headerBannerTitle, h2, h1');
  const quoteText = element.querySelector('p.text-quote, p');
  const signatureImg = element.querySelector('span > img');

  const cells = [];

  // Row 1: image field
  if (bgImage) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(bgImage);
    cells.push([imgFrag]);
  }

  // Row 2: text field (heading + quote + signature)
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (heading) textFrag.appendChild(heading);
  if (quoteText) textFrag.appendChild(quoteText);
  if (signatureImg) {
    const p = document.createElement('p');
    p.appendChild(signatureImg);
    textFrag.appendChild(p);
  }
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-careers', cells });
  element.replaceWith(block);
}
