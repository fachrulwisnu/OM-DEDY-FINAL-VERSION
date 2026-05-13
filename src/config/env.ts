// src/config/env.ts
export const getEnv = (key: string) => {
  // Priority 1: Vite/ESM style
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  // Priority 2: Node/CJS style (for Vercel Edge/Serverless)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};
