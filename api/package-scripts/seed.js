// Script para executar o seed do banco de dados
const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Executando seed do banco de dados...\n');

try {
  // Compila o TypeScript e executa o seed
  const seedPath = path.join(__dirname, '../src/scripts/seed.ts');
  execSync(`npx tsx ${seedPath}`, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro ao executar seed:', error.message);
  process.exit(1);
}