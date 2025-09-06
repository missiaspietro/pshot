// Teste específico para verificar se o botão Salvar de promoções está funcionando
console.log('🧪 Teste Específico: Botão Salvar de Promoções');

// Função para encontrar o card de promoções
const findPromotionsCard = () => {
  const cards = document.querySelectorAll('.bg-gradient-to-br');
  for (let card of cards) {
    if (card.textContent?.includes('Relatório de Promoções')) {
      console.log('✅ Card de Promoções encontrado');
      return card;
    }
  }
  console.log('❌ Card de Promoções não encontrado');
  return null;
};

// Função para encontrar o botão Salvar dentro do card
const findSaveButton = (card) => {
  if (!card) return null;
  
  const buttons = card.querySelectorAll('button');
  for (let button of buttons) {
    if (button.textContent?.includes('Salvar')) {
      console.log('✅ Botão Salvar encontrado no card de promoções');
      console.log('📍 Botão:', button);
      console.log('🔧 Disabled:', button.disabled);
      console.log('🎯 onClick definido:', button.onclick !== null || button.getAttribute('onclick') !== null);
      return button;
    }
  }
  console.log('❌ Botão Salvar não encontrado no card de promoções');
  return null;
};

// Função para verificar se há checkboxes selecionados
const checkSelectedFields = (card) => {
  if (!card) return [];
  
  const checkboxes = card.querySelectorAll('input[type="checkbox"]');
  const selected = [];
  
  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      const label = checkbox.closest('div')?.querySelector('label')?.textContent;
      selected.push({ index, label: label || 'Sem label', id: checkbox.id });
    }
  });
  
  console.log(`📊 Total de checkboxes: ${checkboxes.length}`);
  console.log(`✅ Checkboxes selecionados: ${selected.length}`);
  selected.forEach(item => {
    console.log(`   - ${item.label} (${item.id})`);
  });
  
  return selected;
};

// Função para simular seleção de um checkbox (se nenhum estiver selecionado)
const selectFirstCheckbox = (card) => {
  if (!card) return false;
  
  const checkboxes = card.querySelectorAll('input[type="checkbox"]');
  if (checkboxes.length > 0 && !checkboxes[0].checked) {
    console.log('🔧 Selecionando primeiro checkbox para teste...');
    checkboxes[0].click();
    return true;
  }
  return false;
};

// Função para testar o clique no botão
const testSaveButtonClick = (button) => {
  if (!button) return;
  
  console.log('🖱️ Testando clique no botão Salvar...');
  
  if (button.disabled) {
    console.log('⚠️ Botão está desabilitado - não é possível testar');
    return;
  }
  
  // Contar modais antes do clique
  const modalsBefore = document.querySelectorAll('[role="dialog"], .modal, [data-state="open"]').length;
  console.log(`📊 Modais abertos antes do clique: ${modalsBefore}`);
  
  // Simular clique
  button.click();
  
  // Aguardar e verificar se modal apareceu
  setTimeout(() => {
    const modalsAfter = document.querySelectorAll('[role="dialog"], .modal, [data-state="open"]').length;
    console.log(`📊 Modais abertos após o clique: ${modalsAfter}`);
    
    if (modalsAfter > modalsBefore) {
      console.log('✅ SUCESSO: Modal foi aberto após o clique!');
      
      // Procurar especificamente por modal de salvamento
      const saveModal = Array.from(document.querySelectorAll('[role="dialog"]')).find(modal => 
        modal.textContent?.includes('Salvar') || modal.textContent?.includes('Nome')
      );
      
      if (saveModal) {
        console.log('✅ Modal de salvamento confirmado!');
        console.log('📍 Modal:', saveModal);
      }
    } else {
      console.log('❌ FALHA: Modal não foi aberto');
    }
  }, 200);
};

// Executar teste completo
const runCompleteTest = () => {
  console.log('🚀 Iniciando teste completo...');
  console.log('');
  
  // 1. Encontrar card
  const card = findPromotionsCard();
  if (!card) return;
  
  console.log('');
  
  // 2. Verificar campos selecionados
  const selectedFields = checkSelectedFields(card);
  
  console.log('');
  
  // 3. Se nenhum campo selecionado, selecionar um
  if (selectedFields.length === 0) {
    const selected = selectFirstCheckbox(card);
    if (selected) {
      console.log('✅ Checkbox selecionado para teste');
    }
  }
  
  console.log('');
  
  // 4. Encontrar botão
  const button = findSaveButton(card);
  if (!button) return;
  
  console.log('');
  
  // 5. Testar clique
  testSaveButtonClick(button);
  
  console.log('');
  console.log('✅ Teste completo finalizado');
};

// Executar
runCompleteTest();

// Disponibilizar funções para teste manual
window.testPromotionsSave = {
  runCompleteTest,
  findPromotionsCard,
  findSaveButton,
  checkSelectedFields,
  selectFirstCheckbox,
  testSaveButtonClick
};