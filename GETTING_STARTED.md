# 🕷️ Web Scraper - Complete Getting Started Guide

## What You Get

A full-stack web scraper application with:
- ✅ **React Frontend**: Mobile-friendly, responsive UI
- ✅ **Express Backend**: TypeScript with dual scraping capabilities
- ✅ **Dual Scraping Modes**: Basic HTML parsing + JavaScript rendering
- ✅ **Mobile APK**: Export as Android app using Capacitor
- ✅ **Docker Ready**: Deploy anywhere with Docker
- ✅ **Production Ready**: Fully optimized and tested builds

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start Development Servers
```bash
npm run dev
```

The application will start on:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

That's it! You can now:
- Enter any URL in the input field
- Click "Scrape" to extract content
- Toggle JavaScript rendering for dynamic sites
- View results in organized tabs

## Features Overview

### 🔍 Scraping Modes

**Basic HTML Parsing** (Fast ⚡)
- Extracts headings, links, images, paragraphs
- Ideal for static websites
- ~2-5 seconds per page

**JavaScript Rendering** (Complete 🔥)
- Executes JavaScript before scraping
- Captures dynamic content
- Optional screenshot capability
- ~5-10 seconds per page

### �️ Website Crawler
- **Map entire websites** by crawling linked pages
- **Configurable depth** (1-5 levels) to control crawl scope
- **Robots.txt support** for ethical crawling
- **Discover all pages** on a domain with structure mapping

### 👤 Social Media Lookup
- **Search 12+ platforms** for usernames simultaneously
- **Find profiles** across Twit/X, GitHub, LinkedIn, Instagram, and more
- **Direct links** to found profiles
- **Quick verification** of social media presence

### 🔎 Web Search
- **Search the web** with flexible query support
- **9 language support** (English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese)
- **Adjustable results** (1-50 per search)
- **Clean search results** with snippets and publication dates

### �📱 Mobile-Friendly Interface

- Responsive design works on all devices
- Touch-optimized controls
- Fast mobile performance
- Can be installed as APK for native feel

### 🎯 Results Display

- **Headings**: Extract page structure
- **Links**: Browse related pages
- **Images**: View page imagery
- **Content**: Read extracted text
- **Full HTML**: Inspect page source

## Build & Deployment

### For Web

```bash
# Production build
npm run build

# Start production server
npm run start:server
# Open http://localhost:5000
```

Deploy to:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **AWS/Azure/GCP**: See DEPLOYMENT.md
- **Docker**: `npm run docker:run`

### For Mobile (APK)

```bash
# Build web first
npm run build

# Add Android platform
npx cap add android

# Generate APK
cd android && ./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed APK instructions.

### For Docker Container

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Open http://localhost:3000
```

## Project Structure

```
web-scraper-app/
├── server/                          # Express backend
│   ├── src/
│   │   ├── index.ts                # Main server & routes
│   │   └── scrapers/
│   │       ├── basicScraper.ts     # HTML parsing
│   │       └── jsScraper.ts        # JS rendering
│   ├── dist/                        # Compiled JS
│   ├── package.json
│   └── tsconfig.json
│
├── client/                          # React frontend
│   ├── src/
│   │   ├── App.tsx                 # Main component
│   │   ├── components/
│   │   │   ├── URLInput.tsx
│   │   │   ├── ScraperSettings.tsx
│   │   │   └── ResultsDisplay.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── public/
│   ├── dist/                        # Built app
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── android/                         # Capacitor Android
│   └── app/build/outputs/apk/      # Generated APK
│
├── capacitor.config.json            # Mobile config
├── Dockerfile                       # Docker config
├── docker-compose.yml               # Docker Compose
├── package.json                     # Root config
├── README.md                        # Main docs
├── DEPLOYMENT.md                    # Deploy guide
└── start.sh                         # Quick start script
```

##  Available Commands

### Development
```bash
npm run dev              # Start both servers
npm run dev:server      # Backend only
npm run dev:client      # Frontend only
```

### Building
```bash
npm run build            # Build for production
npm run build:client     # Frontend only
npm run build:server     # Backend only
```

