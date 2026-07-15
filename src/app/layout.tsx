import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootLayoutClient } from "../components/layout/RootLayoutClient";
import { GA_MEASUREMENT_ID, CLARITY_PROJECT_ID } from "../lib/analytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Technical Writing Practice Platform | SkillDrill",
  description: "Sharpen your documentation skills with interview-ready quizzes covering APIs, style guides, AI, Docs-as-Code, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {GA_MEASUREMENT_ID ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        ) : null}
        {CLARITY_PROJECT_ID ? (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window,document,"clarity","script","${CLARITY_PROJECT_ID}");
              `,
            }}
          />
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('skilldrill_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}

