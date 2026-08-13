# Deploying Soro on Netlify

This folder is ready to deploy as-is. It contains:

- `index.html` — the Soro app
- `netlify/functions/claude.js` — a serverless function that securely calls
  the Claude API using a server-side API key (never exposed to the browser)
- `netlify.toml` — tells Netlify where the function lives and redirects
  `/api/claude` to it

## Steps

1. **Get an Anthropic API key**
   Sign in at https://console.anthropic.com, go to **API Keys**, and create
   one. Note: this uses your own Anthropic billing — check current pricing
   on the Anthropic site before heavy use.

2. **Push this folder to a GitHub repo**
   Create a new repo on GitHub and upload everything in this folder
   (`index.html`, `netlify.toml`, `netlify/functions/claude.js`).

   Note: functions require a Git-connected deploy — the drag-and-drop
   upload on Netlify's dashboard only publishes static files, it won't pick
   up the function. GitHub is the reliable path here.

3. **Import the repo into Netlify**
   Go to https://app.netlify.com, click **Add new site → Import an existing
   project**, and connect the repo. Build settings can stay at their
   defaults — `netlify.toml` already tells Netlify what to do.

4. **Add your API key as an environment variable**
   In the Netlify site: **Site configuration → Environment variables**
   Add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from step 1

5. **Deploy**
   Trigger a deploy (Netlify usually does this automatically after you add
   the repo, and again after adding the environment variable). You'll get a
   live URL like `your-site.netlify.app`.

That's it — the site is now fully public and the AI features (topic
generation and speech analysis) work through your own backend, with your
API key never exposed in the browser.

## Notes

- Live transcription while speaking uses the Web Speech API, which only
  works in Chromium-based browsers (Chrome, Edge). Safari/Firefox fall back
  to manual transcript entry after the timer ends — this is a browser
  limitation, not something the deploy setup affects.
- If topic generation or analysis ever fails after deploying, check
  **Site → Logs → Functions** in Netlify — it's almost always a missing or
  invalid `ANTHROPIC_API_KEY`.
"# Soro.com" 
