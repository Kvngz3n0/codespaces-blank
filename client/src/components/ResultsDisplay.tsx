import React, { useState } from 'react';
import './ResultsDisplay.css';
import MediaDownloadPanel from './MediaDownloadPanel';

interface ResultsDisplayProps {
  results: any;
  activeTab: 'basic' | 'js';
  onTabChange: (tab: 'basic' | 'js') => void;
}

function ResultsDisplay({ results, activeTab, onTabChange }: ResultsDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    headings: true,
    links: false,
    images: false,
    paragraphs: false,
    elements: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasBasic = results.basic && !results.basicError;
  const hasJS = results.js && !results.jsError;

  return (
    <div className="results">
      <div className="results-tabs">
        {hasBasic && (
          <button
            className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => onTabChange('basic')}
          >
            📄 Basic HTML
          </button>
        )}
        {hasJS && (
          <button
            className={`tab ${activeTab === 'js' ? 'active' : ''}`}
            onClick={() => onTabChange('js')}
          >
            🔥 JavaScript
          </button>
        )}
      </div>

      {activeTab === 'basic' && hasBasic && (
        <BasicResults data={results.basic} onToggle={toggleSection} expanded={expandedSections} />
      )}

      {activeTab === 'js' && hasJS && (
        <JSResults data={results.js} />
      )}

      {activeTab === 'basic' && results.basicError && (
        <div className="error-box">{results.basicError}</div>
      )}

      {activeTab === 'js' && results.jsError && (
        <div className="error-box">{results.jsError}</div>
      )}
    </div>
  );
}

function BasicResults({
  data,
  onToggle,
  expanded
}: {
  data: any;
  onToggle: (section: string) => void;
  expanded: Record<string, boolean>;
}) {
  return (
    <div className="results-content">
      <div className="result-section">
        <h2>📍 Page Title</h2>
        <p className="page-title">{data.title}</p>
      </div>

      {data.description && (
        <div className="result-section">
          <h3>📝 Description</h3>
          <p className="description">{data.description}</p>
        </div>
      )}

      <div className="result-section">
        <button
          className="section-toggle"
          onClick={() => onToggle('headings')}
        >
          {expanded.headings ? '▼' : '▶'} 📖 Headings ({data.headings.length})
        </button>
        {expanded.headings && (
          <ul className="list-content">
            {data.headings.map((heading: string, idx: number) => (
              <li key={idx}>{heading}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="result-section">
        <button
          className="section-toggle"
          onClick={() => onToggle('links')}
        >
          {expanded.links ? '▼' : '▶'} 🔗 Links ({data.links.length})
        </button>
        {expanded.links && (
          <div className="links-content">
            {data.links.slice(0, 30).map((link: any, idx: number) => (
              <div key={idx} className="link-item">
                <a href={link.href} target="_blank" rel="noopener noreferrer" title={link.href}>
                  {link.text || link.href}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.images.length > 0 && (
        <div className="result-section">
          <button
            className="section-toggle"
            onClick={() => onToggle('images')}
          >
            {expanded.images ? '▼' : '▶'} 🖼️ Images ({data.images.length})
          </button>
          {expanded.images && (
            <div className="images-grid">
              {data.images.slice(0, 12).map((img: string, idx: number) => (
                <div key={idx} className="image-thumbnail">
                  <img src={img} alt={`Image ${idx}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data.paragraphs.length > 0 && (
        <div className="result-section">
          <button
            className="section-toggle"
            onClick={() => onToggle('paragraphs')}
          >
            {expanded.paragraphs ? '▼' : '▶'} 📰 Paragraphs ({data.paragraphs.length})
          </button>
          {expanded.paragraphs && (
            <div className="paragraphs-content">
              {data.paragraphs.map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {data.media && <MediaDownloadPanel media={data.media} title="📥 Extracted Media" />}
    </div>
  );
}

function JSResults({ data }: { data: any }) {
  const [showHTML, setShowHTML] = useState(false);

  return (
    <div className="results-content">
      <h2>🔥 JavaScript-Rendered Content</h2>

      {data.screenshot && (
        <div className="screenshot-section">
          <h3>📸 Screenshot</h3>
          <img src={data.screenshot} alt="Page screenshot" className="screenshot" />
        </div>
      )}

      <div className="result-section">
        <h3>📄 Title</h3>
        <p className="page-title">{data.title}</p>
      </div>

      <div className="result-section">
        <h3>📝 Content</h3>
        <pre className="content-preview">{data.content.slice(0, 2000)}</pre>
      </div>

      <button
        className="toggle-html"
        onClick={() => setShowHTML(!showHTML)}
      >
        {showHTML ? '▼ Hide' : '▶ Show'} Full HTML
      </button>

      {showHTML && (
        <pre className="html-preview">{data.html.slice(0, 5000)}</pre>
      )}
    </div>
  );
}

export default ResultsDisplay;
