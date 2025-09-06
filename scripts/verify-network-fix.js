#!/usr/bin/env node

/**
 * Script to verify the network field fix implementation
 * This script runs tests and validates the fix is working correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando implementação da correção de rede...\n');

// Check if required files exist
const requiredFiles = [
  'lib/network-utils.ts',
  'lib/promotion-service.ts',
  'app/promotions/page.tsx',
  '__tests__/network-utils.test.ts',
  '__tests__/promotion-service.test.ts',
  '__tests__/network-consistency.e2e.test.ts'
];

console.log('📁 Verificando arquivos necessários...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - ARQUIVO FALTANDO`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Alguns arquivos necessários estão faltando. Verifique a implementação.');
  process.exit(1);
}

console.log('\n🧪 Executando testes...');

try {
  // Run unit tests
  console.log('\n📋 Executando testes unitários...');
  execSync('npm test -- network-utils.test.ts', { stdio: 'inherit' });
  console.log('✅ Testes unitários passaram');

  // Run integration tests
  console.log('\n🔗 Executando testes de integração...');
  execSync('npm test -- promotion-service.test.ts', { stdio: 'inherit' });
  console.log('✅ Testes de integração passaram');

  // Run end-to-end tests
  console.log('\n🎯 Executando testes end-to-end...');
  execSync('npm test -- network-consistency.e2e.test.ts', { stdio: 'inherit' });
  console.log('✅ Testes end-to-end passaram');

} catch (error) {
  console.log('\n❌ Alguns testes falharam. Verifique os logs acima para detalhes.');
  process.exit(1);
}

// Verify network resolution priority
console.log('\n🔍 Verificando prioridade de resolução de rede...');

const networkUtilsContent = fs.readFileSync('lib/network-utils.ts', 'utf8');

if (networkUtilsContent.includes('userData.rede || userData.empresa || userData.sub_rede')) {
  console.log('✅ Prioridade correta implementada: rede > empresa > sub_rede');
} else {
  console.log('❌ Prioridade incorreta ou não encontrada');
  process.exit(1);
}

// Verify promotion service uses network utils
console.log('\n🔍 Verificando uso das utilidades de rede no serviço de promoções...');

const promotionServiceContent = fs.readFileSync('lib/promotion-service.ts', 'utf8');

if (promotionServiceContent.includes('resolveUserNetwork')) {
  console.log('✅ Serviço de promoções usa resolveUserNetwork');
} else {
  console.log('❌ Serviço de promoções não usa resolveUserNetwork');
  process.exit(1);
}

if (promotionServiceContent.includes('validateNetworkExists')) {
  console.log('✅ Serviço de promoções usa validateNetworkExists');
} else {
  console.log('❌ Serviço de promoções não usa validateNetworkExists');
  process.exit(1);
}

// Verify page component uses network utils
console.log('\n🔍 Verificando uso das utilidades de rede na página de promoções...');

const pageContent = fs.readFileSync('app/promotions/page.tsx', 'utf8');

if (pageContent.includes('resolveUserNetwork')) {
  console.log('✅ Página de promoções usa resolveUserNetwork');
} else {
  console.log('❌ Página de promoções não usa resolveUserNetwork');
  process.exit(1);
}

if (pageContent.includes('handleNetworkResolutionFailure')) {
  console.log('✅ Página de promoções usa handleNetworkResolutionFailure');
} else {
  console.log('❌ Página de promoções não usa handleNetworkResolutionFailure');
  process.exit(1);
}

console.log('\n🎉 VERIFICAÇÃO COMPLETA!');
console.log('\n📋 Resumo da correção implementada:');
console.log('   ✅ Função utilitária de resolução de rede criada');
console.log('   ✅ Prioridade correta implementada (rede > empresa > sub_rede)');
console.log('   ✅ Serviço de promoções atualizado');
console.log('   ✅ Página de promoções atualizada');
console.log('   ✅ Validação de rede implementada');
console.log('   ✅ Tratamento de erros melhorado');
console.log('   ✅ Testes unitários criados');
console.log('   ✅ Testes de integração criados');
console.log('   ✅ Testes end-to-end criados');
console.log('\n🚀 A correção do problema de mapeamento de rede foi implementada com sucesso!');
console.log('\n📝 Próximos passos:');
console.log('   1. Teste a aplicação manualmente');
console.log('   2. Verifique se as promoções são filtradas corretamente');
console.log('   3. Confirme que as novas promoções são criadas com a rede correta');
console.log('   4. Monitore os logs para verificar a resolução de rede');