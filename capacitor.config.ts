// Capacitor configuration — used for mobile builds only, not included in Next.js compilation
// Run: npx cap sync, npx cap open ios, npx cap open android

const config = {
  appId: "no.helkrypt.mindbridge",
  appName: "MindBridge",
  webDir: "out",
  server: {
    androidScheme: "https" as const,
  },
};

export default config;
