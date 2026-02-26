import axios from 'axios';
import * as cheerio from 'cheerio';

export interface JSScrapResult {
  url: string;
  title: string;
  content: string;
  html: string;
  screenshot?: string; // kept for compatibility (will be undefined)
  timestamp: Date;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function scrapeWithJS(
  url: string,
  takeScreenshot = false // kept for compatibility
): Promise<JSScrapResult> {

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[Scraper - Attempt ${attempt + 1}] Fetching ${url}...`);

      const response = await axios.get(url, {
        timeout: 20000,
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Referer': 'https://www.google.com/',
        },
        validateStatus: () => true, // allow all status codes
      });

      const status = response.status;

      if (status >= 400 && status !== 403 && status !== 451) {
        throw new Error(`HTTP Error ${status}`);
      }

      const html: string = response.data;
      const $ = cheerio.load(html);

      const title = $('title').first().text() || '';
      const content = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000);

      return {
        url,
        title,
        content,
        html: html.slice(0, 20000),
        screenshot: undefined, // no browser, so no screenshot
        timestamp: new Date(),
      };

    } catch (error) {
      lastError = error as Error;
      console.log(
        `[Scraper - Attempt ${attempt + 1}] Error: ${lastError.message}`
      );

      if (attempt < maxRetries - 1) {
        const delay = 2000 * (attempt + 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to scrape after ${maxRetries} attempts: ${
      lastError?.message || 'Unknown error'
    }`
  );
}

// Dummy function kept so other files don't break
export async function closeBrowser(): Promise<void> {
  return;
}