import './SocialMediaResults.css';

interface SocialMediaProfile {
  platform: string;
  username: string;
  exists: boolean;
  url: string;
  profileFound: boolean;
}

interface SocialMediaResultsProps {
  result: any;
}

function SocialMediaResults({ result }: SocialMediaResultsProps) {
  if (!result) return null;

  const foundProfiles = result.results.filter((r: SocialMediaProfile) => r.profileFound);
  const notFoundProfiles = result.results.filter((r: SocialMediaProfile) => !r.profileFound);

  return (
    <div className="social-results">
      <div className="results-header">
        <h2>🔍 Lookup Results for "@{result.searchedUsername}"</h2>
        <div className="results-summary">
          <div className="summary-item found">
            <span className="label">Profiles Found</span>
            <span className="count">{result.platformsFound}</span>
          </div>
          <div className="summary-item notfound">
            <span className="label">Not Found</span>
            <span className="count">{result.totalPlatforms - result.platformsFound}</span>
          </div>
          <div className="summary-item total">
            <span className="label">Total Searched</span>
            <span className="count">{result.totalPlatforms}</span>
          </div>
        </div>
      </div>

      {foundProfiles.length > 0 && (
        <div className="profiles-section found-section">
          <h3>✅ Profiles Found</h3>
          <div className="profiles-grid">
            {foundProfiles.map((profile: SocialMediaProfile, idx: number) => (
              <div key={idx} className="profile-card found">
                <div className="platform-name">{profile.platform}</div>
                <div className="username">@{profile.username}</div>
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link"
                >
                  Visit Profile →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {notFoundProfiles.length > 0 && (
        <div className="profiles-section notfound-section">
          <h3>❌ Not Found</h3>
          <div className="notfound-platforms">
            {notFoundProfiles.map((profile: SocialMediaProfile, idx: number) => (
              <div key={idx} className="platform-item notfound">
                <span className="check">✗</span>
                <span className="platform-name">{profile.platform}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="results-actions">
        <button
          className="copy-button"
          onClick={() => {
            const text = foundProfiles
              .map((p: SocialMediaProfile) => `${p.platform}: ${p.url}`)
              .join('\n');
            navigator.clipboard.writeText(text);
          }}
        >
          📋 Copy Found Links
        </button>
      </div>
    </div>
  );
}

export default SocialMediaResults;
