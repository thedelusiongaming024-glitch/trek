import { HeroSettings } from '../types';

export const defaultAdminHeroSettings: HeroSettings = {
  slides: [
    {
      id: 'slide-1791659224239-kiky',
      url: 'https://lh3.googleusercontent.com/d/1FEXdukvgPULuNc4uoTwcHF1EjuW3BG1f',
      title: 'Business in Saudi Arab',
      subtitle: 'Designing scalable, mission-critical platforms with modern resilience.',
      isActive: true
    },
    {
      id: 'slide-1791659279385-erlw',
      url: 'https://lh3.googleusercontent.com/d/1_c3PSuRB80oXLj6cYVg2lUzIGyBiK2a9',
      title: 'Company Registration',
      subtitle: 'Collaborative problem solving with leading senior engineers.',
      isActive: true
    },
    {
      id: 'slide-1791659301001-ey65',
      url: 'https://lh3.googleusercontent.com/d/1G-5SLPgor-BgFGP6e7VAFiGbOSn81tfc',
      title: 'We Are With You',
      subtitle: 'Turnkey solutions for database scaling, APIs, and microservices.',
      isActive: true
    }
  ],
  autoplay: true,
  intervalSeconds: 3,
  overlayOpacity: 0.65,
  overlayGradient: 'violet-dark',
  transitionEffect: 'fade',
  title: 'Welcome to Trek Consultancy Forum',
  subtitle: 'The official community forum and support portal for Trek Consultancy',
  searchPlaceholder: 'Search for Topics, Solutions, & Guides....',
  enableOverlayMesh: true,
  heroHeight: 'tall'
};
