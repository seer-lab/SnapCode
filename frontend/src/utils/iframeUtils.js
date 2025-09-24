/**
 * Utility functions for handling iframe behavior in HTML preview
 */

/**
 * Creates the complete HTML document for iframe with link handling script
 * @param {string} sanitizedHTML - The sanitized HTML content
 * @param {Object} options - Configuration options
 * @returns {string} Complete HTML document string
 */
export const createIframeHTML = (sanitizedHTML, options = {}) => {
  const { openInNewTab = false, smoothScroll = true } = options;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 8px;
        }
      </style>
    </head>
    <body>
      ${sanitizedHTML}
      <script>
        // Handle link clicks directly in the iframe
        document.addEventListener('click', function(event) {
          if (event.target.tagName === 'A' && event.target.href) {
            event.preventDefault();
            const url = event.target.href;
            
            if (url.startsWith('http://') || url.startsWith('https://')) {
              ${openInNewTab 
                ? 'window.parent.open(url, "_blank", "noopener,noreferrer");'
                : 'window.parent.location.href = url;'
              }
            } else if (url.startsWith('#')) {
              const target = document.querySelector(url);
              if (target) {
                target.scrollIntoView({ behavior: '${smoothScroll ? 'smooth' : 'auto'}' });
              }
            } else if (url.startsWith('mailto:') || url.startsWith('tel:')) {
              window.parent.location.href = url;
            } else {
              ${openInNewTab 
                ? 'window.parent.open(url, "_blank", "noopener,noreferrer");'
                : 'window.parent.location.href = url;'
              }
            }
          }
        });
      </script>
    </body>
    </html>
  `;
};

/**
 * Writes HTML content to an iframe document
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @param {string} htmlContent - The complete HTML content to write
 */
const writeToIframe = (iframe, htmlContent) => {
  const doc = iframe.contentDocument;
  if (!doc) return false;
  
  doc.open();
  doc.write(htmlContent);
  doc.close();
  return true;
};

/**
 * Initializes iframe with HTML content and link handling
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @param {string} sanitizedHTML - The sanitized HTML content
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} Success status
 */
export const initializeIframe = (iframe, sanitizedHTML, options = {}) => {
  return new Promise((resolve) => {
    if (!iframe || !sanitizedHTML) {
      resolve(false);
      return;
    }

    const htmlContent = createIframeHTML(sanitizedHTML, options);
    
    // Try to write immediately
    if (iframe.contentDocument) {
      const success = writeToIframe(iframe, htmlContent);
      resolve(success);
      return;
    }
    
    // If contentDocument not ready, wait a bit and retry
    setTimeout(() => {
      if (iframe.contentDocument) {
        const success = writeToIframe(iframe, htmlContent);
        resolve(success);
      } else {
        resolve(false);
      }
    }, 50);
  });
};

/**
 * Synchronous version of iframe initialization (simpler)
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @param {string} sanitizedHTML - The sanitized HTML content
 * @param {Object} options - Configuration options
 * @returns {boolean} Success status
 */
export const initializeIframeSync = (iframe, sanitizedHTML, options = {}) => {
  if (!iframe || !sanitizedHTML) return false;

  const htmlContent = createIframeHTML(sanitizedHTML, options);
  const iframeDoc = iframe.contentDocument;
  
  // Check if contentDocument is available
  if (!iframeDoc) {
    // Try again after a short delay
    setTimeout(() => {
      if (iframe.contentDocument) {
        writeToIframe(iframe, htmlContent);
      }
    }, 50);
    return false;
  }
  
  return writeToIframe(iframe, htmlContent);
};

/**
 * Configuration constants
 */
export const IFRAME_CONFIG = {
  defaultMargin: "8px",
  retryDelay: 50,
  linkHandling: {
    // Set to false to navigate in same tab instead of opening new tab
    openInNewTab: false,
    smoothScroll: true,
    handleMailto: true,
    handleTel: true
  }
};