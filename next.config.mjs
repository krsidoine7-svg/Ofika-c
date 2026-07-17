/** @type {import('next').NextConfig} */
const nextConfig = {
  // =====================================================
  // CONFIGURATION DE QUALITÉ ET SÉCURITÉ
  // =====================================================

  eslint: {
    ignoreDuringBuilds: false,
  },
  // Use flat ESLint config
  serverExternalPackages: [],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'zod',
      'date-fns',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip'
    ],
  },

  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // =====================================================
  // CONFIGURATION IMAGES OPTIMISÉE
  // =====================================================

  images: {
    // ⚠️ ATTENTION: unoptimized=true peut causer des problèmes de performance
    // À utiliser seulement si nécessaire pour le déploiement
    unoptimized: process.env.NODE_ENV !== 'production',
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com', // Google OAuth
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24h
    dangerouslyAllowSVG: false, // Sécurité: pas de SVG arbitraire
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // =====================================================
  // CONFIGURATION EXPERIMENTALE
  // =====================================================

  // experimental: {
  //   // Temporairement désactivé pour éviter les erreurs de build
  //   optimizePackageImports: ['lucide-react', 'zod'],
  //   turbo: {
  //     rules: {
  //       '*.svg': {
  //         loaders: ['@svgr/webpack'],
  //         as: '*.js',
  //       },
  //     },
  //   },
  // },

  // =====================================================
  // OPTIMISATIONS DE PERFORMANCE
  // =====================================================

  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'] // Garder error et warn pour le monitoring
    } : false,
  },

  // Compression et optimisation
  compress: true,

  // =====================================================
  // CONFIGURATION WEBPACK SIMPLIFIÉE
  // =====================================================

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Sécurité: Ne pas exposer les variables sensibles côté client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }

    return config
  },

  // =====================================================
  // HEADERS DE SÉCURITÉ (REMPLACÉS PAR MIDDLEWARE)
  // =====================================================

  // ❌ REMOVED: Headers de sécurité dupliqués avec middleware.ts
  // Tous les headers de sécurité sont maintenant gérés par le middleware
  // pour une meilleure performance et cohérence

  // =====================================================
  // CONFIGURATION DE DÉPLOIEMENT
  // =====================================================

  // Variables d'environnement validées
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // NE PAS exposer les clés secrètes côté client
    // SUPABASE_SERVICE_ROLE_KEY et autres clés privées restent server-side only
  },

  // Configuration des rewrites pour l'API (si nécessaire)
  rewrites: async () => {
    return []
  },

  // Forcer le rendu dynamique pour les routes qui utilisent des cookies/headers
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },

  // Configuration des redirects
  redirects: async () => {
    return [
      // Redirections de sécurité
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/wp-admin',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/wp-login',
        destination: '/404',
        permanent: false,
      },
    ]
  },

  // Gestion des pages d'erreur personnalisées
  // Augmenté pour éviter les ChunkLoadError (timeouts de recompilation sur Windows)
  onDemandEntries: {
    maxInactiveAge: 15 * 60 * 1000, // 15 minutes
    pagesBufferLength: 5,
  },

  // Headers pour forcer le rendu dynamique des routes API
  async headers() {
    return [
      {
        // Appliquer à toutes les routes API
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'x-nextjs-cache',
            value: 'no-cache',
          },
        ],
      },
    ]
  },
}

export default nextConfig
