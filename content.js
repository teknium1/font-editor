// content.js

// Function to inject the custom font style
function applyCustomFont(fontName) {
    console.log('Applying custom font:', fontName);
  
    // Remove existing custom font style if any
    const existingStyle = document.getElementById('customFontStyle');
    if (existingStyle) {
      existingStyle.remove();
    }
  
    // Create a new style element
    const style = document.createElement('style');
    style.id = 'customFontStyle';
  
    // Define the font-family CSS property
    let fontFamily = `'${fontName}', sans-serif !important`;
  
    // For web-safe fonts, no need to import
    const webSafeFonts = [
      'Arial',
      'Verdana',
      'Helvetica',
      'Times New Roman',
      'Georgia',
      'Courier New',
      'Tahoma',
      'Trebuchet MS',
      'Impact',
      'Lucida Console'
    ];
  
    if (webSafeFonts.includes(fontName)) {
      style.textContent = `
        * {
          font-family: ${fontFamily};
        }
      `;
    } else {
      // For Google Fonts, use their API
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}');
        * {
          font-family: ${fontFamily};
        }
      `;
    }
  
    document.head.appendChild(style);
  }
  
  // Listen for messages from the popup script
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Content script received message:', request);
    if (request.action === 'updateFont') {
      applyCustomFont(request.font);
      sendResponse({ status: 'Font applied' });
    }
  });
  
  // Apply the saved font when the content script runs
  chrome.storage.local.get('selectedFont', function (data) {
    if (data.selectedFont) {
      applyCustomFont(data.selectedFont);
    }
  });
