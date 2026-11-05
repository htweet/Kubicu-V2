/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" builds the real sign-in (M2.6). Off by default; production can still switch it off in /config.js. */
  readonly VITE_KUBICU_REAL_AUTH?: string;
  /** "prototype" compiles in the prototype staff console (/admin). Never set for a deployed build (G-1). */
  readonly VITE_KUBICU_STAFF_CONSOLE?: string;
}
