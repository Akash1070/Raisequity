import { useEffect } from 'react';

interface PageMeta {
  title?: string;
  description?: string;
  aiSummary?: string;
  canonicalPath?: string;
  mdAlternate?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

const SITE_URL = 'https://raisequity.com';

function upsertMeta(name: string, content: string): void {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertProperty(prop: string, content: string): void {
  let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', prop);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, attrs: Record<string, string>): void {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.setAttribute('href', href);
}

/**
 * Per-page SEO/meta control for the SPA. Sets title, description,
 * ai-summary, canonical, OpenGraph, the .md alternate link, and optional
 * page-level JSON-LD (Article/FAQ/BreadcrumbList). Never changes layout.
 */
export function usePageMeta(meta: PageMeta = {}): void {
  const jsonLdKey = JSON.stringify(meta.jsonLd ?? null);

  useEffect(() => {
    if (meta.title) document.title = meta.title;
    if (meta.description) upsertMeta('description', meta.description);
    if (meta.aiSummary) upsertMeta('ai-summary', meta.aiSummary);

    const canonicalPath = meta.canonicalPath ?? window.location.pathname;
    upsertLink('canonical', `${SITE_URL}${canonicalPath}`, {});

    if (meta.title) upsertProperty('og:title', meta.title);
    if (meta.description) upsertProperty('og:description', meta.description);

    const mdPath = meta.mdAlternate ?? `${canonicalPath === '/' ? '/index' : canonicalPath}.md`;
    upsertLink('alternate', `${SITE_URL}${mdPath}`, { type: 'text/markdown' });

    if (meta.jsonLd) {
      document.getElementById('page-jsonld')?.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-jsonld';
      script.textContent = jsonLdKey;
      document.head.appendChild(script);
    } else {
      document.getElementById('page-jsonld')?.remove();
    }

    if (meta.noindex) {
      upsertMeta('robots', 'noindex, follow');
    } else {
      const existing = document.querySelector('meta[name="robots"]');
      if (existing && (existing.getAttribute('content') || '').includes('noindex')) existing.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.title, meta.description, meta.aiSummary, meta.canonicalPath, meta.mdAlternate, meta.noindex, jsonLdKey]);
}
