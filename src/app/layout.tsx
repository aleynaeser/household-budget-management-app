import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Anonymous_Pro } from 'next/font/google';
import { BackgroundGrid } from '@components/BackgroundGrid';
import * as motion from 'motion/react-client';
import ReactQueryProvider from '@providers/ReactQueryProvider';

import '@styles/globals.css';

export const metadata: Metadata = {
  title: 'Household Budget Management',
  description: 'Household Budget Management App',
};

const anonymousProFont = Anonymous_Pro({
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={anonymousProFont.className}>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' />
        <link rel='apple-touch-icon' sizes='180x180' href='/assets/favicons/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/assets/favicons/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/assets/favicons/favicon-16x16.png' />
        <link rel='manifest' href='/assets/favicons/site.webmanifest' />
        <link rel='mask-icon' href='/assets/favicons/safari-pinned-tab.svg' color='#f9f9f9' />
        <link rel='shortcut icon' href='/assets/favicons/favicon.ico' />
        <meta name='msapplication-TileColor' content='#f9f9f9' />
        <meta name='msapplication-config' content='/assets/favicons/browserconfig.xml' />
        <meta name='theme-color' content='#f9f9f9' />
      </head>

      <ReactQueryProvider>
        <motion.body
          suppressHydrationWarning
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-off-white relative flex h-full min-h-screen flex-col items-center justify-center bg-[#060606] text-sm`}
          transition={{
            duration: 0.5,
            scale: { type: 'spring', visualDuration: 0.5, bounce: 0.5 },
          }}
        >
          <main
            className={`relative z-10 mx-auto my-10 min-h-52 w-full max-w-2xl border border-[var(--black-light)] bg-[var(--black)] text-[var(--white)]`}
          >
            {children}
          </main>

          <BackgroundGrid />
          <Toaster />
        </motion.body>
      </ReactQueryProvider>
    </html>
  );
}
