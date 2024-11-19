'use server';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { NodeHtmlMarkdown } from 'node-html-markdown';

const elementsToScrape = [
  'header',
  'footer',
  'nav',
  'aside',
  'div#header',
  'div.section-header',
  'div#supermenu',
  'div#supermenu-mobile',
  'div#footer',
  'div.footer-bottom',
  'div#top-footer',
  'div#footer-container',
  'div.footer-wrapper',
  'div.shopify-section-group-footer-group',
];

export async function scrapeHeaderFooter(url: string): Promise<{ markdown: string } | null> {
  console.log('scrapeHeaderFooter CALLED');
  try {
    const response = await axios.get(url);
    const html = response.data;

    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log('============================================');
    console.log('RAW DOCUMENT: ', document.body.innerHTML);
    console.log('============================================');

    // Create a container to hold the scraped content
    const scrapedContent = document.createElement('div');

    elementsToScrape.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        // Clone the matched element and append it to the container
        const clonedElement = element.cloneNode(true);
        scrapedContent.appendChild(clonedElement);
      });
    });

    console.log('============================================');
    console.log('SCRAPED CONTENT: ', scrapedContent.innerHTML);
    console.log('============================================');

    const markdown = NodeHtmlMarkdown.translate(scrapedContent.innerHTML);

    console.log('============================================');
    console.log('FINAL MARKDOWN RESULT: ', markdown);
    console.log('============================================');

    return { markdown };
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return null;
  }
}
