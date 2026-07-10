// Script para congelar o DOM e impedir que o Framer o reconstrua
(function() {
  // Armazenar o estado original do DOM após as alterações
  let frozenDOM = null;
  let isFrozen = false;

  // Função para congelar o DOM
  function freezeDOM() {
    if (!isFrozen) {
      frozenDOM = document.body.cloneNode(true);
      isFrozen = true;
      console.log('✅ DOM congelado');
    }
  }

  // Função para restaurar o DOM congelado
  function restoreFrozenDOM() {
    if (frozenDOM && isFrozen) {
      document.body.replaceWith(frozenDOM.cloneNode(true));
      console.log('✅ DOM restaurado do estado congelado');
    }
  }

  // Interceptar o MutationObserver do Framer
  const OriginalMutationObserver = window.MutationObserver;
  window.MutationObserver = function(callback) {
    const wrappedCallback = function(mutations) {
      if (isFrozen) {
        console.log('🔒 Mudanças bloqueadas pelo freeze-dom');
        return;
      }
      return callback(mutations);
    };
    return new OriginalMutationObserver(wrappedCallback);
  };
  window.MutationObserver.prototype = OriginalMutationObserver.prototype;

  // Congelar após 2 segundos (tempo suficiente para o Framer renderizar)
  setTimeout(() => {
    freezeDOM();
  }, 2000);

  // Restaurar se o Framer tentar fazer mudanças
  const restoreInterval = setInterval(() => {
    if (isFrozen) {
      restoreFrozenDOM();
    }
  }, 500);

  // Expor funções globais para debug
  window.freezeDOM = freezeDOM;
  window.restoreFrozenDOM = restoreFrozenDOM;
  window.isFrozen = () => isFrozen;
})();