### Deployment
```bash
npm run start:server     # Run production server
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
```

### Utilities
```bash
bash start.sh            # Quick start script
bash start.sh --build    # Build only
bash start.sh --prod     # Run production
```

## API Endpoints

### Basic Scraping
```bash
POST /api/scrape/basic
Content-Type: application/json

{
  "url": "https://example.com"
}

# Returns:
{
  "url": "...",
  "title": "...",
  "description": "...",
  "headings": [...],
  "links": [...],
  "images": [...],
  "paragraphs": [...],
  "elements": [...],
  "timestamp": "..."
}
```

### JavaScript Scraping
```bash
POST /api/scrape/js
Content-Type: application/json

{
  "url": "https://example.com",
  "screenshot": true  # Optional
}

# Returns:
{
  "url": "...",
  "title": "...",
  "content": "...",
  "html": "...",
  "screenshot": "data:image/png;base64,...",  # Optional
  "timestamp": "..."
}
```

### Combined Mode
```bash
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com",
  "includeJS": true,
  "screenshot": false
}

# Returns both basic and JS results
```

### Web Search
```bash
POST /api/search
Content-Type: application/json

{
  "query": "web scraping tools",
  "type": "web",           # 'web' or 'pages'
  "language": "en",        # language code
  "maxResults": 10         # 1-50
}

# Returns:
{
  "results": [
    {
      "title": "...",
      "url": "...",
      "snippet": "...",
      "domain": "...",
      "date": "..."
    }
  ],
  "query": "web scraping tools",
  "totalResults": 1234,
  "searchTime": 1500
}
```

### Crawler
```bash
POST /api/crawl
Content-Type: application/json

{
  "url": "https://example.com",
  "maxDepth": 2,       # 1-5
  "maxPages": 50       # 5-200
}
```

### Social Media Lookup
```bash
POST /api/social-lookup
Content-Type: application/json

{
  "username": "john_doe"
}
```

### Health Check
```bash
GET /api/health

# Returns: {"status":"ok","timestamp":"..."}
```

## Environment Variables

**For Development** (already configured in `.env`):
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
TIMEOUT=30000
```

**For Production** (create new `.env`):
```
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
TIMEOUT=30000
```

## Performance Tips

| Mode | Speed | Completeness | Use Case |
|------|-------|--------------|----------|
| Basic | ⚡⚡⚡ | 80% | Static websites |
| JavaScript | ⚡⚡ | 99% | Dynamic/SPA sites |
| Combined | ⚡ | 99% | Comprehensive data |

**For Production**:
- Use basic mode by default (faster)
- Enable JS mode only when needed
- Disable screenshots to save bandwidth
- Consider caching results

## Troubleshooting

### Can't connect to backend
```bash
# Check if server is running
curl http://localhost:5000/api/health

# Restart server
npm run dev:server
```

### Scraping returns error
- Verify URL is accessible from your network
- Check if site has anti-scraping headers
- Try basic mode before JavaScript mode
- Increase timeout if pages are complex

### Docker build fails
```bash
# Clean and rebuild
docker system prune -a
npm run docker:build
```

### APK installation fails
- Ensure you have Android SDK installed
- Java 17+ is required
- Try clearing app data: `adb shell pm clear com.webscraper.app`

## Next Steps

1. **Customize Styling**: Edit `client/src/App.css` and component CSS files
2. **Add Features**: Extend scraping capabilities in `server/src/scrapers/`
3. **Deploy to Cloud**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Generate APK**: See APK section in [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Optimize Performance**: See performance tips above

## Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Docker Guide](https://docs.docker.com)
- [Android Development](https://developer.android.com)

## Support

Having issues? Check:
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment troubleshooting
2. [README.md](./README.md) - Full documentation
3. Server logs: `npm run dev:server`
4. Browser console: F12 in your browser

## Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React | 18.2 |
| Backend | Express | 4.18 |
| Language | TypeScript | 5.3 |
| Build Tool | Vite | 5.0 |
| Mobile | Capacitor | 6.0 |
| Container | Docker | Latest |
| Scraping | Cheerio + Puppeteer | Latest |

Enjoy scraping! 🕷️
