# Claude AI Development Guide

## Project Overview
This is the Skyview Academy Cross Country Team website - a static site hosted on AWS S3 with CloudFront CDN for HTTPS. The site provides weekly newsletters, training guides, and team resources for high school cross country athletes and parents.

## Quick Context for AI Assistants

### Primary Purpose
- Weekly newsletter distribution to team families
- Training resource hub (Jack Daniels methodology)
- Race results tracking
- Team communication gateway (via TeamSnap integration)

### Technical Stack
- **Frontend**: Pure HTML/CSS (no framework - intentionally simple for maintainability)
- **Hosting**: AWS S3 static website
- **CDN/HTTPS**: AWS CloudFront
- **Deployment**: Bash scripts with AWS CLI
- **Version Control**: Git/GitHub

## Key Commands

```bash
# Local development
python3 -m http.server 8000  # View at http://localhost:8000

# Deploy to AWS
npm run deploy-s3  # or: sh scripts/deploy-s3.sh

# Git operations
git add .
git commit -m "Your message"
git push
```

## Project Structure

```
skyview-xc-team/
├── newsletters/           # Weekly newsletter HTML files
│   └── week4-newsletter.html
├── scripts/              # Deployment and build scripts
│   ├── deploy-s3.sh     # AWS S3/CloudFront deployment
│   └── build.sh         # Build preparation script
├── index.html           # Main landing page
├── training-level-guide.html  # JV vs Varsity selection guide
├── daniels-method-guide.html  # Jack Daniels training explanation
├── training.html        # Training pace calculator
├── results.html         # Race results page
├── package.json         # NPM scripts wrapper
├── .env.example         # Environment variable template
└── CLAUDE.md           # This file - AI assistant guide

## Important URLs

- **Live Site (HTTPS)**: https://d9mvm5wuesb39.cloudfront.net
- **S3 Direct**: http://skyview-xc-team.s3-website-us-east-1.amazonaws.com
- **GitHub**: https://github.com/brycecjohnson/xc-website

## Development Guidelines for AI

### When Adding New Features

1. **New Newsletter**:
   - Copy existing newsletter as template
   - Maintain consistent styling (gradients, cards, colors)
   - Add to newsletters/ folder with naming: `week#-newsletter.html`
   - Update index.html with new link

2. **New Quick Link/Resource**:
   - Create standalone HTML file in root
   - Include back navigation to index.html
   - Use existing color scheme (primary: #667eea, secondary: #764ba2)
   - Add link card to index.html

3. **Style Consistency**:
   - Headers: Purple gradient (#667eea to #764ba2)
   - Info boxes: Light backgrounds (#f8f9fa, #fff3cd, #d1ecf1)
   - Cards: White background with colored left border
   - Mobile responsive: Include media queries

### AWS Configuration

**Environment Variables** (defaults in scripts, can override):
- `BUCKET_NAME`: skyview-xc-team
- `AWS_REGION`: us-east-1
- `CLOUDFRONT_DISTRIBUTION_ID`: E31P5TNTOVU0J5
- `CLOUDFRONT_DOMAIN`: d9mvm5wuesb39.cloudfront.net

**Required AWS Permissions**:
- S3FullAccess (bucket operations)
- CloudFrontFullAccess (CDN management)
- IAMReadOnlyAccess (permission checking)

### Code Style Preferences

1. **HTML Structure**:
   - Use semantic HTML5 elements
   - Include inline CSS for simplicity (no build process)
   - Mobile-first responsive design

2. **Comments**:
   - Add section markers in HTML: `<!-- Weekly Newsletters Section -->`
   - Document any AWS-specific configurations
   - Explain training methodology references

3. **File Naming**:
   - Lowercase with hyphens: `training-guide.html`
   - Newsletters: `week#-newsletter.html`
   - Scripts: `.sh` extension with executable permissions

## Common Tasks

### Add Week 5 Newsletter
```bash
# 1. Create new newsletter file
cp newsletters/week4-newsletter.html newsletters/week5-newsletter.html
# 2. Edit content in week5-newsletter.html
# 3. Add link to index.html
# 4. Deploy
npm run deploy-s3
```

### Update Race Results
```bash
# Edit results.html with new race link
# Deploy changes
npm run deploy-s3
```

### Test Before Deploying
```bash
# Start local server
python3 -m http.server 8000
# View at http://localhost:8000
# Test all links and navigation
```

## Training Content Guidelines

### Jack Daniels Methodology
The site follows Jack Daniels' scientific training approach:
- **E (Easy)**: Recovery/aerobic base
- **T (Threshold)**: Lactate threshold
- **I (Interval)**: VO2 max
- **R (Repetition)**: Speed/economy
- **LR (Long Run)**: Endurance

When updating training content, maintain consistency with these zones.

### Team Levels
- **Varsity**: Can run 5-6 miles continuously, faster 5K times
- **JV**: Building base, newer runners, slower 5K times
- Always provide both workout options in newsletters

## Troubleshooting

### Local Development Issues
- Port 8000 in use: Try `python3 -m http.server 8001`
- Can't see changes: Hard refresh (Cmd+Shift+R)

### AWS Deployment Issues
- CloudFront not updating: Cache invalidation takes 5-15 minutes
- Permission denied: Check AWS CLI configuration with `aws configure list`
- Bucket policy errors: Ensure public access is enabled in S3

## Future Enhancement Ideas

1. **Newsletter Archive**: Paginated list of all past newsletters
2. **Athlete Portal**: Personal best tracking, workout logging
3. **Photo Gallery**: Race and team photos
4. **Calendar Integration**: Direct TeamSnap calendar embed
5. **Email Subscription**: Newsletter signup with AWS SES
6. **Search Function**: Find specific workouts or articles
7. **Mobile App**: PWA version for offline access

## AI Assistant Notes

When working on this project:
1. Preserve the simple, maintainable architecture
2. Avoid adding complex build processes or frameworks
3. Test locally before deploying
4. Keep AWS costs minimal (currently ~$0.10/month)
5. Maintain the encouraging, supportive tone in all content
6. Remember the audience: high school athletes and their parents

## Contact & Context

- **Team**: Skyview Academy Hawks (Colorado)
- **Season**: Cross Country (Fall)
- **Method**: Jack Daniels Running Formula
- **Primary User**: Coach (Bryce's wife)
- **Deployment**: Via Bryce's AWS account

---

*Last Updated: August 2025*
*For questions about the codebase, reference this guide first, then check README.md for deployment details.*