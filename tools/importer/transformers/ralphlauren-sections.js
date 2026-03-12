/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Ralph Lauren Careers section breaks and metadata.
 * Uses payload.template.sections from page-templates.json.
 * Runs in afterTransform only (after block parsing).
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'afterTransform') {
    const document = element.ownerDocument;
    const sections = payload?.template?.sections;
    if (!sections || sections.length < 2) return;

    // Process in reverse order to preserve DOM positions
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];

      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }
      if (!sectionEl) continue;

      // Add Section Metadata block for sections with a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
      }

      // Add <hr> section break before non-first sections
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }
}
