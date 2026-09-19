"use client";
import React from "react";
import { ProjectPreview } from "@webprodigies/flute/preview";
import { sceneModules } from "./catalog";
// Host-owned development flag: no process, Vite or Electron globals in this adapter.
export function FluteProjectPreview({ children, enabled, active, ...props }) {
  if (!enabled) return children;
  return <ProjectPreview {...props} projectId="10ae09f6-af6b-44ab-8a2f-554bf010d687" enabled={enabled} active={active} sceneModules={sceneModules}>{children}</ProjectPreview>;
}
