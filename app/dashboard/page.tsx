"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the main dashboard component to avoid SSR 'window is not defined' errors
const DashboardContent = dynamic(() => import("./DashboardContent"), {
  ssr: false,
});

export default function DashboardPage() {
  return <DashboardContent />;
}
