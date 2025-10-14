"use client";

import { useEffect, useId, useMemo } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = useMemo(
    () => searchParams?.toString() ?? "",
    [searchParams]
  );
  const inlineScriptId = useId();

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") {
      return;
    }

    const pagePath = searchParamsString
      ? `${pathname}?${searchParamsString}`
      : pathname;

    window.gtag?.("config", measurementId, {
      page_path: pagePath,
    });
  }, [measurementId, pathname, searchParamsString]);

  if (!measurementId) {
    return null;
  }

  const measurementIdJson = JSON.stringify(measurementId);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id={inlineScriptId} strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', ${measurementIdJson}, {
            page_path: window.location.pathname + window.location.search,
          });
        `}
      </Script>
    </>
  );
}
