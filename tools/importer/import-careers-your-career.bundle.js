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

  // tools/importer/import-careers-your-career.js
  var import_careers_your_career_exports = {};
  __export(import_careers_your_career_exports, {
    default: () => import_careers_your_career_default
  });

  // tools/importer/parsers/hero-careers.js
  function parse(element, { document }) {
    const heading = element.querySelector("h2, h1");
    const headingText = heading ? heading.textContent.trim() : "";
    let bgImageUrl = "";
    const style = element.getAttribute("style") || "";
    const bgMatch = style.match(/background-image:\s*url\(["']?(.*?)["']?\)/);
    if (bgMatch) {
      bgImageUrl = bgMatch[1];
    }
    const imgFrag = document.createDocumentFragment();
    if (bgImageUrl) {
      const img = document.createElement("img");
      img.src = bgImageUrl;
      img.alt = headingText;
      imgFrag.appendChild(img);
    }
    const textFrag = document.createDocumentFragment();
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = headingText;
      textFrag.appendChild(h2);
    }
    const cells = [[imgFrag, textFrag]];
    const block = WebImporter.Blocks.createBlock(document, { name: "Hero Careers", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document }) {
    const img = element.querySelector("aside img");
    const heading = element.querySelector("main h4, main h3");
    const text = element.querySelector("main p.localTitle, main p");
    const imgFrag = document.createDocumentFragment();
    if (img) {
      imgFrag.appendChild(img.cloneNode(true));
    }
    const textFrag = document.createDocumentFragment();
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = heading.textContent.trim();
      textFrag.appendChild(h);
    }
    if (text) {
      const p = document.createElement("p");
      p.innerHTML = text.innerHTML;
      textFrag.appendChild(p);
    }
    const cells = [[imgFrag, textFrag]];
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-carousel.js
  function parse3(element, { document }) {
    const iframes = element.querySelectorAll("iframe");
    if (!iframes.length) return;
    const cells = [];
    iframes.forEach((iframe) => {
      const src = (iframe.getAttribute("src") || "").split("?")[0];
      if (!src) return;
      const link = document.createElement("a");
      link.href = src;
      link.textContent = src;
      const cellFrag = document.createDocumentFragment();
      cellFrag.appendChild(link);
      cells.push([cellFrag]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "Video Carousel", cells });
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

  // tools/importer/import-careers-your-career.js
  var parsers = {
    "hero-careers": parse,
    "columns": parse2,
    "video-carousel": parse3
  };
  var PAGE_TEMPLATE = {
    name: "careers-your-career",
    urls: [
      "https://careers.ralphlauren.com/CareersCorporate/YourCareer"
    ],
    description: "Your Career page with career paths, development opportunities, and employee stories",
    blocks: [
      {
        name: "hero-careers",
        instances: [
          "header.mainHeader .headerBanner.career--banner"
        ]
      },
      {
        name: "columns",
        instances: [
          ".content--static-info .itemBox"
        ]
      },
      {
        name: "video-carousel",
        instances: [
          ".slider.with-info-text .bxslider"
        ]
      }
    ],
    sections: [
      {
        id: "hero-banner",
        name: "Hero Banner",
        selector: "header.mainHeader .headerBanner.career--banner",
        style: null,
        blocks: ["hero-careers"],
        defaultContent: []
      },
      {
        id: "career-values",
        name: "Career Values",
        selector: "main.mainContent .no--border.content--static-info",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "explore-lifeatrl",
        name: "Explore #LifeAtRL",
        selector: "h3.pageTitle.pageTitleAlt1.sections-title.ta-center",
        style: null,
        blocks: ["video-carousel"],
        defaultContent: [
          "h3.pageTitle.pageTitleAlt1.sections-title",
          "p.localTitle.no--border.ta-center"
        ]
      },
      {
        id: "career-cta",
        name: "Start Your Career Story CTA",
        selector: ".headerBanner.career--banner-below",
        style: "dark",
        blocks: [],
        defaultContent: [
          ".headerBannerTitle",
          ".items--buttons"
        ]
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
            element
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_careers_your_career_default = {
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
  return __toCommonJS(import_careers_your_career_exports);
})();
