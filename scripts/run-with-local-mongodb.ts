import { spawn } from 'node:child_process';

import { LOCAL_MONGODB_URI } from './local-mongodb';

const [script, ...rawArgs] = process.argv.slice(2);

if (!script) {
    console.error('Usage: tsx scripts/run-with-local-mongodb.ts <npm-script> [-- <args>]');
    process.exit(1);
}

const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;
const npmCli = process.env.npm_execpath;

if (!npmCli) {
    console.error('npm_execpath is unavailable; run this helper through an npm script');
    process.exit(1);
}

const child = spawn(process.execPath, [npmCli, 'run', script, '--', ...args], {
    env: {
        ...process.env,
        MONGODB_URI: LOCAL_MONGODB_URI,
    },
    stdio: 'inherit',
});

child.on('error', (error: Error) => {
    console.error(`Failed to run npm script "${script}":`, error.message);
    process.exitCode = 1;
});

child.on('exit', (code: number | null) => {
    process.exitCode = code ?? 1;
});
