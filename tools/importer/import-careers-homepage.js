/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCareersParser from './parsers/hero-careers.js';
import embedVideoParser from './parsers/embed-video.js';
import carouselGalleryParser from './parsers/carousel-gallery.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ralphlauren-cleanup.js';
import sectionsTransformer from './transformers/ralphlauren-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-careers': heroCareersParser,
  'embed-video': embedVideoParser,
  'carousel-gallery': carouselGalleryParser,
};

// PAGE TEMPLATE CONFIGURATION (from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'careers-homepage',
  urls: [
    'https://careers.ralphlauren.com/',
  ],
  description: 'Ralph Lauren Careers homepage with hero, job search, and career information sections',
  blocks: [
    {
      name: 'hero-careers',
      instances: [
        'header.mainHeader .headerBanner',
      ],
    },
    {
      name: 'embed-video',
      instances: [
        '.slider.with-info-text .bxslider iframe',
        '.videosLinks iframe[src*=\'vimeo\']',
      ],
    },
    {
      name: 'carousel-gallery',
      instances: [
        '.slider.vertical--content .bxsliderVertical',
      ],
    },
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero Banner',
      selector: 'header.mainHeader .headerBanner',
      style: 'dark',
      blocks: ['hero-careers'],
      defaultContent: [],
    },
    {
      id: 'pattern-of-success',
      name: 'Our Pattern of Success',
      selector: 'main > .no--border.content--static-info.ta-center:first-of-type',
      style: null,
      blocks: [],
      defaultContent: [
        '.pageTitle.pageTitleAlt1.sections-title',
        '.localTitle.no--border',
        '.items--buttons',
        "img[alt='Home']",
      ],
    },
    {
      id: 'explore-lifeatrl',
      name: 'Explore #LifeAtRL',
      selector: 'main > .no--border.content--static-info.ta-center:nth-of-type(2)',
      style: null,
      blocks: ['embed-video'],
      defaultContent: [
        '.pageTitle.pageTitleAlt1.ta-center',
        '.localTitle.no--border.ta-center',
      ],
    },
    {
      id: 'career-story',
      name: 'Your Career Story Starts Here',
      selector: '.section__line-separator ~ h4.pageTitle.font-size24',
      style: null,
      blocks: ['carousel-gallery'],
      defaultContent: [
        'h4.pageTitle.font-size24',
        '.localTitle.no--border',
      ],
    },
    {
      id: 'benefits',
      name: 'So Much More Than a Job',
      selector: 'h4.pageTitle.font-size24:nth-of-type(2)',
      style: null,
      blocks: [],
      defaultContent: [
        'h4.pageTitle.font-size24',
        '.localTitle.no--border',
        "a[href*='Benefits']",
      ],
    },
    {
      id: 'explore-world',
      name: 'Explore The World of Ralph Lauren',
      selector: 'h3.pageTitle.pageTitleAlt1.sections-title:last-of-type',
      style: null,
      blocks: ['embed-video'],
      defaultContent: [
        'h3.pageTitle.pageTitleAlt1',
        '.localTitle.no--border',
        '.content--section-info .items--buttons a.saveButton',
      ],
    },
    {
      id: 'footer',
      name: 'Footer',
      selector: 'footer.mainFooter',
      style: 'dark',
      blocks: [],
      defaultContent: [],
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
          section: blockDef.section || null,
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
