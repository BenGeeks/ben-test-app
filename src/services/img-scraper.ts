'use server';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import probe from 'probe-image-size';

const WHERE_TO_SCRAPE = ['div#main-image-container', 'div.listing-page-image-carousel-component', 'div.product-image-wrapper'];

async function getImageDimensions(url: string): Promise<{ url: string; width: number; height: number } | null> {
  try {
    console.log('============================================================');
    console.log(`Fetching dimensions for image: ${url}`);
    const result = await probe(url);
    console.log('Fetched dimensions:', result);
    return { url, width: result.width, height: result.height };
  } catch (error) {
    console.error(`Failed to fetch dimensions for image: ${url}`, error);
    return null;
  }
}

export async function imgScraper(url: string): Promise<string | null> {
  console.log('IMAGE SCRAPER HAS BEEN CALLED: ', url);
  try {
    const response = await axios.get(url);
    const html = response.data;

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const scrapedImages: string[] = [];

    // Focus on specified elements to scrape images
    WHERE_TO_SCRAPE.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const images = Array.from(element.querySelectorAll('img'))
          .map((img) => img.getAttribute('src'))
          .filter((src): src is string => !!src); // Type guard to filter out null values

        scrapedImages.push(...images); // Add found image sources to the result
      });
    });

    console.log('Fetched images:', scrapedImages);

    if (scrapedImages.length === 0) {
      console.log('No images found.');
      return null; // No images to process
    }

    // Fetch dimensions for each image and find the largest one
    const dimensionResults = await Promise.all(scrapedImages.map(getImageDimensions));
    const validDimensions = dimensionResults.filter((result): result is { url: string; width: number; height: number } => !!result);

    if (validDimensions.length === 0) {
      console.log('No valid image dimensions found.');
      return null;
    }

    // Find the image with the largest dimensions (width * height)
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
