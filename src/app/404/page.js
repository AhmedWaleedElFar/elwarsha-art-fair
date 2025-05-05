"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function NotFoundContent() {
  const params = useSearchParams();
  // You can display a message or use params if needed
  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <h1 style={{ fontSize: 36, fontWeight: 700 }}>404 - Page Not Found</h1>
      <p style={{ color: '#888', marginTop: 16 }}>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={null}>
      <NotFoundContent />
    </Suspense>
  );
}
