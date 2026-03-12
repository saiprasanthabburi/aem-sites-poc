/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Ralph Lauren Careers cleanup.
 * Selectors from captured DOM of https://careers.ralphlauren.com/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent banner (found: div.cookies)
    // Remove session popup root (found: div#session-popup-root)
    // Remove LinkedIn tracking pixel (found: img.visibility--hidden)
    // Remove carousel clone slides (found: div.bx-clone) to prevent duplicate images
    // Remove carousel controls (found: div.bx-controls) - not authorable
    WebImporter.DOMUtils.remove(element, [
      '.cookies',
      '#session-popup-root',
      'img.visibility--hidden',
      '.bx-clone',
      '.bx-controls',
    ]);
  }

  if (hookName === H.after) {
    // Remove navigation (found: div.headerNav inside header.mainHeader)
    // Remove footer (found: footer.mainFooter)
    // Remove portal data elements (found: portal-data custom elements)
    // Remove link elements, iframes (already processed by parsers), noscript
    WebImporter.DOMUtils.remove(element, [
      '.headerNav',
      'footer.mainFooter',
      'portal-data',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
