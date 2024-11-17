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

export async function fetchPageBody(url: string): Promise<{ content: string[]; links: string[] } | null> {
  console.log('THIS HAS BEEN CALLED');
  try {
    // Fetch the HTML from the URL
    const response = await axios.get(url);
    const html = response.data;

    // Parse the HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log('DOCUMENT 1: ', document);
    console.log('============================================================');

    elementsToRemove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    });

    console.log('DOCUMENT 2: ', document);
    console.log('============================================================');

    const content: string[] = [];
    const links: string[] = [];

    // Extract content from specified tags, adding each line to the content array
    // contentTags.forEach((tag) => {
    //   const elements = document.querySelectorAll(tag);
    //   elements.forEach((element) => {
    //     const text = element.textContent?.trim();
    //     if (text) {
    //       content.push(text);
    //     }
    //   });
    // });

    // Extract content from specified tags, adding each line to the content array
    // contentTags.forEach((tag) => {
    //   const elements = document.querySelectorAll(tag);
    //   elements.forEach((element) => {
    //     const text = element.textContent?.trim();

    //     // Check if element or its parent has already been processed
    //     if (text && !element.hasAttribute('data-processed')) {
    //       content.push(text);

    //       // Mark the element as processed
    //       element.setAttribute('data-processed', 'true');
    //       // Optionally, remove all child nodes to prevent reprocessing nested elements
    //       while (element.firstChild) {
    //         element.removeChild(element.firstChild);
    //       }
    //     }
    //   });
    // });

    // Function to recursively walk through DOM
    function traverse(node: Node): void {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        // Check if the element matches contentTags
        if (contentTags.has(element.tagName.toLowerCase())) {
          const text = element.textContent?.trim();
          if (text) {
            content.push(text);
          }
        }
      }

      // Traverse child nodes
      node.childNodes.forEach((child) => traverse(child));
    }

    // Start traversal from the document body
    traverse(document.body);

    console.log('CONTENTS: ', content);
    console.log('============================================================');

    // Extract links separately and format them as "Link Text: URL"
    const anchorTags = document.querySelectorAll('a');
    anchorTags.forEach((anchor) => {
      const href = anchor.getAttribute('href');
      const text = anchor.textContent?.trim();
      if (href && text) {
        links.push(`${text}: ${href}`);
      }
    });

    return { content, links };
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return null;
  }
}
