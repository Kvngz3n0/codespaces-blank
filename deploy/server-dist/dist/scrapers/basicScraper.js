import { JSDOM } from 'jsdom';
import axios from 'axios';
import { spawnSync } from 'child_process';
import path from 'path';
// Realistic browser user agents
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
];
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
export async function scrapeBasic(url) {
    const maxRetries = 3;
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await axios.get(url, {
                timeout: 12000,
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0',
                    'Referer': 'https://www.google.com/'
                },
                validateStatus: () => true,
                maxRedirects: 10
            });
            // For 451 errors, try to fetch anyway if there's content
            if (response.status === 451 && response.data) {
                console.log(`[Attempt ${attempt + 1}] Bypassing 451 - attempting to extract content anyway`);
                return parseContent(url, response.data);
            }
            // For 403, try with additional headers
            if (response.status === 403 && attempt < maxRetries - 1) {
                console.log(`[Attempt ${attempt + 1}] Got 403, retrying with different headers...`);
                continue;
            }
            if (response.status === 403 && response.data) {
                return parseContent(url, response.data);
            }
            if (response.status === 404) {
                throw new Error('❌ Page Not Found: The URL does not exist (404).');
            }
            if (response.status >= 400 && attempt < maxRetries - 1) {
                console.log(`[Attempt ${attempt + 1}] Got status ${response.status}, retrying...`);
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            if (response.status >= 400) {
                throw new Error(`⚠️ HTTP Error ${response.status}: ${response.statusText}`);
            }
            return parseContent(url, response.data);
        }
        catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                console.log(`[Attempt ${attempt + 1}] Failed: ${lastError.message}, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }
    throw new Error(`Failed to scrape after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}
export async function scrapeWithPython(url) {
    try {
        // Resolve python script relative to process working dir (server project)
        const script = path.resolve(process.cwd(), 'src', 'scrapers', 'python_scraper.py');
        const args = ['mode=scrape', `url=${url}`];
        // Do not inject dev-only env vars here. Honor the environment provided by the runtime.
        const res = spawnSync('python3', [script, ...args], { encoding: 'utf-8', timeout: 30000, env: process.env });
        if (res.error) {
            throw res.error;
        }
        if (res.status !== 0 && !res.stdout) {
            throw new Error(`Python scraper failed: ${res.stderr || 'no output'}`);
        }
        const out = JSON.parse(res.stdout || '{}');
        if (out.error) {
            throw new Error(out.error);
        }
        // Map Python result fields to BasicScrapResult
        return {
            url: out['url'] ? out['url'] : url,
            title: out['title'] || 'No title',
            description: out['description'] || '',
            headings: out['headings'] || [],
            links: (out['links'] || []).map((l) => ({ text: l.text || '', href: l.href || '' })),
            images: out['images'] || [],
            paragraphs: out['paragraphs'] || [],
            elements: [],
            media: out['media'] ? {
                images: out['media']['images'] || [],
                videos: out['media']['videos'] || [],
                audio: out['media']['audio'] || [],
                documents: out['media']['documents'] || [],
                archives: out['media']['archives'] || [],
                ebooks: out['media']['ebooks'] || []
            } : undefined,
            timestamp: new Date()
        };
    }
    catch (err) {
        throw new Error(`Python scraper error: ${err instanceof Error ? err.message : String(err)}`);
    }
}
function parseContent(url, data) {
    try {
        const dom = new JSDOM(data, { url });
        const document = dom.window.document;
        const title = document.querySelector('title')?.textContent || 'No title';
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .map((el) => el.textContent)
            .filter((text) => text && text.trim())
            .slice(0, 20);
        const links = Array.from(document.querySelectorAll('a'))
            .map((el) => ({
            text: (el.textContent || '').trim().slice(0, 100),
            href: el.getAttribute('href') || ''
        }))
            .filter((link) => link.href)
            .slice(0, 50);
        const images = Array.from(document.querySelectorAll('img'))
            .map((el) => el.getAttribute('src') || '')
            .filter((src) => src)
            .slice(0, 30);
        const paragraphs = Array.from(document.querySelectorAll('p'))
            .map((el) => (el.textContent || '').trim())
            .filter((text) => text.length > 20)
            .slice(0, 10);
        // Collect various elements
        const elements = Array.from(document.querySelectorAll('p, span, div[class*="card"], article, section'))
            .slice(0, 100)
            .map((el) => ({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().slice(0, 200),
            href: el.getAttribute('href') || undefined,
            attributes: Object.fromEntries(Array.from(el.attributes || []).map((attr) => [attr.name, attr.value]))
        }));
        return {
            url,
            title,
            description,
            headings: headings,
            links,
            images,
            paragraphs: paragraphs,
            elements,
            media: {
                images: images.slice(0, 30),
                videos: Array.from(document.querySelectorAll('video source[src]'))
                    .map((el) => el.getAttribute('src'))
                    .filter(Boolean),
                audio: Array.from(document.querySelectorAll('audio source[src]'))
                    .map((el) => el.getAttribute('src'))
                    .filter(Boolean),
                documents: Array.from(document.querySelectorAll('a[href]'))
                    .map((el) => el.getAttribute('href'))
                    .filter((h) => /\\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i.test(h)),
                archives: Array.from(document.querySelectorAll('a[href]'))
                    .map((el) => el.getAttribute('href'))
                    .filter((h) => /\\.(zip|rar|7z|gz|tar|bz2)$/i.test(h)),
                ebooks: Array.from(document.querySelectorAll('a[href]'))
                    .map((el) => el.getAttribute('href'))
                    .filter((h) => /\\.(epub|mobi|azw|azw3)$/i.test(h))
            },
            timestamp: new Date()
        };
    }
    catch (error) {
        throw new Error(`Failed to parse content: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=basicScraper.js.map