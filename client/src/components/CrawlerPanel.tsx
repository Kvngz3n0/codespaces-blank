import { useState } from 'react';
import axios from 'axios';
import './CrawlerPanel.css';

interface CrawlerPanelProps {
  onCrawlStart: () => void;
  onCrawlComplete: (result: any) => void;
}

function CrawlerPanel({ onCrawlStart, onCrawlComplete }: CrawlerPanelProps) {
  const [crawlUrl, setCrawlUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCrawl = async () => {
    if (!crawlUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    onCrawlStart();

    try {
      const response = await axios.post('/api/crawl', {
        url: crawlUrl.trim(),
        maxDepth,
        maxPages
      });
      onCrawlComplete(response.data);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!crawlUrl.trim()) {
      setError('Please enter a URL');
      return;
    }
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    onCrawlStart();

    try {
      const response = await axios.post('/api/search', {
        url: crawlUrl.trim(),
        searchTerm: searchTerm.trim(),
        maxDepth,
        maxPages
      });
      onCrawlComplete(response.data);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crawler-panel">
      <div className="crawler-header">
        <h2>🕸️ Website Crawler</h2>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${!isSearchMode ? 'active' : ''}`}
            onClick={() => setIsSearchMode(false)}
          >
            Crawl
          </button>
          <button
            className={`mode-btn ${isSearchMode ? 'active' : ''}`}
            onClick={() => setIsSearchMode(true)}
          >
            Search
          </button>
        </div>
      </div>
      <p className="crawler-desc">
        {isSearchMode ? 'Search for terms within a website' : 'Crawl a website and discover all linked pages'}
      </p>

      <div className="crawler-inputs">
        <input
          type="url"
          className="crawler-url-input"
          placeholder="Enter URL to crawl (e.g., https://example.com)"
          value={crawlUrl}
          onChange={(e) => setCrawlUrl(e.target.value)}
          disabled={loading}
        />

        {isSearchMode && (
          <input
            type="text"
            className="crawler-url-input"
            placeholder="Enter search term (e.g., javascript, tutorial)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        )}

        <div className="crawler-controls">
          <div className="control-group">
            <label>Max Depth: {maxDepth}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              disabled={loading}
              className="slider"
            />
            <small>How deep to follow links (1-5)</small>
          </div>

          <div className="control-group">
            <label>Max Pages: {maxPages}</label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={maxPages}
              onChange={(e) => setMaxPages(parseInt(e.target.value))}
              disabled={loading}
              className="slider"
            />
            <small>Maximum pages to crawl (5-200)</small>
          </div>
        </div>

        <button
          className="crawl-button"
          onClick={isSearchMode ? handleSearch : handleCrawl}
          disabled={loading || !crawlUrl.trim() || (isSearchMode && !searchTerm.trim())}
        >
          {loading ? '⏳ Processing...' : isSearchMode ? '🔍 Start Search' : '🕸️ Start Crawl'}
        </button>
      </div>

      {error && <div className="crawler-error">{error}</div>}
    </div>
  );
}

export default CrawlerPanel;
