// popup.js

document.addEventListener('DOMContentLoaded', function () {
    // Get references to the HTML elements
    const fontSelect = document.getElementById('fontSelect');
    const applyButton = document.getElementById('applyButton');
  
    // List of fonts to populate the dropdown menu
    const fonts = [
      'Arial',
      'Verdana',
      'Helvetica',
      'Times New Roman',
      'Georgia',
      'Courier New',
      'Roboto',
      'Open Sans',
      'Lato',
      'Montserrat',
      'Oswald',
      'Source Sans Pro',
      'Slabo 27px',
      'Raleway',
      'PT Sans',
      'Merriweather'
      // Add more fonts as desired
    ];
  
    // Populate the dropdown menu with fonts
    fonts.forEach(function (font) {
      const option = document.createElement('option');
      option.value = font;
      option.textContent = font;
      fontSelect.appendChild(option);
    });
  
    // Load the saved font preference (if any)
    chrome.storage.local.get('selectedFont', function (data) {
      if (data.selectedFont) {
        fontSelect.value = data.selectedFont;
      }
    });
  
    // Add a click event listener to the "Apply Font" button
    applyButton.addEventListener('click', function () {
      // Get the selected font from the dropdown menu
      const selectedFont = fontSelect.value;
      console.log('Selected font:', selectedFont);
  
      // Save the selected font in chrome storage
      chrome.storage.local.set({ selectedFont: selectedFont }, function () {
        console.log('Font preference saved:', selectedFont);
  
        // Inject a script into the page to apply the font
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const tabId = tabs[0].id;
  
          chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              func: applyCustomFont,
              args: [selectedFont],
            },
            function () {
              if (chrome.runtime.lastError) {
                console.error('Error injecting script:', chrome.runtime.lastError.message);
              } else {
                console.log('Font updated successfully');
              }
            }
          );
        });
  
        // Close the popup window
        window.close();
      });
    });
  
    // The function to inject into the page
    function applyCustomFont(fontName) {
      const styleId = 'customFontStyle';
      let styleElement = document.getElementById(styleId);
  
      // Remove existing style element if it exists
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
      }
  
      // Create a new style element
      styleElement = document.createElement('style');
      styleElement.id = styleId;
  
      // List of web-safe fonts
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
  
      // Determine the CSS code based on whether the font is web-safe
      if (webSafeFonts.includes(fontName)) {
        // For web-safe fonts, no need to import
        styleElement.textContent = `
          * {
            font-family: '${fontName}', sans-serif !important;
          }
        `;
      } else {
        // For other fonts, import from Google Fonts
        const fontNameEncoded = encodeURIComponent(fontName.replace(/ /g, '+'));
        styleElement.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=${fontNameEncoded}&display=swap');
          * {
            font-family: '${fontName}', sans-serif !important;
          }
        `;
      }
  
      // Append the style element to the document head
      document.head.appendChild(styleElement);
    }
  });
  