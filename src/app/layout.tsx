// "use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import ReactReduxProvider from "./Provider/ReactReduxProvider";
import ToasterProvider from "./ui/toast";
import { Metadata } from "next";
import "react-circular-progressbar/dist/styles.css";

// Metadata for the application
export const metadata: Metadata = {
  icons: {
    icon: "/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const [loading, setLoading] = useState<boolean>(true);

  // const pathname = usePathname();

  // useEffect(() => {
  //   setTimeout(() => setLoading(false), 1000);
  // }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>The Sleep Company</title> {/* Title for the document */}
        <link rel="icon" href="/images/favicon.ico" />
      </head>
      <body suppressHydrationWarning={true}>
        <ReactReduxProvider>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {/* {loading ? <Loader /> : children} */}
            {children}
          </div>
          <ToasterProvider />
        </ReactReduxProvider>
      </body>
    </html>
  );
}
