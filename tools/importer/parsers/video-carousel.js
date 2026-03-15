/* eslint-disable */
/* global WebImporter */

/**
 * Parser for video-carousel (YouTube bxslider carousel).
 * Source: https://careers.ralphlauren.com/
 * Each slide contains an iframe with a YouTube embed URL.
 * Produces a Video Carousel block with one row per video.
 * Generated: 2026-03-15
 */
export default function parse(element, { document }) {
  // Get all iframe elements (clones already removed by cleanup transformer)
  const iframes = element.querySelectorAll('iframe');
  if (!iframes.length) return;

  const cells = [];

  iframes.forEach((iframe) => {
    const src = (iframe.getAttribute('src') || '').split('?')[0];
    if (!src) return;

    const link = document.createElement('a');
    link.href = src;
    link.textContent = src;

    const cellFrag = document.createDocumentFragment();
    cellFrag.appendChild(link);
    cells.push([cellFrag]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'Video Carousel', cells });
  element.replaceWith(block);
}
