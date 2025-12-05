---
inclusion: always
---

# Security Best Practices

## API Key Protection

### CRITICAL: Never Expose Keys in Client Code

**WRONG:**
```typescript
// ❌ NEVER DO THIS - Exposes key in browser
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
  }
});
```

**CORRECT:**
```typescript
// ✅ Use server-side API routes
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages }),
});
```

### Server-Side API Routes

All API calls must go through backend routes:

```
/api/chat  → OpenAI Chat Completions
/api/tts   → OpenAI Text-to-Speech
```

**Implementation (Vercel Serverless Functions):**

```typescript
// api/chat.ts
export default async function handler(req: Request) {
  const { messages, max_tokens, temperature } = await req.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Server-side only
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens,
      temperature,
    }),
  });

  return new Response(await response.text(), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Environment Variables

#### Development (.env)

```bash
# .env (NEVER commit this file)
VITE_OPENAI_API_KEY=sk-...
VITE_NASA_API_KEY=...

# Server-side only (no VITE_ prefix)
OPENAI_API_KEY=sk-...
```

#### Production (Vercel)

Set environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `OPENAI_API_KEY` (server-side)
3. Add `VITE_NASA_API_KEY` (client-side, less sensitive)

### .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.production

# Never commit these
*.key
*.pem
secrets/
```

**Verify:**
```bash
git log --all --full-history --source -- .env
```

If `.env` was committed, **regenerate all API keys immediately**.

## Input Validation

### User Input Sanitization

```typescript
function sanitizeUserInput(input: string): string {
  // Remove excessive whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  return sanitized;
}

// Usage
const userQuestion = sanitizeUserInput(rawInput);
```

### Prevent Prompt Injection

```typescript
// CORRECT: Clearly separate user input from system prompt
const messages = [
  { role: 'system', content: GHOST_PERSONA },
  { role: 'user', content: `Question: "${userQuestion}"` }, // Quoted
];

// WRONG: Concatenating user input into system prompt
const prompt = `${GHOST_PERSONA}\n\nUser says: ${userQuestion}`; // ❌ Injection risk
```

## Rate Limiting

### Client-Side Throttling

```typescript
class RateLimiter {
  private lastCall = 0;
  private readonly minInterval = 2000; // 2 seconds

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastCall = Date.now();
    return await fn();
  }
}

// Usage
const rateLimiter = new RateLimiter();
await rateLimiter.throttle(() => llmService.generateResponse(question));
```

### Server-Side Rate Limiting

```typescript
// api/chat.ts
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  
  // Remove requests older than 1 minute
  const recentRequests = requests.filter((time) => now - time < 60000);
  
  if (recentRequests.length >= 10) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}
```

## Content Security Policy

### index.html

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.nasa.gov;
  img-src 'self' data:;
">
```

**Explanation:**
- `default-src 'self'`: Only load resources from same origin
- `connect-src`: Allow API calls to NASA (client-side)
- `script-src 'unsafe-inline'`: Required for Vite dev mode (remove in production)

## CORS Configuration

### API Routes

```typescript
// api/chat.ts
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // ... API logic ...

  return new Response(data, { headers });
}
```

## Error Messages

### Don't Leak Sensitive Information

```typescript
// WRONG: Exposes internal details
catch (error) {
  return { error: error.message }; // ❌ May leak API keys, paths
}

// CORRECT: Generic error messages
catch (error) {
  console.error('[Spirit Box] Internal error:', error); // Log server-side
  return { error: 'Service temporarily unavailable' }; // Generic client message
}
```

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

### Lock File

**Always commit `package-lock.json`** to ensure consistent dependency versions.

## XSS Prevention

### React Automatic Escaping

React automatically escapes content in JSX:

```typescript
// SAFE: React escapes HTML
<div>{userInput}</div>

// DANGEROUS: Bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // ❌ Never use with user input
```

### Sanitize HTML (if needed)

```typescript
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);
```

## Secure Audio Handling

### Validate Audio Buffers

```typescript
async function decodeAudioSafely(
  arrayBuffer: ArrayBuffer,
  audioContext: AudioContext
): Promise<AudioBuffer | null> {
  try {
    // Validate size (prevent memory exhaustion)
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Audio file too large');
    }

    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('[Spirit Box] Invalid audio data:', error);
    return null;
  }
}
```

## NASA API Key Exposure

### Client-Side NASA API is OK

**NASA API key can be exposed client-side** because:
1. It's free and rate-limited per IP
2. No sensitive data is accessed
3. Worst case: Someone uses your quota

**Still, prefer server-side for production:**

```typescript
// api/nasa.ts
export default async function handler(req: Request) {
  const response = await fetch(
    `https://api.nasa.gov/DONKI/GST?api_key=${process.env.NASA_API_KEY}`
  );
  return new Response(await response.text());
}
```

## Logging Best Practices

### Don't Log Sensitive Data

```typescript
// WRONG: Logs API key
console.log('API Key:', process.env.OPENAI_API_KEY); // ❌

// CORRECT: Log without sensitive data
console.log('[Spirit Box] API call successful');

// CORRECT: Log partial identifier for debugging
console.log('[Spirit Box] Using key:', apiKey.substring(0, 8) + '...');
```

## Deployment Checklist

Before deploying:

- [ ] All API keys in environment variables (not code)
- [ ] `.env` in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] API routes use server-side keys only
- [ ] Rate limiting implemented
- [ ] Error messages don't leak info
- [ ] Dependencies updated (`npm audit`)
- [ ] CSP headers configured
- [ ] CORS properly configured

## Incident Response

### If API Key is Exposed

1. **Immediately revoke the key** (OpenAI dashboard)
2. **Generate new key**
3. **Update environment variables** (Vercel, local)
4. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
5. **Force push** (if public repo)
6. **Monitor usage** for unauthorized charges

## Security Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **OpenAI Security Best Practices:** https://platform.openai.com/docs/guides/safety-best-practices
- **Vercel Security:** https://vercel.com/docs/security
