/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_TWITCH_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
