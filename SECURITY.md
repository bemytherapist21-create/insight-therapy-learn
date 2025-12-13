# Security Guidelines

## 🔐 Critical Security Information

### Exposed Credentials - ACTION REQUIRED

**If you've cloned this repository and found exposed API keys:**

1. **IMMEDIATELY ROTATE ALL EXPOSED KEYS:**
   - OpenAI API Key: Rotate at https://platform.openai.com/api-keys
   - Supabase Keys: Rotate at your Supabase project settings
   - Any other service keys that were exposed

2. **Remove .env from Git History:**
   ```bash
   # Using git filter-branch (if you have access)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Or use BFG Repo-Cleaner (recommended)
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/
   bfg --delete-files .env
   ```

3. **Force push (if you have permission):**
   ```bash
   git push origin --force --all
   ```

### Environment Variables

**Never commit `.env` files or hardcode API keys in source code.**

All sensitive credentials should be stored in environment variables:

- **Development**: Use `.env` file (already in `.gitignore`)
- **Production**: Use your hosting platform's environment variable settings
  - Vercel: Project Settings → Environment Variables
  - Supabase: Project Settings → API → Environment Variables

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=your_project_id_here
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_anon_key_here

# OpenAI (for backend/Edge Functions only - NEVER in client code)
OPENAI_API_KEY=your_openai_key_here
```

## 🛡️ Security Best Practices

### 1. API Keys

- ✅ **DO**: Store API keys in environment variables
- ✅ **DO**: Use Supabase Edge Functions for sensitive API calls
- ❌ **DON'T**: Hardcode API keys in source files
- ❌ **DON'T**: Expose API keys in client-side JavaScript
- ❌ **DON'T**: Commit `.env` files to version control

### 2. Content Security Policy (CSP)

The project includes a Content Security Policy in `index.html`. For production:

- Remove `'unsafe-inline'` and `'unsafe-eval'` if possible
- Use nonces or hashes for inline scripts
- Regularly review and tighten CSP rules

### 3. Database Security

- Row Level Security (RLS) is enabled on all tables
- All RLS policies enforce user-specific access
- Anonymous access is disabled (see `security_patch_20251207_fix_anonymous_data.sql`)

### 4. Pre-commit Hooks

The project includes a pre-commit hook that:
- Runs linting and formatting
- Scans for potential secrets in staged files
- Prevents commits with hardcoded credentials

### 5. Authentication

- All user data requires authentication via Supabase Auth
- JWT tokens are used for API authentication
- Session management is handled by Supabase

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security concerns to: [Your security email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact

## 📋 Security Checklist

Before deploying to production:

- [ ] All API keys are in environment variables (not in code)
- [ ] `.env` file is in `.gitignore` and not committed
- [ ] All exposed keys have been rotated
- [ ] RLS policies are enabled and tested
- [ ] CSP headers are configured
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting is implemented
- [ ] Audit logging is enabled
- [ ] Dependencies are up to date (`npm audit`)
- [ ] HTTPS is enforced

## 🔄 Regular Security Maintenance

- **Weekly**: Review dependency vulnerabilities (`npm audit`)
- **Monthly**: Review and rotate API keys
- **Quarterly**: Security audit and penetration testing
- **As needed**: Apply security patches and updates

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [OpenAI API Security](https://platform.openai.com/docs/guides/safety-best-practices)

