// Popup script - Main logic for image downloading and WebP conversion
let stats = {
  found: 0,
  downloaded: 0,
  converted: 0,
};

// DOM Elements
const scanBtn = document.getElementById("scanBtn");
const downloadBtn = document.getElementById("downloadBtn");
const currentUrlEl = document.getElementById("currentUrl");
const imagesFoundEl = document.getElementById("imagesFound");
const statusFound = document.getElementById("statusFound");
const statusFormats = document.getElementById("statusFormats");
const statusOutput = document.getElementById("statusOutput");
const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const downloadReady = document.getElementById("downloadReady");
const formatsList = document.getElementById("formatsList");

// Initialize
init();

async function init() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      currentUrlEl.textContent = url.hostname;
    }
  } catch (e) {
    currentUrlEl.textContent = "Unable to get URL";
  }
}

// Scan button click handler
scanBtn.addEventListener("click", async () => {
  scanBtn.disabled = true;
  await scanPage();
  scanBtn.disabled = false;
});

// Download button click handler
downloadBtn.addEventListener("click", async () => {
  downloadBtn.disabled = true;
  downloadBtn.innerHTML = "<span>Downloading...</span>";

  await startImageDownload();

  downloadBtn.disabled = false;
  downloadBtn.innerHTML = `
    <svg class="btn-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 13v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M10 3v11m0 0l-4-4m4 4l4-4"/>
    </svg>
    <span>Download ZIP</span>
  `;
});

async function scanPage() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.id) {
      alert("Unable to access current tab");
      return;
    }

    // Get all images from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "getImages",
    });

    if (!response || !response.images || response.images.length === 0) {
      alert("No images found on this page");
      return;
    }

    const imageUrls = response.images;
    stats.found = imageUrls.length;

    // Show status items
    imagesFoundEl.textContent = stats.found;
    statusFound.classList.remove("hidden");
    statusFormats.classList.remove("hidden");
    statusOutput.classList.remove("hidden");

    // Detect formats
    const formats = new Set();
    imageUrls.forEach((url) => {
      const ext = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)/);
      if (ext) formats.add(ext[1].toUpperCase());
    });
    formatsList.textContent = Array.from(formats).join(", ") || "Various";
  } catch (error) {
    console.error("Scan error:", error);
    alert("Error scanning page: " + error.message);
  }
}

async function startImageDownload() {
  try {
    // Show progress section
    progressSection.classList.remove("hidden");
    downloadReady.classList.add("hidden");

    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.id) {
      throw new Error("Unable to access current tab");
    }

    // Get all images from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "getImages",
    });

    if (!response || !response.images || response.images.length === 0) {
      alert("No images found on this page");
      return;
    }

    const imageUrls = response.images;
    stats.found = imageUrls.length;

    // Download and convert images
    const zip = new JSZip();
    const imgFolder = zip.folder("images_webp");

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const progress = Math.round(((i + 1) / imageUrls.length) * 100);

      updateProgress(progress);

      try {
        const webpData = await downloadAndConvertToWebP(imageUrl);

        if (webpData) {
          const fileName = generateFileName(imageUrl, i);
          imgFolder.file(fileName, webpData);

          stats.downloaded++;
          stats.converted++;
        }
      } catch (error) {
        console.error(`Failed to process ${imageUrl}:`, error);
      }
    }

    // Generate ZIP file
    progressPercent.textContent = "Creating ZIP...";

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Download ZIP file
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const hostname = new URL(tab.url).hostname.replace(/[^a-z0-9]/gi, "_");
    const zipFileName = `${hostname}_images_${timestamp}.zip`;

    const url = URL.createObjectURL(zipBlob);

    // Use Chrome downloads API
    chrome.downloads.download(
      {
        url: url,
        filename: zipFileName,
        saveAs: true,
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          alert("Download failed: " + chrome.runtime.lastError.message);
        } else {
          // Show download ready message
          progressSection.classList.add("hidden");
          downloadReady.classList.remove("hidden");
          updateProgress(100);
        }

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
    );
  } catch (error) {
    console.error("Error:", error);
    alert("Error: " + error.message);
    progressSection.classList.add("hidden");
  }
}

async function downloadAndConvertToWebP(imageUrl) {
  try {
    // Skip SVG files (cannot convert to WebP easily in browser)
    if (imageUrl.toLowerCase().includes(".svg")) {
      return null;
    }

    // Fetch the image
    const response = await fetch(imageUrl, {
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();

    // If already WebP, return as is
    if (blob.type === "image/webp") {
      return blob;
    }

    // Convert to WebP using canvas
    return await convertBlobToWebP(blob);
  } catch (error) {
    // If CORS error, try alternative method
    console.warn(`CORS error for ${imageUrl}, using alternative method`);
    return await convertImageUrlToWebP(imageUrl);
  }
}

function convertBlobToWebP(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (webpBlob) => {
            URL.revokeObjectURL(objectUrl);
            if (webpBlob) {
              resolve(webpBlob);
            } else {
              reject(new Error("WebP conversion failed"));
            }
          },
          "image/webp",
          0.85,
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };

    img.src = objectUrl;
  });
}

function convertImageUrlToWebP(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (webpBlob) => {
            if (webpBlob) {
              resolve(webpBlob);
            } else {
              reject(new Error("WebP conversion failed"));
            }
          },
          "image/webp",
          0.85,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Image load failed"));
    };

    img.src = imageUrl;
  });
}

function generateFileName(url, index) {
  try {
    const urlObj = new URL(url);
    let fileName = urlObj.pathname.split("/").pop();

    // Remove query parameters
    fileName = fileName.split("?")[0];

    // Remove existing extension
    fileName = fileName.replace(/\.[^.]+$/, "");

    // Clean filename
    fileName = fileName.replace(/[^a-z0-9_-]/gi, "_");

    if (!fileName || fileName === "_" || fileName.length < 3) {
      fileName = `image_${index + 1}`;
    }

    return `${fileName}.webp`;
  } catch (e) {
    return `image_${index + 1}.webp`;
  }
}

function updateProgress(percent) {
  progressBar.style.width = percent + "%";
  progressPercent.textContent = percent + "%";
}
