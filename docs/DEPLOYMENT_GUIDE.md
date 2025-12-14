# Deployment Guide - 3D Geometric Viewer v3.0

## Overview

This guide covers building, deploying, and hosting the 3D Geometric Viewer application in production environments.

## Table of Contents

- [Quick Deploy](#quick-deploy)
- [Build Process](#build-process)
- [Deployment Platforms](#deployment-platforms)
- [Configuration](#configuration)
- [Optimization](#optimization)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Deploy

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Git (for version control)

### One-Command Deploy

```bash
# Build production bundle
npm run build

# Preview locally before deploying
npm run preview

# Deploy (platform-specific command below)
```

---

## Build Process

### Development Build

```bash
# Start development server with hot reload
npm run dev

# Opens at http://localhost:5173
```

### Production Build

```bash
# Create optimized production build
npm run build

# Output: dist/ directory
```

**Build Output Structure:**

```
dist/
├── index.html           # Entry HTML
├── assets/
│   ├── index-[hash].js  # Main bundle
│   ├── index-[hash].css # Styles
│   └── ...              # Chunked modules
├── public/              # Static assets
│   └── models/          # Model files
└── ...
```

### Build Configuration

**vite.config.js** (if needed):

```javascript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/', // Change for subdirectory hosting
  build: {
    outDir: 'dist',
    sourcemap: false, // Enable for debugging
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'], // Separate Three.js chunk
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Deployment Platforms

### 1. Vercel (Recommended)

**Zero-config deployment with automatic previews**

#### Deploy with GitHub Integration

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import repository
4. Deploy automatically

#### Deploy with CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configuration** (`vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "vite",
  "installCommand": "npm install",
  "env": {
    "NODE_VERSION": "18"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### 2. Netlify

**Simple static site hosting with CDN**

#### Deploy with GitHub Integration

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

#### Deploy with CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Configuration** (`netlify.toml`):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache"
```

---

### 3. GitHub Pages

**Free hosting for public repositories**

#### Setup

1. **Install gh-pages package**:

```bash
npm install -D gh-pages
```

2. **Add deploy script to `package.json`**:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **Configure base path** in `vite.config.js`:

```javascript
export default defineConfig({
  base: '/3d-geometric-search/', // Your repo name
});
```

4. **Deploy**:

```bash
npm run deploy
```

5. **Enable GitHub Pages** in repository settings:
   - Settings → Pages
   - Source: gh-pages branch
   - Access at: `https://username.github.io/3d-geometric-search/`

---

### 4. AWS S3 + CloudFront

**Enterprise-grade hosting with global CDN**

#### Prerequisites

- AWS account
- AWS CLI installed and configured

#### Deploy Steps

1. **Create S3 Bucket**:

```bash
aws s3 mb s3://your-viewer-bucket
aws s3 website s3://your-viewer-bucket/ --index-document index.html
```

2. **Build and Upload**:

```bash
npm run build
aws s3 sync dist/ s3://your-viewer-bucket/ --delete
```

3. **Set Bucket Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-viewer-bucket/*"
    }
  ]
}
```

4. **Create CloudFront Distribution** (optional, recommended):

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-viewer-bucket.s3.amazonaws.com
```

#### Automation Script

**deploy.sh**:

```bash
#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://your-viewer-bucket/ \
  --delete \
  --cache-control max-age=31536000

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deployment complete!"
```

---

### 5. Docker Container

**Containerized deployment for any platform**

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t 3d-viewer .

# Run container
docker run -p 8080:80 3d-viewer

# Access at http://localhost:8080
```

#### Docker Compose

**docker-compose.yml**:

```yaml
version: '3.8'
services:
  viewer:
    build: .
    ports:
      - '8080:80'
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

```bash
docker-compose up -d
```

---

## Configuration

### Environment Variables

Create `.env.production` for production settings:

```bash
# API endpoints (if applicable)
VITE_API_URL=https://api.example.com

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# Model storage
VITE_MODEL_CDN=https://cdn.example.com/models
```

### Access in Code

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
```

---

## Optimization

### Build Optimizations

#### 1. **Code Splitting**

Automatic with Vite:

```javascript
// Dynamic imports create separate chunks
const ModelLoader = () => import('./services/ModelLoaderService.js');
```

#### 2. **Asset Optimization**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['three'],
          utils: ['src/utils/*.js'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
      },
    },
  },
});
```

#### 3. **Asset Compression**

Install compression plugin:

```bash
npm install -D vite-plugin-compression
```

```javascript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

### Performance Optimizations

#### 1. **Lazy Loading Models**

```javascript
// Load model only when needed
async function loadModelOnDemand(modelId) {
  const { ModelLoaderService } = await import('./services/ModelLoaderService.js');
  const loader = new ModelLoaderService();
  return loader.loadFromURL(`/models/${modelId}.gltf`);
}
```

#### 2. **Web Workers for Heavy Processing**

```javascript
// worker.js
self.addEventListener('message', e => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
});

// main.js
const worker = new Worker('./worker.js');
worker.postMessage(data);
worker.onmessage = e => console.log(e.data);
```

#### 3. **Service Worker for Caching**

```javascript
// service-worker.js
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll(['/', '/index.html', '/assets/index.js', '/assets/index.css']);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

---

## Monitoring

### Performance Monitoring

#### 1. **Lighthouse CI**

```bash
npm install -g @lhci/cli

# Run Lighthouse
lhci autorun
```

#### 2. **Web Vitals Tracking**

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, delta, id }) {
  // Send to analytics service
  console.log(name, delta, id);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Tracking

#### Sentry Integration

```bash
npm install @sentry/browser
```

```javascript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
  tracesSampleRate: 1.0,
});

// Errors automatically tracked
```

---

## Security

### Content Security Policy

Add to `index.html`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
        default-src 'self';
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https://api.example.com;
      "
/>
```

### HTTPS Only

Enforce HTTPS redirect:

```javascript
// nginx.conf
server {
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    # SSL configuration...
}
```

---

## Troubleshooting

### Common Issues

#### 1. **404 on Refresh (SPA Routing)**

**Solution**: Configure server for SPA routing

**Netlify** (`_redirects`):

```
/*    /index.html   200
```

**Apache** (`.htaccess`):

```
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### 2. **Large Bundle Size**

**Solution**: Analyze and optimize

```bash
npm run build -- --mode analyze
```

Use dynamic imports for code splitting.

#### 3. **CORS Issues with Models**

**Solution**: Configure CORS headers

```javascript
// netlify.toml
[[headers]]
  for = "/models/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

#### 4. **WebGL Not Working**

Check browser compatibility:

```javascript
function checkWebGLSupport() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    alert('WebGL is not supported in your browser');
    return false;
  }
  return true;
}
```

---

## Rollback Strategy

### Quick Rollback

#### Vercel

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

#### Netlify

```bash
# Rollback to previous deployment
netlify deploy --alias previous-version
```

#### GitHub Pages

```bash
# Revert to previous commit
git revert HEAD
git push origin main
npm run deploy
```

---

## CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml**:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID}}
          vercel-args: '--prod'
```

---

## Checklist

### Pre-Deployment

- [ ] Run tests: `npm test`
- [ ] Build production: `npm run build`
- [ ] Test build locally: `npm run preview`
- [ ] Check bundle size
- [ ] Review browser console for errors
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Check WebGL support
- [ ] Verify model loading
- [ ] Test export functionality

### Post-Deployment

- [ ] Verify deployment URL works
- [ ] Test all features in production
- [ ] Check analytics/monitoring
- [ ] Review error logs
- [ ] Test rollback process
- [ ] Update documentation
- [ ] Notify users of updates

---

## Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

**Deployment Complete! 🚀**

Your 3D Geometric Viewer is now live and ready to use!
