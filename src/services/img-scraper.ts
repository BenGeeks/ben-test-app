'use server';
import { JSDOM } from 'jsdom';
import probe from 'probe-image-size';
import axios from 'axios';

const ELEMENTS_TO_REMOVE = ['script', 'noscript', 'style', 'header', 'footer', 'nav', 'aside', 'label', 'input', 'select', 'option', 'link', 'iframe', 'meta'];

const scrapingSelectors: Record<string, string[]> = {
  'www.amazon.com': ['div#main-image-container'],
  'www.macys.com': ['div.productImage', 'div.product-image-wrapper'],
  'www.sweetwater.com': ['div#product-gallery', 'div.image-gallery', 'div.product-image-col'],
  'www.lazada.com.ph': ['div.gallery-preview-panel', 'div.gallery-preview-panel'],
  'www.ebay.com': ['div.ux-image-carousel-item'],
  'www.target.com': ['div[data-test="image-gallery-item-0"]'],
  'www.bestbuy.com': ['div.primary-image img', 'div.gallery-wrapper img'],
  'www.walmart.com': ['div[data-testid="zoom-image"]'],
  'www.wayfair.com': ['div[data-enzyme-id="FluidImage-wrapper"]'],
  'www.craigslist.org': ['body'],
  'www.costco.com': ['div.zoomViewer'],
  'www.chewy.com': ['div[data-testid="product-carousel"]'],

  'www.kroger.com': ['body'],
  'www.apple.com': ['picture.overview-hero-hero-static-1'],
  'www.homedepot.com': ['body'],
  'shopee.ph': ['body'],

  'www.temu.com': ['div.mainContent', 'div.product-image-container'],
  'www.etsy.com': ['div.image-carousel-container'],
  'www.lowes.com': ['div.viewport'],

  'www.newegg.com': ['div.product-view-img-original img', 'div.product-image img'],
  'www.ikea.com': ['div.range-image-gallery img', 'div.product-pictures img'],
  'www.kohls.com': ['div.product-image-main img', 'div.thumbnail-container img'],
};

async function getImageDimensions(url: string): Promise<{ url: string; width: number; height: number } | null> {
  try {
    console.log('Fetching dimensions for image:', url);
    const result = await probe(url);
    return { url, width: result.width, height: result.height };
  } catch (error) {
    console.error(`Failed to fetch dimensions for image: ${url}`, error);
    return null;
  }
}

export async function imgScraper(url: string): Promise<string | null> {
  console.log('IMAGE SCRAPER HAS BEEN CALLED: ', url);

  try {
    const domain = new URL(url).hostname;
    console.log('DOMAIN: ', domain);
    const WHERE_TO_SCRAPE = scrapingSelectors[domain] || ['body'];
    console.log('WHERE TO SCRAPE: ', WHERE_TO_SCRAPE);

    const response = await axios.get(url);
    const html = response.data;
    const dom = new JSDOM(html);
    const document = dom.window.document;

    ELEMENTS_TO_REMOVE.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    });

    const scrapedImages: string[] = [];

    console.log('DOCUMENT HTML: ', document.documentElement.outerHTML);

    WHERE_TO_SCRAPE.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        console.log('ELEMENT: ', element);
        const images = Array.from(element.querySelectorAll('img'))
          .map((img) => img.getAttribute('src'))
          .filter((src): src is string => !!src);

        scrapedImages.push(...images);
      });
    });

    console.log('Fetched images:', scrapedImages);

    if (scrapedImages.length === 0) {
      console.log('No images found.');
      return null;
    }

    const dimensionResults = await Promise.all(scrapedImages.map(getImageDimensions));
    const validDimensions = dimensionResults.filter((result): result is { url: string; width: number; height: number } => !!result);

    if (validDimensions.length === 0) {
      console.log('No valid image dimensions found.');
      return null;
    }

    const largestImage = validDimensions.reduce((max, current) => {
      const maxArea = max.width * max.height;
      const currentArea = current.width * current.height;
      return currentArea > maxArea ? current : max;
    });

    console.log('Largest image:', largestImage);

    return largestImage.url;
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return null;
  }
}
