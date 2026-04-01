import { useEffect, useState } from "react";

const detectInAppBrowser = () => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("kakaotalk") || ua.includes("naver") || ua.includes("instagram") || ua.includes("fban") || ua.includes("fbav") || ua.includes("line/");
};

export const useInAppBrowser = () => {
  const [isInApp, setIsInApp] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsInApp(detectInAppBrowser());
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("주소 복사에 실패했어요. 직접 복사해주세요: " + window.location.href);
    }
  };

  const handleOpenExternal = () => {
    const url = window.location.href;
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

    if (isIOS) {
      handleCopy();
      return;
    }

    const intentUrl = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;

    // intent 실패 시에만 복사 실행
    const fallback = setTimeout(() => handleCopy(), 1500);
    document.addEventListener(
      "visibilitychange",
      () => {
        clearTimeout(fallback); // 앱 전환 성공 시 복사 취소
      },
      { once: true },
    );
  };

  return { isInApp, copied, handleCopy, handleOpenExternal };
};
