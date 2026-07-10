// Hydration Fixer - Manipula os dados do Framer antes da renderização
(function() {
  // Mapeamento de substituições
  const replacements = {
    'Dougretouch': 'Joel Cistrahenn',
    'Disponivel': 'Programação',
    'bravo': 'design',
    'Brabo': 'design',
    'criativo': 'vídeo',
    'Joel Rodrigues': 'Joel Cistrahenn',
    '+55 62 983420754': '+55 49 9 99235188',
    'createcistrahenncistrahennjoel@gmail.com': 'cistrahennjoel@gmail.com',
  };

  // Função para substituir texto em um objeto recursivamente
  function replaceInObject(obj) {
    if (typeof obj === 'string') {
      let result = obj;
      for (const [old, newVal] of Object.entries(replacements)) {
        result = result.replace(new RegExp(old, 'g'), newVal);
      }
      return result;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => replaceInObject(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const newObj = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = replaceInObject(value);
      }
      return newObj;
    }
    return obj;
  }

  // Interceptar o fetch para modificar os dados do Framer
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      // Se for uma requisição de dados do Framer, modificar a resposta
      if (args[0] && (args[0].includes('searchIndex') || args[0].includes('framer'))) {
        return response.clone().text().then(text => {
          try {
            const data = JSON.parse(text);
            const modifiedData = replaceInObject(data);
            return new Response(JSON.stringify(modifiedData), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          } catch (e) {
            return response;
          }
        });
      }
      return response;
    });
  };

  // Também substituir no DOM após renderização (como fallback)
  function applyTextReplacements() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      let text = node.textContent;
      let modified = false;

      for (const [old, newVal] of Object.entries(replacements)) {
        if (text.includes(old)) {
          text = text.replace(new RegExp(old, 'g'), newVal);
          modified = true;
        }
      }

      if (modified) {
        node.textContent = text;
      }
    }
  }

  // Aplicar substituições após o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTextReplacements);
  } else {
    applyTextReplacements();
  }

  // Aplicar uma vez mais após um pequeno delay para garantir
  setTimeout(applyTextReplacements, 1000);
})();
