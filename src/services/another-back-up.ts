'use server';
import axios from 'axios';
import { JSDOM } from 'jsdom';

// Remove non-content elements
const elementsToRemove = [
  'script',
  'style',
  'header',
  'footer',
  'nav',
  'aside',
  'div#header',
  'div.section-header',
  'div#footer',
  'div#top-footer',
  'div.shopify-section-group-footer-group',
  'div.ad',
  'div.sidebar',
  'div.promo',
  'cart-drawer',
];

// Tags to extract meaningful content
const contentTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'li', 'strong', 'blockquote', 'article', 'section']);

export async function fetchPageBody(url: string): Promise<{ content: string[] } | null> {
  console.log('THIS HAS BEEN CALLED');
  try {
    // Fetch the HTML from the URL
    const response = await axios.get(url);
    const html = response.data;

    // Parse the HTML with JSDOM
    const dom = new JSDOM(html); // JSDOM instance
    const document = dom.window.document;

    // Remove non-content elements
    elementsToRemove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    });

    const content: string[] = [];

    // Function to recursively traverse DOM in pre-order
    function traverse(node: InstanceType<typeof dom.window.Node>): void {
      if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
        const element = node as InstanceType<typeof dom.window.HTMLElement>;

        // Process current node if it matches contentTags
        if (contentTags.has(element.tagName.toLowerCase())) {
          const text = element.textContent?.trim();
          if (text) {
            // Split long content into separate items based on periods, newlines, or logical breaks
            const textParts = text
              .split(/[\r\n.]+/)
              .map((part) => part.trim())
              .filter(Boolean);
            content.push(...textParts);
          }
          // Remove the element from its parent
          element.remove();
          return; // Stop further traversal of this node as it's already processed
        }
      }

      // Traverse child nodes
      Array.from(node.childNodes).forEach((child) => traverse(child));
    }

    // Start traversal from the document body
    traverse(document.body);

    console.log('CONTENT: ', content);

    return { content };
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return null;
  }
}
