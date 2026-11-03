import { describe, it, expect } from 'vitest';
import { renderMarkdownForRoute, listMarkdownRoutes } from '../lib/md/registry';
import { prefersMarkdown, buildMarkdownResponse } from '../lib/md/http';
import { generateLlmsTxt } from '../lib/md/llms';
import { generateAiTxt } from '../lib/md/ai-txt';

describe('AI Agent Markdown Architecture & Route Coverage', () => {
  // Explicitly inventory all routes in App.tsx
  const ALL_APP_ROUTES = [
    { path: '/', public: true },
    { path: '/founders', public: true },
    { path: '/investors', public: true },
    { path: '/service-providers', public: true },
    { path: '/launch', public: true },
    { path: '/launch/submit', public: true },
    { path: '/blog', public: true },
    { path: '/terms', public: true },
    { path: '/privacy', public: true },
    // Public aliases
    { path: '/about', public: true, aliasOf: '/' },
    { path: '/scouts', public: true, aliasOf: '/founders' },
    { path: '/partnerships', public: true, aliasOf: '/service-providers' },
    { path: '/network', public: true, aliasOf: '/founders' },
    // Authenticated / Private (must return 404 in markdown)
    { path: '/login', public: false, reason: 'Authentication entry' },
    { path: '/onboarding', public: false, reason: 'Founder onboarding wizard' },
    { path: '/investor-onboarding', public: false, reason: 'Investor onboarding wizard' },
    { path: '/dashboard', public: false, reason: 'Founder dashboard root' },
    { path: '/dashboard/feed', public: false, reason: 'Founder feed' },
    { path: '/dashboard/matches', public: false, reason: 'Founder matches' },
    { path: '/dashboard/investors', public: false, reason: 'Founder investor CRM' },
    { path: '/investor-dashboard', public: false, reason: 'Investor dashboard root' },
    { path: '/investor-dashboard/deals', public: false, reason: 'Investor deal feed' },
    { path: '/admin', public: false, reason: 'Admin dashboard' },
    { path: '/checkout', public: false, reason: 'Subscription checkout' },
  ];

  it('renders all public static routes with status 200 and markdown content', async () => {
    const publicRoutes = ALL_APP_ROUTES.filter(r => r.public);

    for (const route of publicRoutes) {
      const res = await renderMarkdownForRoute(route.path);
      expect(res.status, `Route ${route.path} should return HTTP 200`).toBe(200);
      expect(res.markdown.length, `Route ${route.path} should have non-empty markdown`).toBeGreaterThan(100);
      expect(res.markdown.startsWith('# '), `Route ${route.path} markdown should start with h1 heading`).toBe(true);
      expect(res.tokens, `Route ${route.path} should have valid token estimate`).toBeGreaterThan(10);
      expect(res.canonicalUrl.startsWith('https://raisequity.com'), `Canonical should be absolute`).toBe(true);
    }
  });

  it('returns markdown 404 for all private/gated routes', async () => {
    const privateRoutes = ALL_APP_ROUTES.filter(r => !r.public);

    for (const route of privateRoutes) {
      const res = await renderMarkdownForRoute(route.path);
      expect(res.status, `Private route ${route.path} must return 404 in markdown`).toBe(404);
      expect(res.markdown).toContain('404 - Not Found');
    }
  });

  it('returns markdown 404 for non-existent routes', async () => {
    const res = await renderMarkdownForRoute('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.markdown).toContain('404 - Not Found');
  });

  it('generates llms.txt compliant with the llmstxt.org specification', async () => {
    const llms = await generateLlmsTxt();
    expect(llms).toContain('# Raisequity');
    expect(llms).toContain('## Core pages');
    expect(llms).toContain('https://raisequity.com/index.md');
    expect(llms).toContain('https://raisequity.com/founders.md');
    expect(llms).toContain('https://raisequity.com/investors.md');
    expect(llms).toContain('## Machine-readable');
    expect(llms).toContain('https://raisequity.com/llms-full.txt');
    expect(llms).toContain('https://raisequity.com/ai.txt');
  });

  it('generates ai.txt conforming to ai-visibility.org.uk v1.1.1', () => {
    const aiTxt = generateAiTxt();
    expect(aiTxt).toContain('[identity]');
    expect(aiTxt).toContain('name: Raisequity');
    expect(aiTxt).toContain('[permissions]');
    expect(aiTxt).toContain('summarise: allowed');
    expect(aiTxt).toContain('[restrictions]');
    expect(aiTxt).toContain('[scope]');
    expect(aiTxt).toContain('included_paths:');
    expect(aiTxt).toContain('excluded_paths:');
    expect(aiTxt).toContain('[contact]');
  });

  it('correctly negotiates Accept header with q-values', () => {
    // Standard browser / curl
    expect(prefersMarkdown(undefined)).toBe(false);
    expect(prefersMarkdown('')).toBe(false);
    expect(prefersMarkdown('*/*')).toBe(false);
    expect(prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')).toBe(false);

    // AI agent preferring markdown
    expect(prefersMarkdown('text/markdown')).toBe(true);
    expect(prefersMarkdown('text/markdown;q=1.0, text/html;q=0.8')).toBe(true);
    expect(prefersMarkdown('text/html;q=0.8, text/markdown;q=0.9')).toBe(true);

    // Browser preferring HTML over markdown
    expect(prefersMarkdown('text/html;q=1.0, text/markdown;q=0.5')).toBe(false);
  });

  it('attaches all required response headers in buildMarkdownResponse', async () => {
    const res = await renderMarkdownForRoute('/founders');
    const http = buildMarkdownResponse(res, { isNegotiated: true });

    expect(http.headers['Content-Type']).toBe('text/markdown; charset=utf-8');
    expect(http.headers['X-Markdown-Tokens']).toBeDefined();
    expect(http.headers['X-Robots-Tag']).toBe('noindex, follow');
    expect(http.headers['Content-Location']).toBe('https://raisequity.com/founders');
    expect(http.headers['Link']).toContain('rel="canonical"');
    expect(http.headers['Link']).toContain('rel="describedby"');
    expect(http.headers['Vary']).toBe('Accept');
    expect(http.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('provides a catalog of all indexable routes', async () => {
    const catalog = await listMarkdownRoutes();
    expect(catalog.length).toBeGreaterThanOrEqual(9);
    const paths = catalog.map(c => c.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/founders');
    expect(paths).toContain('/investors');
    expect(paths).toContain('/service-providers');
    expect(paths).toContain('/launch');
    expect(paths).toContain('/blog');
  });
});

