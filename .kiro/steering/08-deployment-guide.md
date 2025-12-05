---
inclusion: manual
---

# Deployment Guide

## Deployment Platform: Vercel

Vercel is the recommended platform for deploying The Spirit Box because:

1. **Zero-config** for Vite projects
2. **Serverless Functions** for API routes (`/api/chat`, `/api/tts`)
3. **Edge Network** for fast global delivery
4. **Environment Variables** management
5. **Free tier** sufficient for hackathon demos

## Pre-Deployment Checklist

### 1. Security Audit

- [ ] Remove all API keys from code
- [ ] Verify `.env` is in `.gitignore`
- [ ] Check git history for leaked secrets
- [ ] Regenerate any exposed API keys

```bash
# Check if .env was ever committed
git log --all --full-history --source -- .env

# If found, remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### 2. Build Test

```bash
# Test production build locally
npm run build
npm run preview

# Verify:
# - No build errors
# - App loads at http://localhost:4173
# - All features work
```

### 3. Environment Variables

Create `.env.example` for users:

```bash
# .env.example
VITE_NASA_API_KEY=your_nasa_api_key_here

# Server-side only (Vercel)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Vercel Deployment Steps

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variables (see below)
6. Click "Deploy"

## Environment Variables Configuration

### Vercel Dashboard

1. Go to Project Settings → Environment Variables
2. Add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | Production, Preview |
| `VITE_NASA_API_KEY` | `your_key` | Production, Preview, Development |

**Important:**
- `OPENAI_API_KEY` (no `VITE_` prefix) - Server-side only
- `VITE_NASA_API_KEY` (with `VITE_` prefix) - Client-side accessible

### Vercel CLI

```bash
# Add environment variables via CLI
vercel env add OPENAI_API_KEY production
vercel env add VITE_NASA_API_KEY production
```

## API Routes Configuration

### File Structure

```
api/
├── chat.ts       # OpenAI Chat Completions
└── tts.ts        # OpenAI Text-to-Speech
```

### Vercel Serverless Function

```typescript
// api/chat.ts
export const config = {
  runtime: 'edge', // Use Edge Runtime for low latency
};

export default async function handler(req: Request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers });
  }

  try {
    const { messages, max_tokens, temperature } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { headers });
  } catch (error) {
    console.error('[API] Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Service unavailable' }),
      { status: 500, headers }
    );
  }
}
```

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `spirit-box.yourdomain.com`)
3. Configure DNS:
   - **Type:** CNAME
   - **Name:** `spirit-box`
   - **Value:** `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)

## Performance Optimization

### Build Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'audio': ['./src/audio/AudioGraphManager'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
  },
});
```

### Asset Optimization

```bash
# Optimize images (if any)
npm install -D vite-plugin-imagemin

# Add to vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

plugins: [
  viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    optipng: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    pngquant: { quality: [0.8, 0.9] },
    svgo: { plugins: [{ name: 'removeViewBox' }] },
  }),
]
```

## Monitoring

### Vercel Analytics

Enable in Project Settings → Analytics:
- **Web Vitals:** Core Web Vitals tracking
- **Audience:** User demographics
- **Speed Insights:** Performance metrics

### Custom Logging

```typescript
// Log to Vercel
console.log('[Spirit Box] Session started');
console.error('[Spirit Box] Error:', error);

// View logs
vercel logs [deployment-url]
```

## Troubleshooting

### Build Fails

**Error:** `Module not found`
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error:** `TypeScript errors`
```bash
# Check types
npm run build -- --mode development
```

### API Routes Not Working

**Error:** `404 on /api/chat`

1. Verify file is at `api/chat.ts` (not `src/api/`)
2. Check Vercel Functions tab in dashboard
3. Ensure `export default` is used

**Error:** `500 Internal Server Error`

1. Check Vercel logs: `vercel logs`
2. Verify environment variables are set
3. Test API key manually:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

### Environment Variables Not Working

**Error:** `undefined` in client code

- Client-side vars MUST have `VITE_` prefix
- Rebuild after adding vars: `vercel --prod`

**Error:** `undefined` in API routes

- Server-side vars MUST NOT have `VITE_` prefix
- Redeploy after adding vars

### Audio Not Playing

**Error:** `AudioContext suspended`

- Ensure user gesture (click) before audio
- Check browser console for autoplay policy errors

### CORS Errors

**Error:** `Access-Control-Allow-Origin`

- Add CORS headers to API routes (see above)
- Verify `Access-Control-Allow-Origin: *` in response

## Rollback

### Revert to Previous Deployment

```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote [deployment-url]
```

### Via Dashboard

1. Go to Deployments tab
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

## Post-Deployment Testing

### Smoke Tests

- [ ] App loads without errors
- [ ] START SESSION button works
- [ ] Audio plays (white noise)
- [ ] Speech recognition works
- [ ] Ghost responds to questions
- [ ] Entropy gate functions (test low/high entropy)
- [ ] Manifestation effect triggers
- [ ] All API routes respond

### Performance Tests

```bash
# Lighthouse audit
npx lighthouse https://your-app.vercel.app --view

# Target scores:
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

## Deployment URL

After deployment, you'll receive:

- **Production:** `https://spirit-box.vercel.app`
- **Preview:** `https://spirit-box-[hash].vercel.app` (per commit)

Add production URL to:
- `SUBMISSION.md`
- `README.md`
- Hackathon submission form

## Cost Estimation

### Vercel Free Tier

- **Bandwidth:** 100 GB/month
- **Serverless Function Executions:** 100 GB-hours
- **Edge Function Executions:** 500k requests

**Estimated Usage (Hackathon):**
- ~1000 sessions
- ~5000 API calls
- ~10 GB bandwidth

**Cost:** $0 (within free tier)

### OpenAI API Costs

**GPT-4o-mini:**
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

**TTS:**
- $15.00 / 1M characters

**Estimated Cost (1000 sessions):**
- LLM: ~$0.50
- TTS: ~$0.30
- **Total:** ~$0.80

### NASA API

**Free** (no cost)

## Backup Strategy

### Database Backup (if added later)

```bash
# Export data
vercel env pull .env.production
# ... backup logic ...
```

### Code Backup

```bash
# Tag release
git tag -a v1.0.0 -m "Hackathon submission"
git push origin v1.0.0
```

## Scaling Considerations

If traffic increases:

1. **Upgrade Vercel Plan:** Pro ($20/month)
2. **Add Caching:** Cache NASA API responses
3. **Rate Limiting:** Implement per-IP limits
4. **CDN:** Vercel Edge Network (automatic)

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Discord:** https://vercel.com/discord
- **Status Page:** https://vercel-status.com
