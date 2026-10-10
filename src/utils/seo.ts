import { SEOSettings } from '../types';

export const defaultSeoSettings: SEOSettings = {
  metaTitle: 'Trek Consultancy Forum - Discussion Community & Support Portal',
  titleSeparator: ' - ',
  metaDescription: 'The official community discussion forum and enterprise services portal for Trek Consultancy. Expert advisory in Saudi business setup, custom software, visas, and corporate compliance.',
  metaKeywords: 'Trek Consultancy, Saudi business setup, MISA investment license, Commercial Registration CR, custom software ERP, corporate compliance, Riyadh advisory, Saudi Arabia company formation',
  canonicalUrl: 'https://trekconsultancy.com',
  siteName: 'Trek Consultancy Forum',
  robotsIndex: true,
  robotsFollow: true,
  ogTitle: 'Trek Consultancy Forum - Discussion Community & Support Portal',
  ogDescription: 'The official community discussion forum and enterprise services portal for Trek Consultancy. Connecting developers, entrepreneurs, and senior advisors.',
  ogImage: '/trek-logo.webp',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@trekconsultancy',
  twitterCreator: '@trekconsultancy',
  googleSiteVerification: '',
  bingSiteVerification: '',
  organizationName: 'Trek Consultancy',
  organizationLogo: '/trek-logo.webp',
  contactEmail: 'support@trekconsultancy.com',
  contactPhone: '+966 50 000 0000',
  customHeadTags: ''
};

function upsertMeta(nameOrProperty: string, value: string, isProperty = false) {
  if (typeof document === 'undefined') return;
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`) as HTMLMetaElement | null;
  if (!value) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProperty);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function upsertLink(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function applySeoToDocument(seo: SEOSettings) {
  if (typeof document === 'undefined') return;

  // 1. Document Title
  if (seo.metaTitle) {
    document.title = seo.metaTitle;
  }

  // 2. Standard Meta Tags
  upsertMeta('description', seo.metaDescription || '');
  upsertMeta('keywords', seo.metaKeywords || '');

  // 3. Robots directive
  const robotsDirective = `${seo.robotsIndex ? 'index' : 'noindex'}, ${seo.robotsFollow ? 'follow' : 'nofollow'}`;
  upsertMeta('robots', robotsDirective);

  // 4. Canonical URL
  upsertLink('canonical', seo.canonicalUrl || '');

  // 5. Open Graph Meta Tags (Facebook, LinkedIn, WhatsApp, etc.)
  upsertMeta('og:title', seo.ogTitle || seo.metaTitle || '', true);
  upsertMeta('og:description', seo.ogDescription || seo.metaDescription || '', true);
  upsertMeta('og:site_name', seo.siteName || 'Trek Consultancy Forum', true);
  upsertMeta('og:type', seo.ogType || 'website', true);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : (seo.canonicalUrl || '');
  upsertMeta('og:url', seo.canonicalUrl || currentUrl, true);

  // Format OG Image as absolute URL
  if (seo.ogImage && typeof window !== 'undefined') {
    const fullImgUrl = seo.ogImage.startsWith('http')
      ? seo.ogImage
      : `${window.location.origin}${seo.ogImage.startsWith('/') ? '' : '/'}${seo.ogImage}`;
    upsertMeta('og:image', fullImgUrl, true);
    upsertMeta('twitter:image', fullImgUrl);
  }

  // 6. Twitter Card Tags
  upsertMeta('twitter:card', seo.twitterCard || 'summary_large_image');
  upsertMeta('twitter:title', seo.ogTitle || seo.metaTitle || '');
  upsertMeta('twitter:description', seo.ogDescription || seo.metaDescription || '');
  if (seo.twitterSite) upsertMeta('twitter:site', seo.twitterSite);
  if (seo.twitterCreator) upsertMeta('twitter:creator', seo.twitterCreator);

  // 7. Search Console & Webmaster Verification
  upsertMeta('google-site-verification', seo.googleSiteVerification || '');
  upsertMeta('msvalidate.01', seo.bingSiteVerification || '');

  // 8. Structured Data: JSON-LD Schema (Organization & WebSite)
  let scriptEl = document.getElementById('trek-jsonld-schema') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'trek-jsonld-schema';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const origin = seo.canonicalUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://trekconsultancy.com');
  const logoUrl = seo.organizationLogo?.startsWith('http')
    ? seo.organizationLogo
    : `${origin}${seo.organizationLogo?.startsWith('/') ? '' : '/'}${seo.organizationLogo || 'trek-logo.webp'}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: seo.organizationName || 'Trek Consultancy',
        url: origin,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: seo.contactPhone || undefined,
            email: seo.contactEmail || undefined,
            contactType: 'customer support',
            areaServed: ['SA', 'AE', 'US', 'GB', 'BD'],
            availableLanguage: ['en', 'bn', 'ar']
          }
        ]
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: seo.siteName || 'Trek Consultancy Forum',
        description: seo.metaDescription,
        publisher: {
          '@id': `${origin}/#organization`
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${origin}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  scriptEl.textContent = JSON.stringify(jsonLd);
}
