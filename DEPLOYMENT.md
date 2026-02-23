# Web Scraper - Deployment & APK Build Guide

## ⚡ Simple Deployment (Fast Track)

Just want to get it running? **3 commands:**

```bash
# 1. Build it
npm run build

# 2. Start it
npm run start:server

# That's it. Running on localhost:5000
```

**For cPanel:**
1. Upload the project files via FTP/cPanel
2. SSH in and run: `npm run build && npm run start:server`
3. Ask your host to point your domain to port 3000/5000
4. Done

**For cloud (Heroku, Railway, etc):**
```bash
git push heroku main
# or connect your GitHub repo to Railway - auto deploys
```

---

## 🚀 Quick Start (Development)

```bash
# Install all dependencies
npm run install-all

# Start development servers (runs on http://localhost:3000)
npm run dev
```

## 📱 Building APK for Android

### Prerequisites
- Node.js 20+
- Java Development Kit (JDK 17 or higher)
- Android SDK (via Android Studio or SDK Manager)
- Minimum 15GB free disk space

### Step-by-Step APK Build

#### 1. **Initial Setup**
```bash
# Install Capacitor CLI globally
npm install -g @capacitor/cli

# Build the web app first
npm run build

# Add Android platform
npx cap add android

# Sync the project
npx cap sync android
```

#### 2. **Configure Android App**

Open `android/app/src/main/AndroidManifest.xml` and ensure internet permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### 3. **Build APK Options**

**Option A: Debug APK (for testing)**
```bash
cd android
./gradlew assembleDebug
# APK location: app/build/outputs/apk/debug/app-debug.apk
```

**Option B: Release APK (for distribution)**
First, create a keystore:
```bash
cd android
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

Then build:
```bash
cd android
./gradlew assembleRelease
# APK location: app/build/outputs/bundle/release/app-release.aab
```

**Option C: Using Android Studio (Recommended)**
```bash
# Open Android Studio with the project
npx cap open android

# In Android Studio:
# 1. Click Build → Build Bundle(s) / APK(s) → Build APK(s)
# 2. Wait for completion
# 3. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

#### 4. **Install APK on Device/Emulator**

```bash
# Connect device or start emulator, then:
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or directly from Gradle:
cd android
./gradlew installDebug
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
npm run docker:build
```

### Run Docker Container
```bash
npm run docker:run
# App available at http://localhost:3000
```

### Push to Docker Registry
```bash
# Tag the image
docker tag web-scraper-app your-registry/web-scraper-app:latest

# Push to registry
docker push your-registry/web-scraper-app:latest
```

## 🌐 cPanel Shared Hosting Deployment

### ⚠️ Prerequisites Check

Before deploying to cPanel, verify with your hosting provider that they support:
- ✅ Node.js (not just PHP)
- ✅ SSH/Terminal access
- ✅ npm or Node Package Manager
- ✅ Process management (PM2 or restart capability)

**Contact your host and ask:** *"Does your cPanel support Node.js applications?"*

### If Your cPanel Host Supports Node.js:

#### Step 1: SSH Into Your Server
```bash
ssh your-username@your-domain.com
```

#### Step 2: Navigate to Public HTML
```bash
cd ~/public_html
# Or your app directory
```

#### Step 3: Clone/Upload Your App
```bash
# Option A: Clone from Git
git clone https://your-repo-url.git web-scraper

# Option B: Upload files via cPanel File Manager
# Then extract and navigate to folder
cd web-scraper
```

#### Step 4: Install Dependencies
```bash
npm install
npm run build
```

#### Step 5: Create .env File
```bash
# In the server directory
cat > server/.env << EOF
PORT=3000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
EOF
```

#### Step 6: Start with PM2 (Recommended)
```bash
npm install -g pm2

# Start the application
npm run start:server

# Or use PM2 directly
pm2 start "npm run start:server" --name "web-scraper"
pm2 save
pm2 startup
```

#### Step 7: Configure Reverse Proxy (Ask Your Host)
Your cPanel host needs to setup a reverse proxy from your domain to localhost:3000 or your assigned port.

**Contact support and provide:**
```
Domain: yourdomain.com
Application: Node.js web app
Port: 3000 (or assigned port)
Script: npm run start:server
```

---

### If Your cPanel Host Does NOT Support Node.js:

**Recommended Alternatives:**

