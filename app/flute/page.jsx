import React from "react";
import { notFound } from "next/navigation";
import FluteStudio from "../../src/flute/Studio";
export default function FlutePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <><meta name="flute-project" content="10ae09f6-af6b-44ab-8a2f-554bf010d687" /><FluteStudio /></>;
}
