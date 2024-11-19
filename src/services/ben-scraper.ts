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
  'div.header-wrapper',
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

    elementsToRemove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    });

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

const headerFooterElementsToRemove = ['img', 'path', 'svg', 'label', 'input', 'select', 'option', 'button', 'main', 'div.main', 'div.main-wrapper'];

const elementsToScrape = [
  'header',
  'div.header',
  'div#header',
  'div.section-header',
  'div#cv-zone-topbar',
  'div#cv-zone-header',
  'div.header-wrapper',

  'nav',
  'div.nav',
  'div#supermenu',
  'div#supermenu-mobile',
  'div#cv-zone-navigation-container',

  'footer',
  'div.footer',
  'div#footer',
  'div#top-footer',
  'div.footer-bottom',
  'div#cv-zone-footer',
  'div.footer-wrapper',
  'div#footer-container',
  'div.shopify-section-group-footer-group',
];

export async function scrapeHeaderFooter(url: string): Promise<{ markdown: string } | null> {
  console.log('scrapeHeaderFooter CALLED');
  try {
    const response = await axios.get(url);
    const html = response.data;

    const dom = new JSDOM(html);
    const document = dom.window.document;

    headerFooterElementsToRemove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    });

    // Create a container to hold the scraped content
    const scrapedContent = document.createElement('div');

    const separatorBeforeHeader = document.createElement('hr');
    const headerHeading = document.createElement('h1');
    headerHeading.textContent = 'Header';
    const separatorAfterHeaderHeading = document.createElement('hr');

    // Append separator and heading to the scrapedContent container
    scrapedContent.appendChild(separatorBeforeHeader);
    scrapedContent.appendChild(headerHeading);
    scrapedContent.appendChild(separatorAfterHeaderHeading);

    let headerFound = false;

    elementsToScrape.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const clonedElement = element.cloneNode(true);

        if (!headerFound && /header/i.test(selector)) {
          headerFound = true;
        } else if (headerFound && /footer/i.test(selector)) {
          // Insert a separator before scraping footer elements
          const separatorBeforeFooter = document.createElement('hr');
          const footerHeading = document.createElement('h1');
          footerHeading.textContent = 'Footer';
          const separatorAfterFooterHeading = document.createElement('hr');

          // Append separator and heading to the scrapedContent container
          scrapedContent.appendChild(separatorBeforeFooter);
          scrapedContent.appendChild(footerHeading);
          scrapedContent.appendChild(separatorAfterFooterHeading);

          // Reset headerFound to avoid additional separators
          headerFound = false;
        }

        // Append the element's content to the scrapedContent container
        scrapedContent.appendChild(clonedElement);

        // Remove the element from the main document to avoid duplication
        element.remove();
      });
    });

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
