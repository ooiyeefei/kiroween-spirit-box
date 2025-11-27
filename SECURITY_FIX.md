# Security Fix: API Key Leak Resolution

## What Happened
The OpenAI API key was exposed because it was using `VITE_OPENAI_API_KEY`, which Vite bundles into client-side JavaScript. Anyone visiting the deployed site could inspect the JavaScript and extract the key.

## What Changed
✅ Created Vercel serverless API routes (`/api/chat` and `/api/tts`)
✅ API key now stays on the server (never sent to browser)
✅ Frontend calls our secure backend, which calls OpenAI
✅ Updated LLMService and TTSService to use new endpoints

## Deployment Steps

### 1. Generate New OpenAI API Key
- Go to https://platform.openai.com/api-keys
- Create a new key (the old one is already disabled)
- Copy the new key

### 2. Update Vercel Environment Variables
In your Vercel dashboard:
- Remove: `VITE_OPENAI_API_KEY` (this was insecure)
- Add: `OPENAI_API_KEY` (without VITE_ prefix - server-side only)
- Set the value to your new OpenAI key

### 3. Update Local .env File
```bash
# Remove this line:
# VITE_OPENAI_API_KEY=sk-...

# Add this line instead:
OPENAI_API_KEY=sk-your-new-key-here
```

### 4. Redeploy
```bash
git add .
git commit -m "🔒 Security fix: Move API key to server-side"
git push
```

Vercel will automatically redeploy with the new secure architecture.

## Verification
After deployment:
1. Open your deployed site
2. Open DevTools → Network tab
3. Trigger a ghost response
4. You should see calls to `/api/chat` and `/api/tts` (your backend)
5. You should NOT see any calls to `api.openai.com` from the browser
6. Search your JavaScript bundle - the API key should NOT be there

## Why This is Secure Now
- ✅ API key is stored as a server-side environment variable
- ✅ Only your Vercel serverless functions can access it
- ✅ Browser never sees the key
- ✅ Even if someone inspects your JavaScript, they won't find it

## For Local Development
The API routes work locally too:
```bash
npm install -g vercel
vercel dev
```

This runs the serverless functions locally at `http://localhost:3000/api/*`
