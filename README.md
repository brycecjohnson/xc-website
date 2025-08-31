# Skyview Academy Cross Country Team Website

A simple, affordable static website for the Skyview Academy Cross Country team, featuring weekly newsletters and team resources.

## 📁 Project Structure

```
skyview-xc-team/
├── newsletters/        # Weekly newsletter HTML files
│   └── week4-newsletter.html
├── scripts/           # Deployment scripts
│   ├── deploy-s3.sh   # AWS S3 deployment
│   └── build.sh       # Build script
├── index.html         # Main landing page
├── package.json       # Project scripts
└── README.md         # This file
```

## 🚀 Deployment Options

### Option 1: AWS S3 (Most Affordable - ~$1/month)

**Cost:** ~$0.50-$1.00/month for a small static site

#### Setup Steps:

1. **Install AWS CLI**
   ```bash
   # On Mac
   brew install awscli
   
   # Or download from https://aws.amazon.com/cli/
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and region (us-east-1)
   ```

3. **Deploy to S3**
   ```bash
   npm run deploy-s3
   # or
   sh scripts/deploy-s3.sh
   ```

4. **Your site will be available at:**
   - Main site: `http://skyview-xc-team.s3-website-us-east-1.amazonaws.com`
   - Newsletter: `http://skyview-xc-team.s3-website-us-east-1.amazonaws.com/newsletters/week4-newsletter.html`

#### Optional: Custom Domain
- Purchase domain (~$12/year)
- Use Route 53 or CloudFlare for DNS
- Add CloudFront CDN for HTTPS (free tier available)

### Option 2: GitHub Pages (FREE)

**Cost:** Completely free with a GitHub account

1. **Create GitHub Repository**
   - Go to github.com and create a new repository
   - Name it `skyview-xc-team` or similar

2. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/skyview-xc-team.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to Settings → Pages in your repository
   - Select "Deploy from a branch"
   - Choose "main" branch and "/" (root) folder
   - Click Save

4. **Access your site at:**
   - `https://YOUR_USERNAME.github.io/skyview-xc-team/`

### Option 3: Netlify (FREE with generous limits)

**Cost:** Free for personal projects

1. **Sign up at netlify.com**
2. **Drag and drop your project folder** to deploy
3. **Get instant URL** like `skyview-xc.netlify.app`
4. **Optional:** Connect to GitHub for automatic deployments

### Option 4: Vercel (FREE with generous limits)

Similar to Netlify, just visit vercel.com and follow their deployment guide.

## 💰 Cost Comparison

| Platform | Monthly Cost | Pros | Cons |
|----------|-------------|------|------|
| AWS S3 | ~$1 | Full control, scalable, professional | Requires AWS account, slight learning curve |
| GitHub Pages | FREE | Completely free, version control | Requires GitHub account |
| Netlify | FREE | Easy deployment, great features | Custom domain costs extra |
| Vercel | FREE | Fast, modern platform | Custom domain costs extra |

## 🛠️ Local Development

To preview the site locally:

```bash
# Using Python (usually pre-installed on Mac)
npm run serve
# or
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser
```

## 📝 Adding New Newsletters

1. Create new HTML file in `newsletters/` folder
2. Follow the naming pattern: `week#-newsletter.html`
3. Add link to the newsletter in `index.html`
4. Deploy using your chosen method

## 🔧 Customization

- Edit `index.html` to update the main page
- Modify newsletter templates in `newsletters/`
- Add new sections for:
  - Race results
  - Photo galleries
  - Training resources
  - Team roster
  - Calendar integration

## 📊 Future Enhancements

- Add a simple CMS using Google Sheets + JavaScript
- Integrate with Strava for automatic workout tracking
- Add email newsletter signup
- Create mobile app using PWA technology
- Add race results database
- Implement athlete profiles and PR tracking

## 🆘 Support

For questions about deployment or customization, you can:
- Check AWS S3 documentation: https://docs.aws.amazon.com/s3/
- GitHub Pages docs: https://pages.github.com/
- Ask Claude for help with specific features

## 📄 License

MIT License - Feel free to customize for your team!