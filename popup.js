// popup.js

document.addEventListener('DOMContentLoaded', function () {
    // Get references to the HTML elements
    const fontSelect = document.getElementById('fontSelect');
    const applyButton = document.getElementById('applyButton');
  
    // Replace the existing fonts array with this:
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
  
    // Add this function to read the config file
    function readConfig() {
      return fetch(chrome.runtime.getURL('config.ini'))
        .then(response => response.text())
        .then(text => {
          const lines = text.split('\n');
          const config = {};
          lines.forEach(line => {
            if (line.includes('=')) {
              const [key, value] = line.split('=').map(part => part.trim());
              config[key] = value;
            }
          });
          return config;
        });
    }
  
    // Modify the fetchGoogleFonts function
    function fetchGoogleFonts() {
      readConfig().then(config => {
        const apiKey = config.API_KEY;
        fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`)
          .then(response => response.json())
          .then(data => {
            const googleFonts = data.items.map(font => font.family);
            fonts.push(...googleFonts);
            populateDropdown();
          })
          .catch(error => console.error('Error fetching Google Fonts:', error));
      });
    }
  
    // Modify the existing code to use this function
    function populateDropdown() {
      fontSelect.innerHTML = ''; // Clear existing options
      fonts.forEach(function (font) {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        fontSelect.appendChild(option);
      });
    }
  
    // Call this function instead of directly populating the dropdown
    fetchGoogleFonts();
  
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
  
      // Determine the CSS code based on whether the font is web-safe or Google Font
      if (webSafeFonts.includes(fontName)) {
        // For web-safe fonts, no need to import
        styleElement.textContent = `
          * {
            font-family: '${fontName}', sans-serif !important;
          }
        `;
      } else {
        // For Google Fonts, use their API
        styleElement.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}');
          * {
            font-family: '${fontName}', sans-serif !important;
          }
        `;
      }
  
      // Append the style element to the document head
      document.head.appendChild(styleElement);
    }
  });
