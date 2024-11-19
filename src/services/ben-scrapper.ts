'use server';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { NodeHtmlMarkdown } from 'node-html-markdown';

const elementsToRemove = [
  'script',
  'noscript',
  'style',
  'header',
  'footer',
  'nav',
  'aside',
  'img',
  'label',
  'input',
  'select',
  'option',
  'button',
  'path',
  'svg',
  'link',
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
  'div.ad',
  'div.google-ad',
  'div.sidebar',
  'div.promo',
  'div.CMasterHeader',
  'cart-drawer',
  'section.productCarousel',
  'div.megamenu',
  'div#cv-zone-navigation-container',
  'div#cv-zone-topbar',
  'div#cv-zone-header',
  'div#cv-zone-footer',
];

export async function scrapePageBody(url: string): Promise<{ markdown: string } | null> {
  console.log('THIS HAS BEEN CALLED');
  try {
    const response = await axios.get(url);
    const html = response.data;

    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log('============================================');
    console.log('RAW DOCUMENT BODY: ', document.body.innerHTML);
    console.log('============================================');

    elementsToRemove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    });

    console.log('============================================');
    console.log('FILTERED DOCUMENT BODY: ', document.body.innerHTML);
    console.log('============================================');

    const markdown = NodeHtmlMarkdown.translate(document.body.innerHTML);

    console.log('============================================');
    console.log('FINAL MARKDOWN RESULT: ', markdown);
    console.log('============================================');

    return { markdown };
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return null;
  }
}

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
  'div#cv-zone-topbar',
  'div#cv-zone-header',
  'div#cv-zone-navigation-container',
  'div#cv-zone-footer',
];

export async function scrapeHeaderFooter(url: string): Promise<{ markdown: string } | null> {
  console.log('scrapeHeaderFooter CALLED');
  try {
    const response = await axios.get(url);
    const html = response.data;

    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log('============================================');
    console.log('HEADER FOOTER: RAW DOCUMENT: ', document.body.innerHTML);
    console.log('============================================');

    // Create a container to hold the scraped content
    const scrapedContent = document.createElement('div');

    elementsToScrape.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        // Append the element's content to the scrapedContent container
        const clonedElement = element.cloneNode(true);
        scrapedContent.appendChild(clonedElement);

        // Remove the element from the main document to avoid duplication
        element.remove();
      });
    });

    console.log('============================================');
    console.log('HEADER FOOTER: SCRAPED CONTENT: ', scrapedContent.innerHTML);
    console.log('============================================');

    const markdown = NodeHtmlMarkdown.translate(scrapedContent.innerHTML);

    console.log('============================================');
    console.log('HEADER FOOTER: FINAL MARKDOWN RESULT: ', markdown);
    console.log('============================================');

    return { markdown };
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return null;
  }
}
