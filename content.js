// Content script to extract all images from the current page
(function () {
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getImages") {
      const images = extractAllImages();
      sendResponse({ images: images });
    }
    return true;
  });

  function extractAllImages() {
    const imageUrls = new Set();
    const allImageExtensions = new Set([
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
      "bmp",
      "tiff",
      "tif",
      "heif",
      "heic",
      "avif",
      "ico",
      "jxr",
      "jp2",
      "j2k",
    ]);

    function isImageUrl(url) {
      if (!url || url.startsWith("data:")) return false;

      const urlLower = url.toLowerCase();

      // Check for image extensions
      for (const ext of allImageExtensions) {
        if (urlLower.includes(`.${ext}`) || urlLower.endsWith(`.${ext}`)) {
          return true;
        }
      }

      // Check for image path patterns
      const imagePathPatterns = [
        /\/images?\//i,
        /\/img\//i,
        /\/assets\//i,
        /\/media\//i,
        /\/uploads\//i,
        /\/photos?\//i,
        /\/gallery\//i,
        /\/pictures?\//i,
      ];

      return imagePathPatterns.some((pattern) => pattern.test(urlLower));
    }

    function makeAbsoluteUrl(url) {
      try {
        return new URL(url, window.location.href).href;
      } catch (e) {
        return null;
      }
    }

    // 1. Get all <img> tags
    const imgTags = document.querySelectorAll("img");
    imgTags.forEach((img) => {
      const possibleAttributes = [
        "src",
        "data-src",
        "data-lazy-src",
        "data-original",
        "srcset",
      ];

      possibleAttributes.forEach((attr) => {
        let src = img.getAttribute(attr);

        if (src) {
          if (attr === "srcset") {
            // Handle srcset (contains multiple URLs)
            const srcsetUrls = src
              .split(",")
              .map((item) => item.trim().split(" ")[0])
              .filter((url) => url && !url.startsWith("data:"));

            srcsetUrls.forEach((url) => {
              const absoluteUrl = makeAbsoluteUrl(url);
              if (absoluteUrl && isImageUrl(absoluteUrl)) {
                imageUrls.add(absoluteUrl);
              }
            });
          } else if (!src.startsWith("data:")) {
            const absoluteUrl = makeAbsoluteUrl(src);
            if (absoluteUrl && isImageUrl(absoluteUrl)) {
              imageUrls.add(absoluteUrl);
            }
          }
        }
      });
    });

    // 2. Get background images from inline styles
    const allElements = document.querySelectorAll("*");
    allElements.forEach((element) => {
      const style = element.getAttribute("style");
      if (style) {
        const bgMatch = style.match(
          /background(?:-image)?\s*:\s*url\(['"]?([^'")]+)['"]?\)/i,
        );
        if (bgMatch && bgMatch[1] && !bgMatch[1].startsWith("data:")) {
          const absoluteUrl = makeAbsoluteUrl(bgMatch[1]);
          if (absoluteUrl && isImageUrl(absoluteUrl)) {
            imageUrls.add(absoluteUrl);
          }
        }
      }
    });

    // 3. Get background images from computed styles
    allElements.forEach((element) => {
      try {
        const computedStyle = window.getComputedStyle(element);
        const bgImage = computedStyle.backgroundImage;

        if (bgImage && bgImage !== "none") {
          const urlMatch = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/i);
          if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith("data:")) {
            const absoluteUrl = makeAbsoluteUrl(urlMatch[1]);
            if (absoluteUrl && isImageUrl(absoluteUrl)) {
              imageUrls.add(absoluteUrl);
            }
          }
        }
      } catch (e) {
        // Skip elements with style access errors
      }
    });

    // 4. Get images from <picture> and <source> tags
    const pictureTags = document.querySelectorAll("picture source, source");
    pictureTags.forEach((source) => {
      const srcset = source.getAttribute("srcset");
      if (srcset) {
        const srcsetUrls = srcset
          .split(",")
          .map((item) => item.trim().split(" ")[0])
          .filter((url) => url && !url.startsWith("data:"));

        srcsetUrls.forEach((url) => {
          const absoluteUrl = makeAbsoluteUrl(url);
          if (absoluteUrl && isImageUrl(absoluteUrl)) {
            imageUrls.add(absoluteUrl);
          }
        });
      }
    });

    // 5. Get images from <link> tags (favicons, etc.)
    const linkTags = document.querySelectorAll('link[rel*="icon"]');
    linkTags.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !href.startsWith("data:")) {
        const absoluteUrl = makeAbsoluteUrl(href);
        if (absoluteUrl) {
          imageUrls.add(absoluteUrl);
        }
      }
    });

    return Array.from(imageUrls);
  }
})();
