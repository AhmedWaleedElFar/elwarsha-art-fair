"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NotFoundPage() {
  const [pathname, setPathname] = useState("");
  const path = usePathname();

  useEffect(() => {
    setPathname(path);
  }, [path]);

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1 style={{ fontSize: 36, fontWeight: 700 }}>404 - Page Not Found</h1>
      <p style={{ color: "#888", marginTop: 16 }}>
        Sorry, the page {pathname} you are looking for does not exist.
      </p>
    </div>
  );
}
