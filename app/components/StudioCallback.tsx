"use client";
import { useEffect } from "react";
// Identity emails may land on the homepage. Forward only the hash (never send tokens to a different origin).
export default function StudioCallback() {
  useEffect(() => {
    if (window.location.pathname !== "/admin/" && /(?:^#|&)(invite_token|recovery_token|confirmation_token|access_token|email_change_token)=/.test(window.location.hash)) {
      window.location.replace(`/admin/${window.location.hash}`);
    }
  }, []);
  return null;
}
