# 🚀 Quick Installation Guide

## Step-by-Step Installation

### 1. Open Chrome Extensions Page

- Open Google Chrome
- Type in address bar: `chrome://extensions/`
- Press Enter

### 2. Enable Developer Mode

- Find the **Developer mode** toggle in the top-right corner
- Click to turn it **ON** (it should be blue/enabled)

### 3. Load the Extension

- Click the **Load unpacked** button
- Navigate to: `C:\Users\orange\Desktop\extension\test2\chrome-extension\`
- Select the `chrome-extension` folder
- Click **Select Folder**

### 4. Verify Installation

- You should see "Image Downloader WebP" in your extensions list
- The extension icon (🖼️) should appear in your browser toolbar
- Status should show as **Enabled**

## 🎯 How to Use

1. **Go to any website** (e.g., google.com, amazon.com, etc.)

2. **Click the extension icon** (🖼️) in the Chrome toolbar

3. **Click "Download All Images as WebP"** button

4. **Wait** for the process to complete:
   - Finding images...
   - Downloading...
   - Converting to WebP...
   - Creating ZIP...

5. **Save the ZIP file** when prompted

6. **Done!** All images are in the ZIP file in WebP format

## 📁 Where are the files?

After installation, the extension folder contains:

```
chrome-extension/
├── manifest.json       ✅ Extension config
├── popup.html         ✅ User interface
├── popup.js           ✅ Main logic
├── content.js         ✅ Image finder
├── styles.css         ✅ Styling
├── jszip.min.js       ✅ ZIP library
├── icon16.svg         ✅ Small icon
├── icon48.svg         ✅ Medium icon
├── icon128.svg        ✅ Large icon
└── README.md          ✅ Documentation
```

## ✅ Test the Extension

### Test on these websites:

1. **https://unsplash.com/** - Lots of high-quality images
2. **https://www.pexels.com/** - Stock photos
3. **https://www.wikipedia.org/** - Mixed content
4. **Any website you want!**

## 🔧 Troubleshooting

### Extension not showing?

- Refresh the extensions page (`chrome://extensions/`)
- Make sure Developer mode is ON
- Try reloading the extension

### "No images found"?

- Make sure you're on a webpage (not chrome:// pages)
- Refresh the webpage
- Try a different website

### Download not starting?

- Check if Chrome is blocking downloads
- Try allowing downloads in Chrome settings

## 🎨 Icons Info

Currently using emoji icons (🖼️). To use custom PNG icons:

1. Create or download icons in sizes: 16x16, 48x48, 128x128
2. Save as `icon16.png`, `icon48.png`, `icon128.png`
3. Update [manifest.json](manifest.json) to use `.png` instead of `.svg`

## 📝 Notes

- **First run** might ask for permissions - click "Allow"
- **Large websites** with many images may take longer
- **ZIP file** is automatically named: `websitename_images_timestamp.zip`
- **WebP format** reduces file size by ~30-85%

## 🆘 Need Help?

Check the full [README.md](README.md) for:

- Detailed features
- Technical information
- Customization options
- Known limitations

---

**Happy image downloading! 🎉**
