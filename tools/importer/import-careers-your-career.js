/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCareersParser from './parsers/hero-careers.js';
import columnsParser from './parsers/columns.js';
import videoCarouselParser from './parsers/video-carousel.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ralphlauren-cleanup.js';
import sectionsTransformer from './transformers/ralphlauren-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-careers': heroCareersParser,
  'columns': columnsParser,
  'video-carousel': videoCarouselParser,
};

// PAGE TEMPLATE CONFIGURATION (from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'careers-your-career',
  urls: [
    'https://careers.ralphlauren.com/CareersCorporate/YourCareer',
  ],
  description: 'Your Career page with career paths, development opportunities, and employee stories',
  blocks: [
    {
      name: 'hero-careers',
      instances: [
        'header.mainHeader .headerBanner.career--banner',
      ],
    },
    {
      name: 'columns',
      instances: [
        '.content--static-info .itemBox',
      ],
    },
    {
      name: 'video-carousel',
      instances: [
        '.slider.with-info-text .bxslider',
      ],
    },
  ],
  sections: [
    {
      id: 'hero-banner',
      name: 'Hero Banner',
      selector: 'header.mainHeader .headerBanner.career--banner',
      style: null,
      blocks: ['hero-careers'],
      defaultContent: [],
    },
    {
      id: 'career-values',
      name: 'Career Values',
      selector: 'main.mainContent .no--border.content--static-info',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'explore-lifeatrl',
      name: 'Explore #LifeAtRL',
      selector: 'h3.pageTitle.pageTitleAlt1.sections-title.ta-center',
      style: null,
      blocks: ['video-carousel'],
      defaultContent: [
        'h3.pageTitle.pageTitleAlt1.sections-title',
        'p.localTitle.no--border.ta-center',
      ],
    },
    {
      id: 'career-cta',
      name: 'Start Your Career Story CTA',
      selector: '.headerBanner.career--banner-below',
      style: 'dark',
      blocks: [],
      defaultContent: [
        '.headerBannerTitle',
        '.items--buttons',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
