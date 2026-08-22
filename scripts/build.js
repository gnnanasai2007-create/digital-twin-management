const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

function run(cmd, cwd = rootDir) {
  console.log(`\n⚙️ Running: ${cmd} (in ${path.relative(rootDir, cwd) || 'root'})`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' } });
}

console.log('🚀 Starting DTAM Unified Production Build...');

// 1. Ensure server .env exists with DATABASE_URL
const serverEnvPath = path.join(serverDir, '.env');
if (!fs.existsSync(serverEnvPath)) {
  console.log('📝 Creating default server/.env configuration...');
  fs.writeFileSync(
    serverEnvPath,
    'PORT=5000\nNODE_ENV=production\nDATABASE_URL="file:./dev.db"\nJWT_SECRET=super_secret_jwt_key_dtam_2026_industrial_platform\n'
  );
}

// 2. Install dependencies
console.log('📦 Installing dependencies across workspace...');
run('npm install', serverDir);
run('npm install', clientDir);

// 3. Setup SQLite Database & Seed Data
console.log('🗄️ Setting up database schema & Prisma client...');
run('npx prisma generate', serverDir);
run('npx prisma db push --accept-data-loss', serverDir);
run('node prisma/seed.js', serverDir);

// 4. Build Client SPA Bundle
console.log('✨ Building optimized Client Frontend bundle...');
run('npm run build', clientDir);

console.log('\n✅ DTAM Unified Production Build Completed Successfully!');
