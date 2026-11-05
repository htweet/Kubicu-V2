#!/usr/bin/env node
// The prototype build (local demos and the journey tests): `vite build` with the prototype staff console
// compiled in (VITE_KUBICU_STAFF_CONSOLE=prototype, release gate G-1). This build must never be deployed
// to a public host; deployments use `npm run build:realauth`, which excludes the console.
//   npm run build
import { build } from 'vite';

process.env.VITE_KUBICU_STAFF_CONSOLE = 'prototype';
await build();
