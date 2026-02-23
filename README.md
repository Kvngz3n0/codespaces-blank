# Web Scraper Application

A full-stack web scraper with browser-like feel, mobile-friendly design, **crawling capabilities**, and **social media username lookup** - deployable as a web app or APK.

## ✨ Features

- 🕷️ **Dual Scraping Modes** (Enhanced!)
  - Basic HTML parsing (fast ⚡)
  - JavaScript rendering (complete 🔥)
  - 🆕 **Anti-detection bypass** - Works on 451/403 blocked sites
  - 🆕 **Realistic user-agent rotation** - 5+ different realistic browser agents
  - 🆕 **Retry logic** - Automatic 3 retries with exponential backoff
  - 🆕 **Browser-like headers** - Mimics real browser requests
  
- 🕸️ **Website Crawler** (Enhanced!)
  - Discover all linked pages from a starting URL
  - Respects robots.txt
  - Configurable depth and limits
  - 🆕 Works on geographically-blocked and restricted sites
  - 🆕 Extracts content from 451/403 error responses
  - 🆕 Rotates user agents per request
  
- 👤 **Social Media Lookup**
  - Search 12+ social media platforms
  - Find usernames across Twitter, GitHub, LinkedIn, Instagram, and more
  - Now also includes subscription/adult platforms: OnlyFans, Patreon, Fansly, Pornhub, ManyVids, JustFor.Fans, SubscribeAdult
  
- 🔎 **Web Search**
  - Search the web with customizable results
  - Multiple language support (9 languages)
  - Adjustable result limits
  
- 🛡️ **Anti-Detection Features** (NEW!)
  - Gets past bot detection algorithms
  - Works on 451 (Legal Restrictions) blocked sites
  - Can extract 403 (Forbidden) content
  - Puppeteer anti-webdriver override
  - Browser-like HTTP headers (DNT, Sec-Fetch-*, etc.)
  
- 📱 **Mobile-Friendly Design**
  - Responsive UI that works on all devices
  - Touch-optimized controls
  
- 🌐 **Browser-like Experience**
  - Clean, intuitive interface
  - Tab-based navigation
  - Screenshot capture capability
  
- 🚀 **Easy Deployment**
  - Docker support
  - APK generation with Capacitor
  - Production-ready build system

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation & Development

```bash
# Install all dependencies
npm run install-all

# Start development servers (frontend + backend)
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Build for Production

```bash
# Build both frontend and backend
npm run build

# Start production server
npm run start:server
```

## Python Engine (optional)

This project includes an optional Python-based scraper/crawler engine. To use it install Python dependencies inside the `server` folder:

```bash
pip3 install -r server/requirements.txt
```

Then in the UI or API set `engine: "python"` to run scraping/crawling via the Python engine.

## Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

The app will be available at http://localhost:3000

## API Endpoints

### Basic HTML Scraping
```
POST /api/scrape/basic
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### JavaScript-Rendered Scraping
```
POST /api/scrape/js
Content-Type: application/json

{
  "url": "https://example.com",
  "screenshot": true  // Optional
}
```

### Combined Scraping
```
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com",
  "includeJS": false,
  "screenshot": false
}
```

### Website Crawler
```
POST /api/crawl
Content-Type: application/json

{
  "url": "https://example.com",
  "maxDepth": 2,
  "maxPages": 50
}
```

### Social Media Lookup
```
POST /api/social-lookup
Content-Type: application/json

{
  "username": "john_doe",
  "platforms": ["github", "twitter"]  // optional
}
```

### Web Search
```
POST /api/search
Content-Type: application/json

{
  "query": "web scraping tools",
  "type": "web",           // 'web' or 'pages'
  "language": "en",        // language code
  "maxResults": 10          // 1-50
}
```

## Building APK for Mobile

### Prerequisites
- Java Development Kit (JDK 17+)
- Android SDK
- Android Studio (recommended)

### Setup

```bash
# Install Capacitor CLI globally
npm install -g @capacitor/cli

# Add Android platform
npx cap add android

# Build client first
npm run build:client

# Sync with Android
npx cap sync android
```

### Generate APK

```bash
# Open Android Studio
npx cap open android

# In Android Studio:
# 1. Click "Build" menu
# 2. Select "Build Bundle(s) / APK(s)" > "Build APK(s)"
# 3. Wait for build to complete
# 4. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk

# Or build from command line:
cd android
./gradlew assembleDebug
cd ..
```

The APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (Signed)

```bash
cd android
./gradlew bundleRelease
cd ..
```

## Project Structure

```
.
├── server/                 # Express backend with scrapers
│   ├── src/
│   │   ├── index.ts       # Main server file
│   │   └── scrapers/
│   │       ├── basicScraper.ts
│   │       └── jsScraper.ts
│   ├── package.json
│   └── tsconfig.json
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main app component
│   │   ├── components/    # React components
│   │   └── main.tsx       # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── capacitor.config.json   # Capacitor config for APK
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose
└── package.json            # Root package.json
```

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Capacitor (for APK)

### Backend
- Express.js
- TypeScript
- Cheerio (HTML parsing)
- JSDOM (DOM simulation)
- Puppeteer (JavaScript rendering)

### DevOps
- Docker
- Docker Compose

## Environment Variables

Create `.env` in the `server` directory:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
TIMEOUT=30000
```

## Performance Tips

- **Basic scraping** is faster for static content
- **JS rendering** is needed for dynamic/SPA content
- Screenshots can slow down scraping; disable if not needed
- Container image size: ~1.5GB (includes Puppeteer + Chromium)
- Typical scrape time: 2-10 seconds depending on page complexity

## Troubleshooting

### Puppeteer takes too long to download
Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` during development, but ensure Chromium is available for production.

### APK size is too large
- Remove unused dependencies
- Use ProGuard for code shrinking
- Consider using a separate backend server

### CORS errors when scraping
Ensure `CLIENT_URL` environment variable matches your frontend URL.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
