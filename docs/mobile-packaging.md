# MindBridge — Mobile Packaging Guide (Capacitor)

## Prerequisites
- Node.js 18+
- Xcode 15+ (iOS)
- Android Studio (Android)
- Java 17+

## Build steps

### 1. Export static Next.js build
```bash
npm run build
# This generates the `out/` directory (output: 'export' in next.config.ts)
```

### 2. Sync Capacitor
```bash
npx cap sync
```

### 3. iOS
```bash
npx cap open ios
# In Xcode: Product → Archive → Distribute App
```

### 4. Android
```bash
npx cap open android
# In Android Studio: Build → Generate Signed Bundle / APK
```

## next.config.ts for static export
Add `output: 'export'` when building for Capacitor:
```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
```

## Notes
- API routes are not available in static export mode — for mobile, backend calls must go to your deployed Vercel URL
- Set `server.url` in `capacitor.config.ts` to your production Vercel URL for live API access
- Test thoroughly on simulators before submitting to App Store / Play Store
