# Deployment and Version Control Guide

## 1. Setting Up Version Control with GitHub

### Connect to GitHub
1. In Lovable, click the **GitHub** button in the top right
2. Click **"Connect to GitHub"**
3. Authorize the Lovable GitHub App
4. Select your GitHub account/organization
5. Click **"Create Repository"** to generate a new repo with your code

### Benefits of GitHub Integration
- **Bidirectional Sync**: Changes in Lovable automatically push to GitHub, and GitHub changes sync to Lovable
- **Real-time Sync**: No manual pulls/pushes required
- **Version History**: Access to Git history alongside Lovable's built-in version control
- **Collaboration**: Team members can work in both environments

## 2. Hosting Options

### Option A: Lovable Hosting (Recommended for Quick Setup)
1. Click **"Publish"** button in the top right of Lovable
2. Your app will be available at `yourapp.lovable.app`
3. For custom domains:
   - Go to Project > Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions
   - **Note**: Paid plan required for custom domains

### Option B: External Hosting (Netlify/Vercel)

#### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Deploy

#### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables (same as Netlify)
6. Deploy

## 3. Environment Variables Setup

### Production Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Production-specific settings
VITE_APP_ENV=production
```

### Supabase Configuration
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon key
4. Add these to your hosting platform's environment variables

## 4. Continuous Integration/Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=dist
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 5. Version Control Best Practices

### Development Workflow
1. **Feature Development**: Create feature branches for new functionality
2. **Testing**: Test changes in Lovable preview before merging
3. **Code Review**: Use GitHub pull requests for code review
4. **Deployment**: Merge to main branch triggers automatic deployment

### Branch Strategy
```bash
main           # Production-ready code
develop        # Development integration branch
feature/*      # Feature branches
hotfix/*       # Emergency fixes
```

### Making Changes
1. **In Lovable**: Changes automatically sync to GitHub
2. **In Local IDE**: 
   - Clone the repository
   - Make changes locally
   - Push to GitHub
   - Changes sync back to Lovable

## 6. Monitoring and Maintenance

### Application Monitoring
- **Supabase Dashboard**: Monitor database performance and usage
- **Hosting Platform**: Check deployment status and performance
- **Error Tracking**: Consider adding Sentry or similar for error monitoring

### Regular Maintenance
- **Database Backups**: Supabase provides automatic backups
- **Dependency Updates**: Regularly update packages for security
- **Performance Monitoring**: Monitor Core Web Vitals and user experience

## 7. Enhancement Workflow

### Adding New Features
1. **Planning**: Discuss features in GitHub issues
2. **Development**: 
   - Create feature branch
   - Develop in Lovable (syncs to GitHub)
   - Test thoroughly
3. **Review**: Create pull request for code review
4. **Deployment**: Merge to main for automatic deployment

### Database Changes
1. **Development**: Test database changes in Lovable
2. **Migration**: Document database migrations
3. **Production**: Apply migrations to production database
4. **Verification**: Test changes in production

## 8. Troubleshooting Common Issues

### Build Failures
- Check environment variables are set correctly
- Verify all dependencies are included in package.json
- Check for TypeScript errors

### Database Issues
- Verify Supabase connection string and keys
- Check Row Level Security (RLS) policies
- Monitor Supabase logs for errors

### Deployment Issues
- Check build logs for errors
- Verify environment variables
- Test locally with production build (`npm run build && npm run preview`)

## 9. Security Considerations

### Environment Variables
- Never commit sensitive keys to version control
- Use environment variables for all configuration
- Rotate keys regularly

### Database Security
- Review RLS policies regularly
- Monitor for unusual database activity
- Keep Supabase updated

### Application Security
- Keep dependencies updated
- Use HTTPS in production
- Implement proper authentication flows

## Quick Start Checklist

- [ ] Connect GitHub repository
- [ ] Set up hosting platform (Netlify/Vercel)
- [ ] Configure environment variables
- [ ] Test deployment
- [ ] Set up custom domain (if needed)
- [ ] Configure CI/CD pipeline
- [ ] Document deployment process
- [ ] Set up monitoring
- [ ] Create backup strategy
- [ ] Plan enhancement workflow