// Vercel Node.js function entry. Reuses the same Express app as the local server
// (backend/src/server.ts); vercel.json rewrites every /api/* request here and the
// function receives the original URL, so Express routing works unchanged.
import { app } from '../backend/src/app.js';

export default app;
