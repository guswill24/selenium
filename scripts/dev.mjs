// Starts the API and the frontend dev servers in parallel with prefixed output.
// Dependency-free on purpose: Node's `shell: true` spawns `cmd.exe /d` on Windows,
// which ignores broken cmd AutoRun registry entries that break other runners.
import { spawn } from 'node:child_process';

const tasks = [
  { name: 'api', color: '\x1b[34m', command: 'npm run dev -w backend' },
  { name: 'web', color: '\x1b[32m', command: 'npm run dev -w frontend' },
];

const reset = '\x1b[0m';
const children = [];
let shuttingDown = false;

function pipeWithPrefix(stream, prefix, target) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) target.write(`${prefix} ${line}\n`);
  });
}

function shutdown(exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill();
  process.exitCode = exitCode;
}

for (const task of tasks) {
  const prefix = `${task.color}[${task.name}]${reset}`;
  const child = spawn(task.command, { shell: true, env: { ...process.env, FORCE_COLOR: '1' } });

  pipeWithPrefix(child.stdout, prefix, process.stdout);
  pipeWithPrefix(child.stderr, prefix, process.stderr);

  child.on('exit', (code) => {
    if (!shuttingDown) {
      process.stderr.write(`${prefix} exited with code ${code ?? 'null'}\n`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
