var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-careers-homepage.js
  var import_careers_homepage_exports = {};
  __export(import_careers_homepage_exports, {
    default: () => import_careers_homepage_default
  });

  // tools/importer/parsers/hero-careers.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(":scope > img");
    const imageCol = document.createDocumentFragment();
    if (bgImage) {
      imageCol.appendChild(bgImage);
    }
    const heading = element.querySelector("h2.headerBannerTitle, h2, h1");
    const quoteText = element.querySelector("p.text-quote, p");
    const signatureImg = element.querySelector("span > img");
    const textCol = document.createDocumentFragment();
    if (heading) textCol.appendChild(heading);
    if (quoteText) textCol.appendChild(quoteText);
    if (signatureImg) {
      const p = document.createElement("p");
      p.appendChild(signatureImg);
      textCol.appendChild(p);
    }
    const cells = [[imageCol, textCol]];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-careers", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-video.js
  function parse2(element, { document }) {
    const iframe = element.tagName === "IFRAME" ? element : element.querySelector("iframe");
    if (!iframe) return;
    const videoUrl = (iframe.getAttribute("src") || "").split("?")[0];
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.textContent = videoUrl;
    const cellFrag = document.createDocumentFragment();
    cellFrag.appendChild(document.createComment(" field:embed_placeholder "));
    cellFrag.appendChild(document.createComment(" field:embed_uri "));
    cellFrag.appendChild(link);
    const cells = [[cellFrag]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse3(element, { document }) {
    const slides = Array.from(element.querySelectorAll(":scope > div:not(.bx-clone)"));
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      if (!img) return;
      const typeCell = "carousel-gallery-item";
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:media_image "));
      imgFrag.appendChild(img);
      const textCell = "";
      cells.push([typeCell, imgFrag, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ralphlauren-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".cookies",
        "#session-popup-root",
        "img.visibility--hidden",
        ".bx-clone",
        ".bx-controls"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        ".headerNav",
        "footer.mainFooter",
        "portal-data",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/ralphlauren-sections.js
  function transform2(hookName, element, payload) {
    var _a;
    if (hookName === "afterTransform") {
      const document = element.ownerDocument;
      const sections = (_a = payload == null ? void 0 : payload.template) == null ? void 0 : _a.sections;
      if (!sections || sections.length < 2) return;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.parentNode.insertBefore(hr, sectionEl);
        }
      }
    }
  }

  // tools/importer/import-careers-homepage.js
  var parsers = {
    "hero-careers": parse,
    "embed-video": parse2,
    "carousel-gallery": parse3
  };
  var PAGE_TEMPLATE = {
    name: "careers-homepage",
    urls: [
      "https://careers.ralphlauren.com/"
    ],
    description: "Ralph Lauren Careers homepage with hero, job search, and career information sections",
    blocks: [
      {
        name: "hero-careers",
        instances: [
          "header.mainHeader .headerBanner"
        ]
      },
      {
        name: "embed-video",
        instances: [
          ".slider.with-info-text .bxslider iframe",
          ".videosLinks iframe[src*='vimeo']"
        ]
      },
      {
        name: "carousel-gallery",
        instances: [
          ".slider.vertical--content .bxsliderVertical"
        ]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero Banner",
        selector: "header.mainHeader .headerBanner",
        style: "dark",
        blocks: ["hero-careers"],
        defaultContent: []
      },
      {
        id: "pattern-of-success",
        name: "Our Pattern of Success",
        selector: "main > .no--border.content--static-info.ta-center:first-of-type",
        style: null,
        blocks: [],
        defaultContent: [
          ".pageTitle.pageTitleAlt1.sections-title",
          ".localTitle.no--border",
          ".items--buttons",
          "img[alt='Home']"
        ]
      },
      {
        id: "explore-lifeatrl",
        name: "Explore #LifeAtRL",
        selector: "main > .no--border.content--static-info.ta-center:nth-of-type(2)",
        style: null,
        blocks: ["embed-video"],
        defaultContent: [
          ".pageTitle.pageTitleAlt1.ta-center",
          ".localTitle.no--border.ta-center"
        ]
      },
      {
        id: "career-story",
        name: "Your Career Story Starts Here",
        selector: ".section__line-separator ~ h4.pageTitle.font-size24",
        style: null,
        blocks: ["carousel-gallery"],
        defaultContent: [
          "h4.pageTitle.font-size24",
          ".localTitle.no--border"
        ]
      },
      {
        id: "benefits",
        name: "So Much More Than a Job",
        selector: "h4.pageTitle.font-size24:nth-of-type(2)",
        style: null,
        blocks: [],
        defaultContent: [
          "h4.pageTitle.font-size24",
          ".localTitle.no--border",
          "a[href*='Benefits']"
        ]
      },
      {
        id: "explore-world",
        name: "Explore The World of Ralph Lauren",
        selector: "h3.pageTitle.pageTitleAlt1.sections-title:last-of-type",
        style: null,
        blocks: ["embed-video"],
        defaultContent: [
          "h3.pageTitle.pageTitleAlt1",
          ".localTitle.no--border",
          ".content--section-info .items--buttons a.saveButton"
        ]
      },
      {
        id: "footer",
        name: "Footer",
        selector: "footer.mainFooter",
        style: "dark",
        blocks: [],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_careers_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_careers_homepage_exports);
})();
