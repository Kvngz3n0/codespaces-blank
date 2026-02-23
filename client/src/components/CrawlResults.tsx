import React from 'react';
import './CrawlResults.css';
import MediaDownloadPanel from './MediaDownloadPanel';

interface CrawlPage {
  url: string;
  title: string;
  depth: number;
  statusCode: number;
  outgoingLinks: string[];
}

interface SearchResult {
  sourceUrl: string;
  pageTitle: string;
  excerpt: string;
  matchCount: number;
}

interface CrawlResultsProps {
  result: any;
}

function CrawlResults({ result }: CrawlResultsProps) {
  const [expandedPages, setExpandedPages] = React.useState<Record<number, boolean>>({});

  const togglePage = (idx: number) => {
    setExpandedPages((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!result) return null;

  // Check if this is a search result or crawl result
  const isSearchResult = result.searchTerm && result.results && Array.isArray(result.results) && (result.results[0]?.sourceUrl !== undefined);

  if (isSearchResult) {
    return (
      <div className="crawl-results">
        <div className="crawl-header">
          <h2>🔍 Search Results</h2>
          <div className="crawl-stats">
            <div className="stat">
              <span className="stat-label">Results Found</span>
              <span className="stat-value">{result.resultsFound}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pages Searched</span>
              <span className="stat-value">{result.pagesSearched}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Duration</span>
              <span className="stat-value">{(result.duration / 1000).toFixed(2)}s</span>
            </div>
            <div className="stat">
              <span className="stat-label">Search Term</span>
              <span className="stat-value" style={{ fontSize: '0.9rem' }}>"{result.searchTerm}"</span>
            </div>
          </div>
        </div>

        <div className="crawl-pages">
          <h3>🔗 Results with Source Links</h3>
          {result.resultsFound === 0 ? (
            <p style={{ color: '#c0c0c0', padding: '1rem' }}>No results found for "{result.searchTerm}"</p>
          ) : (
            <div className="pages-list">
              {result.results.map((searchResult: SearchResult, idx: number) => (
                <div key={idx} className="page-item">
                  <button
                    className="page-header"
                    onClick={() => togglePage(idx)}
                  >
                    <span className="toggle-icon">{expandedPages[idx] ? '▼' : '▶'}</span>
                    <span className="depth-badge">{searchResult.matchCount} match{searchResult.matchCount !== 1 ? 'es' : ''}</span>
                    <span className="page-title">{searchResult.pageTitle}</span>
                  </button>

                  {expandedPages[idx] && (
                    <div className="page-details">
                      <div className="detail-row">
                        <strong>Source URL:</strong>
                        <a href={searchResult.sourceUrl} target="_blank" rel="noopener noreferrer">
                          {searchResult.sourceUrl}
                        </a>
                      </div>
                      <div className="detail-row">
                        <strong>Excerpt:</strong>
                        <p style={{ margin: '0.5rem 0', color: '#c0c0c0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                          {searchResult.excerpt}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const avgDuration = (result.duration / 1000).toFixed(2);

  return (
    <div className="crawl-results">
      <div className="crawl-header">
        <h2>📊 Crawl Results</h2>
        <div className="crawl-stats">
          <div className="stat">
            <span className="stat-label">Pages Crawled</span>
            <span className="stat-value">{result.pagesVisited}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Links Found</span>
            <span className="stat-value">{result.totalLinks}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{avgDuration}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">Errors</span>
            <span className="stat-value">{Object.keys(result.errors).length}</span>
          </div>
        </div>
      </div>

      <div className="crawl-pages">
        <h3>📄 Pages Discovered</h3>
        <div className="pages-list">
          {result.pagesCrawled.map((page: CrawlPage, idx: number) => (
            <div key={idx} className="page-item">
              <button
                className="page-header"
                onClick={() => togglePage(idx)}
              >
                <span className="toggle-icon">{expandedPages[idx] ? '▼' : '▶'}</span>
                <span className="depth-badge">D{page.depth}</span>
                <span className="page-title">{page.title || page.url}</span>
                <span className="status-code">{page.statusCode}</span>
              </button>

              {expandedPages[idx] && (
                <div className="page-details">
                  <div className="detail-row">
                    <strong>URL:</strong>
                    <a href={page.url} target="_blank" rel="noopener noreferrer">
                      {page.url}
                    </a>
                  </div>

                  {page.title && (
                    <div className="detail-row">
                      <strong>Title:</strong>
                      <span>{page.title}</span>
                    </div>
                  )}

                  <div className="detail-row">
                    <strong>Outgoing Links ({page.outgoingLinks.length})</strong>
                  </div>

                  {page.outgoingLinks.length > 0 && (
                    <div className="links-list">
                      {page.outgoingLinks.slice(0, 10).map((link: string, linkIdx: number) => (
                        <a
                          key={linkIdx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-item"
                        >
                          {link}
                        </a>
                      ))}
                      {page.outgoingLinks.length > 10 && (
                        <div className="more-links">+{page.outgoingLinks.length - 10} more</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {result.media && <MediaDownloadPanel media={result.media} title="📥 Extracted Media from Crawl" />}

      {Object.keys(result.errors).length > 0 && (
        <div className="crawl-errors">
          <h3>⚠️ Errors ({Object.keys(result.errors).length})</h3>
          <div className="errors-list">
            {Object.entries(result.errors)
              .slice(0, 5)
              .map(([url, error]: [string, any], idx: number) => (
                <div key={idx} className="error-item">
                  <strong className="error-url">{url}</strong>
                  <span className="error-msg">{error}</span>
                </div>
              ))}
            {Object.keys(result.errors).length > 5 && (
              <div className="more-errors">+{Object.keys(result.errors).length - 5} more errors</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CrawlResults;
