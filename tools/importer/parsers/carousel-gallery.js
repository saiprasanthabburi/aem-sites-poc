/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-gallery. Base: carousel (container block).
 * Source: https://careers.ralphlauren.com/
 * Item model: carousel-gallery-item
 *   - media_image (reference), media_imageAlt (collapsed), content_text (richtext)
 * Each slide = 1 row with 3 columns: item-type, image, text
 * Generated: 2026-03-12
 */
export default function parse(element, { document }) {
  // Get all non-clone slide divs (.bx-clone removed by cleanup transformer)
  const slides = Array.from(element.querySelectorAll(':scope > div:not(.bx-clone)'));

  const cells = [];

  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    if (!img) return;

    // Col 1: Item type label
    const typeCell = 'carousel-gallery-item';

    // Col 2: Image with field hint
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:media_image '));
    imgFrag.appendChild(img);

    // Col 3: Text content (empty - source has no text per slide)
    const textCell = '';

    cells.push([typeCell, imgFrag, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
