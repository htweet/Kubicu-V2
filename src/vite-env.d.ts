/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" builds the real sign-in (M2.6). Off by default; production can still switch it off in /config.json. */
  readonly VITE_KUBICU_REAL_AUTH?: string;
}
