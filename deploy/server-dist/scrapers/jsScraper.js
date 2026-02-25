import puppeteer from 'puppeteer';
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
];
let browser = null;
async function getBrowser() {
    if (browser) {
        return browser;
    }
    browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--allow-running-insecure-content'
        ],
        timeout: 30000
    });
    return browser;
}
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
export async function scrapeWithJS(url, takeScreenshot = false) {
    const maxRetries = 3;
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        let page = null;
        try {
            const browserInstance = await getBrowser();
            page = await browserInstance.newPage();
            // Set viewport before headers to mimic real browser
            await page.setViewport({ width: 1920, height: 1080 });
            // Set realistic headers
            await page.setUserAgent(getRandomUserAgent());
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'DNT': '1',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Referer': 'https://www.google.com/'
            });
            // Override navigator.webdriver to avoid detection
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false
                });
            });
            await page.setDefaultTimeout(20000);
            console.log(`[JS Scraper - Attempt ${attempt + 1}] Loading ${url}...`);
            const response = await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 20000
            });
            if (!response) {
                throw new Error('Failed to navigate to page');
            }
            const status = response.status();
            // Try to extract content even if response is error status
            if (status === 451 || status === 403) {
                console.log(`[JS Scraper] Got status ${status}, attempting to extract content anyway...`);
            }
            else if (status >= 400) {
                throw new Error(`HTTP Error ${status}: ${response.statusText()}`);
            }
            const title = await page.title();
            const content = await page.evaluate(() => {
                return (document.body.innerText || '').slice(0, 10000);
            });
            const html = await page.content();
            let screenshot;
            if (takeScreenshot) {
                try {
                    const screenshotBuffer = await page.screenshot({ encoding: 'base64', fullPage: false });
                    screenshot = `data:image/png;base64,${screenshotBuffer}`;
                }
                catch (err) {
                    console.log(`Screenshot failed: ${err}`);
                }
            }
            return {
                url,
                title,
                content,
                html: html.slice(0, 20000),
                screenshot,
                timestamp: new Date()
            };
        }
        catch (error) {
            lastError = error;
            console.log(`[JS Scraper - Attempt ${attempt + 1}] Error: ${lastError.message}`);
            if (attempt < maxRetries - 1) {
                console.log(`Retrying in ${2000 * (attempt + 1)}ms...`);
                await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            }
        }
        finally {
            if (page) {
                try {
                    await page.close();
                }
                catch (e) {
                    console.log('Error closing page:', e);
                }
            }
        }
    }
    throw new Error(`Failed to scrape after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}
export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
//# sourceMappingURL=jsScraper.js.map