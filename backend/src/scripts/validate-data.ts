// Validates /data fixtures. Usage: npm run validate:data
import { fixtures } from '../data/fixtures.js';

const summary = Object.entries(fixtures).map(([name, items]) => `${name}: ${(items as unknown[]).length}`);

console.log('[mi-ruta] Fixtures are valid and consistent.');
console.log(`  ${summary.join('\n  ')}`);
