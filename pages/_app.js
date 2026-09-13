import "../styles/globals.css";
import { useRouter } from "next/router";
import { ParallaxProvider } from "react-scroll-parallax";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { siteConfig } from "../config/site";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const gaId = pageProps?.settings?.gaId || siteConfig.gaId;
  const isAdmin = router.pathname.startsWith("/admin");

  return (
    <SessionProvider session={session}>
      {gaId && !isAdmin && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={reduceMotion ? false : "initialState"}
          animate="animateState"
          exit={reduceMotion ? undefined : "exitState"}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
          variants={{
            initialState: { opacity: 0 },
            animateState: { opacity: 1 },
            exitState: { opacity: 0 },
          }}
        >
          {isAdmin ? (
            <Component {...pageProps} />
          ) : (
            <ParallaxProvider>
              <Component {...pageProps} />
            </ParallaxProvider>
          )}
        </motion.div>
      </AnimatePresence>
    </SessionProvider>
  );
}

export default MyApp;
