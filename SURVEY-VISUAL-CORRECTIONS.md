# Correções Visuais - Card de Pesquisas

## ✅ Implementado - Layout Idêntico ao Cashback

### 1. **Estrutura Exatamente Igual**
- ✅ Seção "Gerenciar Configurações" com botão de expandir/recolher
- ✅ Botão "Salvar" no mesmo local e tamanho
- ✅ Lista de configurações salvas com toggle
- ✅ Mensagens de erro no mesmo formato
- ✅ Botões de ação na mesma disposição

### 2. **Botão de Mostrar/Ocultar Configurações**
```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={() => setIsSurveyConfigListExpanded(!isSurveyConfigListExpanded)}
  className="text-gray-500 hover:bg-transparent hover:text-gray-500 p-1"
  aria-expanded={isSurveyConfigListExpanded}
  aria-label={isSurveyConfigListExpanded ? "Ocultar configurações salvas" : "Mostrar configurações salvas"}
>
  {isSurveyConfigListExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
</Button>
```

### 3. **Cores Ajustadas para Tema Roxo**

#### Botão "Ver"
- ✅ **Cor**: `bg-purple-500 hover:bg-purple-600`
- ✅ **Ícone**: `Search` (igual ao cashback)

#### Botão "Excel" 
- ✅ **Cor**: `border-purple-500 text-purple-600 hover:bg-purple-600`
- ✅ **Mudança**: Era verde, agora roxo para manter consistência

#### Botão "Salvar"
- ✅ **Cor**: `border-purple-500 text-purple-600 hover:bg-purple-50`
- ✅ **Localização**: Dentro da seção "Gerenciar Configurações"
- ✅ **Tamanho**: `text-xs sm:text-xs min-h-[36px] px-3 sm:px-2`

### 4. **Seção "Gerenciar Configurações"**

#### Header com Toggle
```typescript
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <h6 className="text-sm font-medium text-gray-600">Gerenciar Configurações</h6>
    <Button variant="ghost" size="sm" onClick={toggleFunction}>
      {expanded ? <ChevronUp /> : <ChevronDown />}
    </Button>
  </div>
  <Button variant="outline" size="sm">
    <Save className="h-3 w-3 mr-1" />
    Salvar
  </Button>
</div>
```

#### Lista Condicional
```typescript
{isSurveyConfigListExpanded && (
  <div className="mt-3">
    <SavedConfigurationsList
      configurations={surveyConfigurations}
      onLoad={handleLoadSurveyConfiguration}
      onDelete={handleDeleteSurveyConfiguration}
      isLoading={isLoadingSurveyConfigs}
    />
  </div>
)}
```

### 5. **Estados e Funcionalidades**

#### Estado Adicionado
```typescript
const [isSurveyConfigListExpanded, setIsSurveyConfigListExpanded] = useState(false)
```

#### Validações Idênticas
- ✅ Limite de 10 configurações
- ✅ Desabilitar quando sem campos selecionados
- ✅ Estados de loading/erro
- ✅ Mensagens de feedback

### 6. **Mensagens de Erro**
```typescript
{surveyConfigError && (
  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
    {surveyConfigError}
    <div className="flex gap-2 mt-1">
      <button onClick={retrySurveyLoad}>
        {isLoadingSurveyConfigs ? 'Tentando...' : 'Tentar novamente'}
      </button>
      <button onClick={clearSurveyError}>Fechar</button>
    </div>
  </div>
)}
```

## 🎯 Resultado Visual

### **Antes vs Depois**

**Antes:**
- ❌ Layout diferente do cashback
- ❌ Botão salvar fora do local padrão
- ❌ Sem botão para mostrar/ocultar configurações
- ❌ Botão Excel verde (inconsistente)

**Depois:**
- ✅ **Layout idêntico** ao cashback
- ✅ **Botão salvar** na seção "Gerenciar Configurações"
- ✅ **Toggle** para mostrar/ocultar configurações salvas
- ✅ **Cores consistentes** com tema roxo
- ✅ **Estrutura visual** exatamente igual

## 🎨 Cores Finais

| Elemento | Cor |
|----------|-----|
| Botão "Ver" | `bg-purple-500 hover:bg-purple-600` |
| Botão "Excel" | `border-purple-500 text-purple-600` |
| Botão "Salvar" | `border-purple-500 text-purple-600` |
| Checkboxes | `from-purple-500 to-indigo-600` |

Agora os cards estão **visualmente idênticos**, diferindo apenas nas cores dos botões conforme solicitado! 🎉