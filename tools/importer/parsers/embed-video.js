/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed-video. Base: embed.
 * Source: https://careers.ralphlauren.com/
 * Model fields: embed_placeholder (reference), embed_placeholderAlt (collapsed), embed_uri (text)
 * Grouped fields (embed_ prefix): embed_placeholder + embed_uri → 1 row
 * Generated: 2026-03-12
 */
export default function parse(element, { document }) {
  // element may be an iframe directly or a container with an iframe
  const iframe = element.tagName === 'IFRAME' ? element : element.querySelector('iframe');
  if (!iframe) return;

  const videoUrl = (iframe.getAttribute('src') || '').split('?')[0];
  if (!videoUrl) return;

  // Create link element for the video URL
  const link = document.createElement('a');
  link.href = videoUrl;
  link.textContent = videoUrl;

  // Row 1: embed_placeholder (optional) + embed_uri (grouped by prefix "embed_")
  const cellFrag = document.createDocumentFragment();
  cellFrag.appendChild(document.createComment(' field:embed_placeholder '));
  cellFrag.appendChild(document.createComment(' field:embed_uri '));
  cellFrag.appendChild(link);

  const cells = [[cellFrag]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
