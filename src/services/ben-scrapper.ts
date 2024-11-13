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
  'div#footer',
  'div#top-footer',
  'div.ad',
  'div.sidebar',
  'div.promo',
];

// Tags to extract meaningful content
const contentTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'li', 'strong', 'blockquote', 'article', 'section'];

export async function fetchPageBody(url: string): Promise<{ content: string[]; links: string[] } | null> {
  console.log('THIS HAS BEEN CALLED');
  try {
    // Fetch the HTML from the URL
    const response = await axios.get(url);
    const html = response.data;

    // Parse the HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    elementsToRemove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    });

    const content: string[] = [];
    const links: string[] = [];

    // Extract content from specified tags, adding each line to the content array
    contentTags.forEach((tag) => {
      const elements = document.querySelectorAll(tag);
      elements.forEach((element) => {
        const text = element.textContent?.trim();
        if (text) {
          content.push(text);
        }
      });
    });

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
