import React from 'react';
import './URLInput.css';

interface URLInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onScrape: () => void;
  loading: boolean;
}

function URLInput({ url, onUrlChange, onScrape, loading }: URLInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      onScrape();
    }
  };

  return (
    <div className="url-input-group">
      <input
        type="url"
        className="url-input"
        placeholder="Enter URL (e.g., https://example.com)"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
      <button
        className="scrape-button"
        onClick={onScrape}
        disabled={loading || !url.trim()}
      >
        {loading ? '⏳ Scraping...' : '🔍 Scrape'}
      </button>
    </div>
  );
}

export default URLInput;
