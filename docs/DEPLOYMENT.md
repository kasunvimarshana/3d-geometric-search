# Deployment Guide

## Quick Deployment Steps

### 1. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 2. Preview Production Build Locally

```bash
npm run preview
```

Test the production build locally before deployment.

### 3. Deploy to Hosting Provider

Choose one of the following deployment options:

## Deployment Options

### Netlify

#### Option 1: Drag and Drop

1. Run `npm run build`
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder onto the page

#### Option 2: CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 3: Git Integration

1. Push code to GitHub
2. Connect repository in Netlify dashboard
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Vercel

#### Option 1: CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 2: Git Integration

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Build settings auto-detected (Vite)

### GitHub Pages

#### Using GitHub Actions

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Enable GitHub Pages in repository settings
3. Push to main branch

### Azure Static Web Apps

```bash
# Install Azure CLI
npm install -g @azure/static-web-apps-cli

# Login to Azure
az login

# Deploy
swa deploy --app-location . --output-location dist
```

### AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Docker

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

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t 3d-model-viewer .

# Run container
docker run -d -p 8080:80 3d-model-viewer
```

## Environment Configuration

### Base URL Configuration

If deploying to a subdirectory, update `vite.config.js`:

```javascript
export default {
  base: '/your-subdirectory/',
  // ... rest of config
};
```

### Environment Variables

Create `.env.production`:

```env
VITE_APP_TITLE=3D Model Viewer
VITE_API_URL=https://api.example.com
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Pre-deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build locally (`npm run preview`)
- [ ] No console errors
- [ ] All features working
- [ ] Performance acceptable (Lighthouse score)
- [ ] SEO metadata added (if public)
- [ ] Analytics configured (if needed)
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)

## Post-deployment Tasks

### 1. Verify Deployment

- [ ] Site loads without errors
- [ ] All pages accessible
- [ ] Static assets load
- [ ] Models load correctly
- [ ] No mixed content warnings

### 2. Performance Monitoring

- Run Lighthouse audit
- Check Core Web Vitals
- Monitor bundle size
- Track load times

### 3. Set Up Monitoring

- Configure uptime monitoring
- Set up error tracking (Sentry, Rollbar)
- Enable analytics (Google Analytics, Plausible)
- Set up performance monitoring (New Relic, DataDog)

### 4. Security

- Configure security headers
- Enable HTTPS
- Set up CSP (Content Security Policy)
- Configure CORS if needed

## Optimization Tips

### 1. Asset Optimization

```bash
# Optimize images (if any)
npm install -D vite-plugin-imagemin

# Add to vite.config.js
import viteImagemin from 'vite-plugin-imagemin';

export default {
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: { plugins: [{ removeViewBox: false }] }
    })
  ]
}
```

### 2. Bundle Analysis

```bash
# Install bundle analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({ open: true })
  ]
}

# Build and view bundle analysis
npm run build
```

### 3. Code Splitting

```javascript
// Lazy load components
const HeavyComponent = () => import('./components/HeavyComponent.js');

// Use dynamic imports for routes
const routes = [{ path: '/viewer', component: () => import('./pages/Viewer.js') }];
```

### 4. Compression

Enable Brotli/Gzip compression:

```bash
npm install -D vite-plugin-compression

# vite.config.js
import viteCompression from 'vite-plugin-compression';

export default {
  plugins: [
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
}
```

## Troubleshooting

### Build Fails

- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Review build logs for errors
- Verify all dependencies installed

### Assets Not Loading

- Check base URL configuration
- Verify asset paths
- Check browser console for 404s
- Review build output structure

### Performance Issues

- Analyze bundle size
- Check for large dependencies
- Optimize assets
- Enable compression
- Use CDN for static assets

### CORS Issues

- Configure server CORS headers
- Use proxy in development
- Check API endpoints

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Rollback Strategy

### Quick Rollback

1. Keep previous deployment tagged
2. Use hosting provider's rollback feature
3. Or redeploy previous git commit

### Git-based Rollback

```bash
# Find previous working commit
git log --oneline

# Revert to previous version
git revert <commit-hash>

# Or reset (use with caution)
git reset --hard <commit-hash>

# Force push
git push -f origin main
```

## Scaling Considerations

### CDN Integration

- Use CloudFlare, Fastly, or AWS CloudFront
- Cache static assets aggressively
- Enable HTTP/2 or HTTP/3
- Use edge locations

### Load Balancing

- Use multiple instances if needed
- Implement health checks
- Configure auto-scaling

### Monitoring

- Set up alerts for downtime
- Monitor error rates
- Track performance metrics
- Review logs regularly

---

**For production deployments, always test thoroughly and have a rollback plan ready.**
