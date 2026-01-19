# 🖼️ Image Downloader WebP - Chrome Extension

A powerful Chrome extension that automatically downloads all images from any website and converts them to WebP format in a ZIP file.

## ✨ Features

- 🔍 **Automatically finds ALL images** on the current webpage
  - Regular `<img>` tags
  - Background images (CSS)
  - Lazy-loaded images
  - Images in `srcset` attributes
  - Favicons and icons
  - Images from `<picture>` and `<source>` tags

- 🎯 **WebP Conversion**
  - Converts all images to WebP format
  - 85% quality for optimal size/quality balance
  - Handles JPG, PNG, GIF, BMP, TIFF formats
  - Skips SVG files (vector graphics)

- 📦 **ZIP Download**
  - All images packed in a single ZIP file
  - Organized in `images_webp` folder
  - Automatic filename with website name and timestamp

- 📊 **Real-time Progress**
  - Live statistics (found, downloaded, converted)
  - Progress bar showing conversion status
  - Status messages for each step

## 🚀 Installation

### Method 1: Load Unpacked (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. The extension is now installed! 🎉

### Method 2: From CRX File (if available)

1. Download the `.crx` file
2. Drag and drop it into `chrome://extensions/`
3. Click **Add extension**

## 📖 How to Use

1. **Navigate** to any website you want to download images from
2. **Click** the extension icon in the toolbar
3. **Click** the "Download All Images as WebP" button
4. **Wait** for the extension to:
   - Find all images on the page
   - Download each image
   - Convert to WebP format
   - Create a ZIP file
5. **Save** the ZIP file when prompted

## 📂 Extension Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Main logic (download & convert)
├── content.js            # Page image extraction script
├── styles.css            # UI styling
├── jszip.min.js          # JSZip library for creating ZIP
├── icon16.svg            # 16x16 icon
├── icon48.svg            # 48x48 icon
└── icon128.svg           # 128x128 icon
```

## 🔧 Technical Details

### Supported Image Formats

**Can Convert to WebP:**

- JPG/JPEG
- PNG
- GIF
- BMP
- TIFF/TIF
- WebP (re-encodes)

**Cannot Convert (Skipped):**

- SVG (vector format)
- RAW camera formats
- Adobe formats (PSD, AI, etc.)

### Permissions Required

- `activeTab` - Access current webpage content
- `scripting` - Inject content script to find images
- `downloads` - Download the ZIP file
- `<all_urls>` - Access images from any domain

### Libraries Used

- **JSZip 3.10.1** - Create ZIP files in the browser
- **Canvas API** - Convert images to WebP format

## 🎨 Customization

### Change WebP Quality

Edit [popup.js](popup.js#L185):

```javascript
canvas.toBlob(
  (webpBlob) => { ... },
  'image/webp',
  0.85  // Change this value (0.0 to 1.0)
);
```

### Change ZIP Compression

Edit [popup.js](popup.js#L147):

```javascript
const zipBlob = await zip.generateAsync({
  type: "blob",
  compression: "DEFLATE",
  compressionOptions: { level: 6 }, // Change level (1-9)
});
```

## 🐛 Troubleshooting

### "No images found on this page"

- Some images may be protected by CORS
- Try on different websites
- Images loaded via JavaScript may not be detected immediately

### CORS Errors

- Some websites block cross-origin image access
- Extension tries alternative methods but may skip some images
- These images will show errors in the browser console

### Extension Not Working

1. Reload the extension in `chrome://extensions/`
2. Refresh the webpage
3. Check browser console for errors (F12)

## 📝 Comparison with Original Script

| Feature        | Node.js Script   | Chrome Extension |
| -------------- | ---------------- | ---------------- |
| **Input**      | Manual URL entry | Current webpage  |
| **Execution**  | Terminal command | Browser click    |
| **Output**     | Two folders      | ZIP file         |
| **Formats**    | 70+ formats      | Web formats only |
| **Conversion** | Sharp library    | Canvas API       |
| **Usage**      | Developer tool   | User-friendly    |

## 🔮 Future Enhancements

- [ ] Add settings page (quality, format options)
- [ ] Support for video thumbnails
- [ ] Batch download from multiple tabs
- [ ] Image filtering (size, format, dimensions)
- [ ] Preview before download
- [ ] Custom naming patterns
- [ ] Cloud storage integration

## ⚠️ Limitations

1. **CORS Restrictions**: Cannot download images from domains that block cross-origin requests
2. **SVG Files**: Vector files are skipped (cannot convert to raster WebP)
3. **Dynamic Content**: Images loaded after page load may not be detected
4. **File Size**: Very large images may take time to process
5. **Browser Limits**: Chrome may limit concurrent downloads

## 📄 License

This project is provided as-is for educational and personal use.

## 🤝 Contributing

Feel free to improve this extension:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 💡 Credits

Based on the original Node.js image scraper script with enhancements for browser-based operation.

---

**Enjoy downloading images in WebP format! 🎉**
