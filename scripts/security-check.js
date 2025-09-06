#!/usr/bin/env node

/**
 * Script de verificação de segurança
 * Verifica se há dados sensíveis expostos no código
 */

const fs = require('fs');
const path = require('path');

// Padrões de dados sensíveis para detectar
const SENSITIVE_PATTERNS = [
  {
    pattern: /eyJhbGciOiJIUzI1NiJ/g,
    description: 'JWT Token detectado',
    severity: 'HIGH'
  },
  {
    pattern: /admin123|123456/g,
    description: 'Senha padrão detectada',
    severity: 'MEDIUM'
  },
  {
    pattern: /https:\/\/.*\.praisesistemas\.uk/g,
    description: 'URL hardcoded detectada',
    severity: 'MEDIUM'
  },
  {
    pattern: /['"]apikey['"]:\s*['"][^'"]*eyJhbGciOiJIUzI1NiJ[^'"]*['"]/g,
    description: 'API Key hardcoded detectada',
    severity: 'HIGH'
  }
];

// Arquivos para ignorar
const IGNORE_FILES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'security-check.js',
  'SECURITY.md',
  '__tests__',
  'test-',
  '.env.local', // Arquivo de configuração local - OK ter URLs reais
  '.env.example', // Arquivo de exemplo - agora seguro
  '.env.docker' // Arquivo de exemplo para Docker - seguro
];

function shouldIgnoreFile(filePath) {
  return IGNORE_FILES.some(ignore => filePath.includes(ignore));
}

function checkFile(filePath) {
  if (shouldIgnoreFile(filePath)) return [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    SENSITIVE_PATTERNS.forEach(({ pattern, description, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: filePath,
            description,
            severity,
            match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
            line: content.substring(0, content.indexOf(match)).split('\n').length
          });
        });
      }
    });
    
    return issues;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir) {
  let allIssues = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        allIssues = allIssues.concat(scanDirectory(fullPath));
      } else if (stat.isFile()) {
        const issues = checkFile(fullPath);
        allIssues = allIssues.concat(issues);
      }
    });
  } catch (error) {
    // Ignorar erros de permissão
  }
  
  return allIssues;
}

function main() {
  console.log('🔍 Iniciando verificação de segurança...\n');
  
  const issues = scanDirectory('.');
  
  if (issues.length === 0) {
    console.log('✅ Nenhum problema de segurança detectado!');
    return;
  }
  
  console.log(`⚠️  ${issues.length} problema(s) de segurança detectado(s):\n`);
  
  // Agrupar por severidade
  const highIssues = issues.filter(i => i.severity === 'HIGH');
  const mediumIssues = issues.filter(i => i.severity === 'MEDIUM');
  
  if (highIssues.length > 0) {
    console.log('🚨 ALTA SEVERIDADE:');
    highIssues.forEach(issue => {
      console.log(`  📁 ${issue.file}:${issue.line}`);
      console.log(`  📝 ${issue.description}`);
      console.log(`  🔍 "${issue.match}"`);
      console.log('');
    });
  }
  
  if (mediumIssues.length > 0) {
    console.log('⚠️  MÉDIA SEVERIDADE:');
    mediumIssues.forEach(issue => {
      console.log(`  📁 ${issue.file}:${issue.line}`);
      console.log(`  📝 ${issue.description}`);
      console.log(`  🔍 "${issue.match}"`);
      console.log('');
    });
  }
  
  console.log('📋 RECOMENDAÇÕES:');
  console.log('  1. Mova dados sensíveis para variáveis de ambiente');
  console.log('  2. Use o utilitário security-utils.ts para mascarar dados');
  console.log('  3. Altere senhas padrão antes do deploy');
  console.log('  4. Revise o arquivo SECURITY.md para mais detalhes');
  
  // Exit com código de erro se houver problemas de alta severidade
  if (highIssues.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, scanDirectory };