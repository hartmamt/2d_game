# Deploying Ashen Core to Railway

## Quick Deploy (Recommended)

### Method 1: Railway CLI

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Deploy from this directory**
```bash
railway init
railway up
```

4. **Get your URL**
```bash
railway domain
```

Your game will be live at the provided URL!

### Method 2: GitHub Integration

1. **Push code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Go to [Railway.app](https://railway.app)**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect the configuration

3. **Wait for deployment**
   - Railway will run `npm install && npm run build`
   - Then start with `npm start`
   - You'll get a URL automatically

4. **Add custom domain (optional)**
   - Go to Settings > Domains
   - Add your custom domain

## Environment Variables

Railway automatically sets `PORT`. The app will use it automatically.

Optional variables you can set:
- `NODE_ENV=production` (recommended)

## Troubleshooting

### Build fails
- Check that Node.js version is 18+ in Railway settings
- Ensure all dependencies are in `dependencies`, not `devDependencies` if needed for build

### Game not loading
- Check browser console for errors
- Ensure the server URL is correct
- Check Railway logs: `railway logs`

### Multiplayer not working
- Ensure WebSocket connections are allowed
- Railway supports WebSockets by default
- Check firewall settings if using custom domain

## Architecture

```
Client (Browser)
    ↓
Vite Build → Static Files
    ↓
Express Server (Port from Railway)
    ↓
Socket.io (WebSocket)
    ↓
Game Server Logic
```

## Post-Deployment

After deployment:
1. Test the game by visiting your Railway URL
2. Open in multiple browser tabs to test multiplayer
3. Share the URL with friends to play together!

## Cost

Railway offers:
- Free tier with 500 hours/month
- Perfect for hobby projects and testing
- Scales automatically if you need more

## Monitoring

View logs in real-time:
```bash
railway logs
```

Or check the Railway dashboard for:
- Deployment status
- Resource usage
- Request metrics
- Error logs

---

**Your game is now live! Share the URL and start battling the Ashen Core with friends!**
