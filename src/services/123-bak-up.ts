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
const contentTags = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'a',
  'span',
  'li',
  'strong',
  'blockquote',
  'article',
  'section',
  'ul',
  'ol',
  'table',
  'tr',
  'td',
  'th',
]);

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

    let markdown = '';

    // Sanitize text content
    const sanitizeText = (text: string): string => {
      return text.replace(/\s+/g, ' ').trim(); // Replace multiple spaces/newlines with a single space
    };

    // Function to recursively traverse DOM and generate Markdown
    function traverse(node: InstanceType<typeof dom.window.Node>): void {
      if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
        const element = node as InstanceType<typeof dom.window.HTMLElement>;

        console.log('ELEMENT: ', element.tagName.toLowerCase());

        // Traverse child nodes first
        Array.from(element.childNodes).forEach((child) => traverse(child));

        // Process the current element
        if (contentTags.has(element.tagName.toLowerCase())) {
          const text = sanitizeText(element.textContent || '');
          if (text) {
            switch (element.tagName.toLowerCase()) {
              case 'h1':
                markdown += `\n# ${text}\n\n`;
                break;
              case 'h2':
                markdown += `\n## ${text}\n\n`;
                break;
              case 'h3':
                markdown += `\n### ${text}\n\n`;
                break;
              case 'h4':
                markdown += `\n#### ${text}\n\n`;
                break;
              case 'h5':
                markdown += `\n##### ${text}\n\n`;
                break;
              case 'h6':
                markdown += `\n###### ${text}\n\n`;
                break;
              case 'p':
              case 'blockquote':
                markdown += `${text}\n\n`;
                break;
              case 'ul':
              case 'ol':
                const listItems = Array.from(element.querySelectorAll('li'));
                listItems.forEach((li) => {
                  markdown += `- ${sanitizeText(li.textContent || '')}\n`;
                });
                markdown += `\n`;
                break;
              case 'table':
                const rows = Array.from(element.querySelectorAll('tr'));
                const tableMarkdown: string[] = [];

                if (rows.length > 0) {
                  // Process headers
                  const headers = Array.from(rows[0].querySelectorAll('th'));
                  if (headers.length > 0) {
                    tableMarkdown.push(`| ${headers.map((header) => sanitizeText(header.textContent || '')).join(' | ')} |`);
                    tableMarkdown.push(`| ${headers.map(() => '---').join(' | ')} |`);
                    rows.shift(); // Remove headers from rows
                  }

                  // Process table rows
                  rows.forEach((row) => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    tableMarkdown.push(`| ${cells.map((cell) => sanitizeText(cell.textContent || '')).join(' | ')} |`);
                  });

                  markdown += `\n\n${tableMarkdown.join('\n')}\n\n`;
                }
                break;
              default:
                markdown += `${text}\n`;
            }
          }
          // Mark element as processed to avoid duplication
          element.setAttribute('data-processed', 'true');
        }
      }
    }

    // Start traversal from the document body
    traverse(document.body);

    return { markdown };
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return null;
  }
}
