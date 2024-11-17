'use server';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { NodeHtmlMarkdown } from 'node-html-markdown'; // Import the package

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
  'div#supermenu',
  'div#supermenu-mobile',
  'div#footer',
  'div#top-footer',
  'div#footer-container',
  'div.footer-wrapper',
  'div.shopify-section-group-footer-group',
  'div.ad',
  'div.sidebar',
  'div.promo',
  'cart-drawer',
  'img',
  'input',
  'form',
  'button',
  'path',
  'svg',
  'noscript',
  'link',
  'section.productCarousel',
  'div.megamenu',
];

export async function fetchPageBody(url: string): Promise<{ markdown: string } | null> {
  console.log('THIS HAS BEEN CALLED');
  try {
    // Fetch the HTML from the URL
    const response = await axios.get(url);
    const html = response.data;

    // Parse the HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove non-content elements
    elementsToRemove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    });

    // Convert the modified HTML to Markdown
    const markdown = NodeHtmlMarkdown.translate(document.body.innerHTML); // Use innerHTML for conversion
    console.log('MARKDOWN: ', markdown);

    return { markdown };
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return null;
  }
}
