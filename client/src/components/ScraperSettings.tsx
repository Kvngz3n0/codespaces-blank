import React from 'react';
import './ScraperSettings.css';

interface ScraperSettingsProps {
  includeJS: boolean;
  screenshot: boolean;
  onIncludeJSChange: (value: boolean) => void;
  onScreenshotChange: (value: boolean) => void;
}

function ScraperSettings({
  includeJS,
  screenshot,
  onIncludeJSChange,
  onScreenshotChange
}: ScraperSettingsProps) {
  return (
    <div className="settings">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={includeJS}
          onChange={(e) => onIncludeJSChange(e.target.checked)}
        />
        <span>🔥 Include JavaScript Rendering (slower but more complete)</span>
      </label>

      {includeJS && (
        <label className="checkbox-label nested">
          <input
            type="checkbox"
            checked={screenshot}
            onChange={(e) => onScreenshotChange(e.target.checked)}
          />
          <span>📸 Take Screenshot</span>
        </label>
      )}

      <div className="settings-info">
        <small>
          <strong>Basic:</strong> HTML parsing - fast ⚡
          {includeJS && ' | <strong>JS:</strong> JavaScript rendering - complete 🔥'}
        </small>
      </div>
    </div>
  );
}

export default ScraperSettings;
