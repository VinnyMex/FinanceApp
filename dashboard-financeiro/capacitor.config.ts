import type { CapacitorConfig } from "@capacitor/cli";

// Configuração do Capacitor para publicação nas lojas Android (Google Play) e iOS (App Store)
// Este arquivo permite embrulhar o PWA em um app nativo usando WebView
//
// PASSOS PARA PUBLICAR:
// 1. npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
// 2. npx cap add android
// 3. npx cap add ios
// 4. npm run build  (gerar build do Next.js)
// 5. npx cap sync   (sincronizar assets)
// 6. npx cap open android  (abrir Android Studio para assinar e publicar)
// 7. npx cap open ios      (abrir Xcode para assinar e publicar)

const config: CapacitorConfig = {
  appId: "com.previsionfinance.app",
  appName: "PrevisionFinance",
  // Em produção: apontar para a URL do app no Vercel (modo remote/live)
  // Em desenvolvimento local: usar servidor Next.js local
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://previsionfinance.vercel.app",
    cleartext: false, // HTTPS obrigatório
    androidScheme: "https",
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#09090b",
    preferredContentMode: "mobile",
  },
  android: {
    backgroundColor: "#09090b",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#09090b",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#09090b",
    },
  },
};

export default config;
