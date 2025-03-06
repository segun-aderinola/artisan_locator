require('ts-node/register');
const { execSync } = require('child_process');
const path = require('path');

const sequelizeCli = path.resolve(__dirname, 'node_modules/.bin/sequelize');
const configPath = path.resolve(__dirname, 'src/config/config.ts');

try {
  execSync(`${sequelizeCli} db:migrate --config ${configPath}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Migration failed:', error.message);
}
