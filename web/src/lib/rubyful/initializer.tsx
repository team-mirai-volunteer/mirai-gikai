"use client";

import Script from "next/script";
import { rubyfulClient } from "./index";
import "./styles.css";

declare global {
  interface Window {
    RubyfulV2?: {
      init: (config: {
        selector: string;
        defaultDisplay: boolean;
        observeChanges?: boolean;
        styles?: object;
      }) => void;
    };
  }
}

export function RubyfulInitializer() {
  return (
    <Script
      src="https://rubyful-v2.s3.ap-northeast-1.amazonaws.com/v2/rubyful.js?t=20250507022654"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && window.RubyfulV2) {
          // Rubyful V2を初期化（デフォルトで非表示）
          window.RubyfulV2.init({
            selector:
              "main p:not(.no-ruby):not(.no-ruby *), main h1:not(.no-ruby):not(.no-ruby *), main h2:not(.no-ruby):not(.no-ruby *), main h3:not(.no-ruby):not(.no-ruby *), main h4:not(.no-ruby):not(.no-ruby *), main h5:not(.no-ruby):not(.no-ruby *), main h6:not(.no-ruby):not(.no-ruby *), main li:not(.no-ruby):not(.no-ruby *), main td:not(.no-ruby):not(.no-ruby *), main th:not(.no-ruby):not(.no-ruby *), main span:not(.no-ruby):not(.no-ruby *), main a:not(.no-ruby):not(.no-ruby *)",
            defaultDisplay: false,
            observeChanges: true,
            styles: {
              toggleButtonClass: "ruby-button",
            },
          });

          // クライアントを初期化
          rubyfulClient.init();
          rubyfulClient.observeChanges();
        }
      }}
    />
  );
}
