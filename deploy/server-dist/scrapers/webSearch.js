import axios from 'axios';
import { load } from 'cheerio';
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
export async function performWebSearch(query, language = 'en', maxResults = 10) {
    const startTime = Date.now();
    try {
        // Validate inputs
        if (!query || !query.trim()) {
            throw new Error('Search query is required');
        }
        const cleanQuery = query.trim();
        const maxRes = Math.min(Math.max(maxResults || 10, 1), 50);
        const lang = language || 'en';
        // Use DuckDuckGo API (lightweight and no API key needed)
        // DuckDuckGo has a lite version that doesn't require JavaScript
        const searchUrl = `https://duckduckgo.com/lite/?q=${encodeURIComponent(cleanQuery)}&kl=${lang}`;
        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Referer': 'https://www.google.com/'
            },
            validateStatus: () => true
        });
        const $ = load(response.data);
        const results = [];
        // Parse DuckDuckGo lite results
        $('a.result__a').each((index, element) => {
            if (results.length >= maxRes)
                return false;
            try {
                const $el = $(element);
                const title = $el.text().trim();
                const url = $el.attr('href');
                if (!title || !url)
                    return true;
                // Get snippet from the result wrapper
                const $resultWrapper = $el.closest('.result');
                const snippet = $resultWrapper.find('.result__snippet').text().trim() || 'No description available';
                const domain = url ? new URL(url).hostname : undefined;
                results.push({
                    title: title.substring(0, 150),
                    url,
                    snippet: snippet.substring(0, 200),
                    domain
                });
            }
            catch (err) {
                // Skip malformed results
                return true;
            }
        });
        // If DuckDuckGo scraping didn't work well, try a fallback approach
        if (results.length === 0) {
            return fallbackSearch(cleanQuery, maxRes);
        }
        const searchTime = Date.now() - startTime;
        return {
            query: cleanQuery,
            results,
            totalResults: results.length,
            searchTime
        };
    }
    catch (error) {
        console.error('Web search error:', error);
        // Fallback to basic search
        try {
            return fallbackSearch(query, maxResults);
        }
        catch (fallbackError) {
            throw new Error(`Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
async function fallbackSearch(query, maxResults) {
    const startTime = Date.now();
    try {
        // Use Bing search as fallback
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&format=rss`;
        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none'
            },
            validateStatus: () => true
        });
        const $ = load(response.data);
        const results = [];
        $('item').each((index, element) => {
            if (results.length >= maxResults)
                return false;
            try {
                const $el = $(element);
                const title = $el.find('title').text().trim();
                const url = $el.find('link').text().trim();
                const description = $el.find('description').text().trim();
                // Remove HTML tags from description
                const snippet = description.replace(/<[^>]*>/g, '').substring(0, 200);
                if (!title || !url)
                    return true;
                const domain = new URL(url).hostname;
                results.push({
                    title: title.substring(0, 150),
                    url,
                    snippet,
                    domain
                });
            }
            catch (err) {
                return true;
            }
        });
        const searchTime = Date.now() - startTime;
        return {
            query,
            results: results.length > 0 ? results : getMockResults(query),
            totalResults: results.length,
            searchTime
        };
    }
    catch (error) {
        // Return mock results if all else fails
        return {
            query,
            results: getMockResults(query),
            totalResults: 0,
            searchTime: Date.now() - startTime
        };
    }
}
function getMockResults(query) {
    // Provide mock results when live search isn't available
    return [
        {
            title: `Search results for "${query}"`,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: 'Try searching on Google, DuckDuckGo, or Bing directly for live results. The web search feature works best with an active internet connection.',
            domain: 'google.com'
        },
        {
            title: 'DuckDuckGo - The search engine that respects your privacy',
            url: 'https://duckduckgo.com',
            snippet: 'DuckDuckGo is a privacy-focused search engine that does not track your searches.',
            domain: 'duckduckgo.com'
        },
        {
            title: 'Bing Search - Microsoft Search Engine',
            url: 'https://www.bing.com',
            snippet: 'Bing is a web search engine owned and operated by Microsoft.',
            domain: 'bing.com'
        }
    ];
}
//# sourceMappingURL=webSearch.js.map