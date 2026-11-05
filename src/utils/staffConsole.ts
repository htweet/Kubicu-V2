/**
 * The prototype staff console (/admin) has a simulated sign-in and keeps its data in the browser, so it
 * must never reach a deployed build (release gate G-1; AI-Engine post-m2-review/03 §1). It is compiled
 * in only when the build sets VITE_KUBICU_STAFF_CONSOLE=prototype, which `npm run build` (local demos)
 * and `npm run dev` do, and which `npm run build:realauth` refuses. When it is off, the console's routes,
 * screens and links are not in the bundle at all.
 */
export const STAFF_CONSOLE_BUILD = import.meta.env.VITE_KUBICU_STAFF_CONSOLE === 'prototype';