#### Option A: **Heroku** (Easiest, Free Tier)
```bash
heroku login
heroku create your-web-scraper-app
git push heroku main
```

#### Option B: **Railway.app** (Recommended)
- Connect your GitHub repo
- Railway auto-detects Node.js
- Deploy with one click
- $5-10/month

#### Option C: **DigitalOcean App Platform**
- Deploy Node.js apps easily
- $12/month starting
- No configuration needed

#### Option D: **AWS Elastic Beanstalk**
- Scalable
- Free tier available
- More complex setup

---

### Limitations with cPanel:
- ❌ May not have Puppeteer/headless Chrome (JavaScript rendering)
- ⚠️ Limited resources on shared hosting
- ⚠️ May not support long-running crawls
- ⚠️ Memory restrictions

### Best for cPanel:
- ✅ Web scraping (basic HTML only)
- ✅ Social media lookup
- ✅ Light to medium load

### NOT Recommended on cPanel:
- ❌ JavaScript rendering with Puppeteer (too resource-intensive)
- ❌ Large-scale crawling operations
- ❌ High concurrent users

---

## ☁️ Production Deployment (Cloud)

### AWS Deployment (Example)

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name web-scraper-app

# 2. Build and push image
docker build -t web-scraper-app .
docker tag web-scraper-app:latest <aws-account>.dkr.ecr.<region>.amazonaws.com/web-scraper-app:latest
docker push <aws-account>.dkr.ecr.<region>.amazonaws.com/web-scraper-app:latest

# 3. Deploy to ECS, App Runner, or EKS
```

### Heroku Deployment

```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create app
heroku create your-web-scraper-app

# 4. Deploy
git push heroku main
```

### Railway.app Deployment

```bash
# Railway automatically detects and deploys Node.js apps
# Just connect your GitHub repo and push to main
```

## 🔧 Configuration for Deployment

### Environment Variables (Production)

Create `.env` in the `server` directory:

```
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
TIMEOUT=30000
```

### Optimize for Production

```bash
# Generate optimized client build
npm run build:client

# Then compress and serve with Node.js
npm run start:server
```

## 📦 APK Size Optimization

### Reduce Build Size

1. **Enable ProGuard** (in `android/app/build.gradle`):
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

2. **Remove Unused Dependencies**
```bash
cd client
npm prune --production
```

3. **Split APK** (Capacitor automatically does this)

### Typical APK Sizes
- Debug: ~150MB
- Release: ~80MB
- With Proguard: ~60MB

## 🧪 Testing the Build

### Test Development Build
```bash
npm run dev
# Test at http://localhost:3000
```

### Test Production Build Locally
```bash
npm run build
npm run start:server
# Test at http://localhost:5000
```

### Test APK on Emulator
```bash
# Start Android emulator first
emulator -avd YourEmulatorName

# Then install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or run tests
adb shell am instrument -w com.webscraper.app/androidx.test.runner.AndroidJUnitRunner
```

## 🔐 Security Considerations

1. **Add HTTPS in Production**
   - Configure SSL certificate
   - Update CLIENT_URL to use https://

2. **Rate Limiting**
   - Add express-rate-limit middleware
   - Limit requests per IP

3. **Input Validation**
   - Validate all URLs
   - Sanitize user input

4. **API Keys**
   - Use environment variables
   - Never commit secrets

## 🐛 Troubleshooting Deployments

### APK Installation Failed
```bash
# Clear app data
adb shell pm clear com.webscraper.app

# Try installing again
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Puppeteer Not Loading in APK
- Ensure PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false in production
- Verify Java version (JDK 17+ required)

### WebView Issues
- Update Android System WebView
- Check `capacitor.config.json` settings

### Out of Memory During Build
```bash
export GRADLE_OPTS="-Xmx4096m"
```

## 📊 Performance Monitoring

Add monitoring to your deployment:

```bash
# PM2 for process management
npm install -g pm2
pm2 start npm --name "web-scraper" -- run start:server
pm2 save
pm2 startup
```

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/)
- [Android Development Guide](https://developer.android.com/)
- [Docker Deployment](https://docs.docker.com/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

## 🎯 Summary

1. **Web App**: Deploy anywhere Node.js runs (Heroku, Railway, AWS, etc.)
2. **APK**: Build with Capacitor, distribute via Google Play or sideload
3. **Docker**: Containerize and deploy to any container platform
4. **Mobile**: Use APK for native mobile experience

Choose deployment method based on your requirements!
