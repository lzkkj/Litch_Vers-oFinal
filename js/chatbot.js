/*
 * Litch AI - assistente local da pagina Help-Me!
 *
 * Este arquivo nao usa uma API externa: as respostas sao geradas a partir
 * dos dados visiveis no projeto. Ao adicionar jogos ou planos, atualize os
 * objetos abaixo para manter o assistente alinhado com a Home.
 */

document.addEventListener('DOMContentLoaded', () => {
    const messagesEl = document.getElementById('aiMessages');
    const inputEl = document.getElementById('aiInput');
    const sendBtn = document.getElementById('aiSend');
    const suggestionBtns = document.querySelectorAll('.litch-ai__suggestions button');
    const blockedTerms = [
        'idiota', 'imbecil', 'otario', 'otaria', 'burro', 'burra',
        'merda', 'porra', 'caralho', 'bosta', 'cacete', 'puta', 'puto',
        'foda se', 'filho da puta', 'arrombado', 'arrombada',
        'fuck', 'shit', 'asshole', 'idiot'
    ];

    if (!messagesEl || !inputEl || !sendBtn) return;

    const games = [
        { name: 'Peak', aliases: ['peak'], price: 'R$ 7,98', oldPrice: 'R$ 39,90', discount: '-20%', genres: ['Adventure', 'COOP'], online: true, plus: false },
        { name: 'EA FC 26', aliases: ['ea fc', 'fc 26', 'fifa'], price: 'R$ 199,90', genres: ['Sports'], online: false, plus: true },
        { name: 'Crimson Desert', aliases: ['crimson', 'crimson desert'], price: 'R$ 134,95', oldPrice: 'R$ 299,90', discount: '-45%', genres: ['Open World', 'Souls-like'], online: false, plus: false },
        { name: 'Red Dead Redemption 2', aliases: ['rdr2', 'red dead 2', 'red dead redemption'], price: 'R$ 149,90', genres: ['Shooter', 'Open World', 'History Mode'], online: false, plus: true },
        { name: 'Counter Strike 2', aliases: ['counter strike', 'cs2', 'cs go'], price: 'R$ 36,20', oldPrice: 'R$ 80,50', discount: '-55%', genres: ['Shooter', 'Multiplayer'], online: true, plus: false },
        { name: 'Dark Souls 3', aliases: ['dark souls', 'ds3'], price: 'R$ 45,15', oldPrice: 'R$ 90,30', discount: '-50%', genres: ['Action', 'RPG', 'Souls-like'], online: false, plus: true },
        { name: 'DEVOUR', aliases: ['devour'], price: 'R$ 17,75', oldPrice: 'R$ 35,50', discount: '-50%', genres: ['Horror'], online: false, plus: false },
        { name: 'Planet Coaster 2', aliases: ['planet coaster'], price: 'R$ 75,90', oldPrice: 'R$ 151,80', discount: '-50%', genres: ['Building', 'Simulation'], online: false, plus: true },
        { name: 'Ghost of Yotei', aliases: ['ghost of yotei', 'yotei'], price: 'R$ 112,45', oldPrice: 'R$ 249,90', discount: '-45%', genres: ['Adventure', 'History Mode', 'Samurai'], online: false, plus: true },
        { name: 'Mortal Kombat 1 - Remake', aliases: ['mortal kombat', 'mk1'], price: 'R$ 65,90', oldPrice: 'R$ 119,90', discount: '-30%', genres: ['Fighting'], online: false, plus: true },
        { name: 'Minecraft', aliases: ['minecraft'], price: 'R$ 59,90', genres: ['Multiplayer', 'Adventure'], online: true, plus: false },
        { name: 'Sea Of Thieves', aliases: ['sea of thieves'], price: 'R$ 104,90', oldPrice: 'R$ 149,90', discount: '-30%', genres: ['Adventure', 'COOP'], online: true, plus: false },
        { name: 'Rematch', aliases: ['rematch'], price: 'R$ 89,90', genres: ['Sports', 'Multiplayer'], online: true, plus: true },
        { name: 'Red Dead Online', aliases: ['red dead online'], price: 'R$ 67,20', oldPrice: 'R$ 112,00', discount: '-40%', genres: ['Shooter', 'Competitive'], online: true, plus: false },
        { name: 'Dead By Daylight', aliases: ['dead by daylight', 'dbd'], price: 'R$ 89,90', genres: ['Survival', 'Multiplayer'], online: true, plus: true },
        { name: 'Diablo IV', aliases: ['diablo', 'diablo 4'], price: 'R$ 172,40', oldPrice: 'R$ 229,90', discount: '-25%', genres: ['RPG', 'Online'], online: true, plus: true },
        { name: 'Street Fighter 6', aliases: ['street fighter', 'sf6'], price: 'R$ 99,90', genres: ['Fighting', 'Multiplayer'], online: true, plus: true }
    ];

    const plans = [
        { name: 'Basic', aliases: ['basic', 'basico'], price: 'R$ 19,90', quality: '1080p', devices: '1 dispositivo', features: ['acesso a biblioteca Litch+'] },
        { name: 'Standard', aliases: ['standard', 'padrao'], price: 'R$ 34,90', quality: '1440p', devices: '2 dispositivos', features: ['acesso a biblioteca Litch+', 'acessos exclusivos para membros'] },
        { name: 'Ultra', aliases: ['ultra'], price: 'R$ 69,90', quality: '4K', devices: '4 dispositivos', features: ['acesso a biblioteca Litch+', 'descontos exclusivos', 'acesso antecipado a lancamentos'] }
    ];

    const state = { lastGame: null, lastPlan: null, history: [] };

    // Todas as comparacoes passam por esta funcao para aceitar perguntas com acentos.
    function normalize(value) {
        return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function includesAny(text, terms) {
        return terms.some(term => text.includes(normalize(term)));
    }

    // Mantem insultos fora da conversa sem exibir ou enviar o termo original.
    function containsBlockedTerm(value) {
        const cleanText = normalize(value).replace(/[^a-z0-9]+/g, ' ').trim();
        return blockedTerms.some(term => {
            const cleanTerm = normalize(term).replace(/[^a-z0-9]+/g, ' ').trim();
            return ` ${cleanText} `.includes(` ${cleanTerm} `);
        });
    }

    function findGame(text) {
        const normalized = normalize(text);
        return games
            .flatMap(game => game.aliases.map(alias => ({ game, alias: normalize(alias) })))
            .sort((first, second) => second.alias.length - first.alias.length)
            .find(item => normalized.includes(item.alias))?.game || state.lastGame;
    }

    function findPlan(text) {
        const normalized = normalize(text);
        return plans.find(plan => plan.aliases.some(alias => normalized.includes(normalize(alias)))) || state.lastPlan;
    }

    function formatGame(game) {
        const discount = game.discount ? ` com desconto de ${game.discount} (antes ${game.oldPrice})` : '';
        const plus = game.plus ? ' Está marcado como disponível no Litch+.' : '';
        return `${game.name} custa ${game.price}${discount}. Gêneros: ${game.genres.join(', ')}.${plus}`;
    }

    function gameList(filter) {
        return games.filter(filter).map(game => game.name).join(', ');
    }

    function getAnswer(userText) {
        const text = normalize(userText);
        const game = findGame(text);
        const plan = findPlan(text);
        const isPlanQuestion = includesAny(text, ['plano', 'planos', 'mensalidade', 'mensal', 'quanto custa o litch', 'preco do litch']);
        if (game) state.lastGame = game;
        if (plan) state.lastPlan = plan;

        if (includesAny(text, ['oi', 'ola', 'hello', 'hi', 'hey', 'e ai', 'eae'])) {
            return 'Olá! Eu sou a Litch AI. Posso falar sobre jogos, preços, descontos, gêneros, jogos online, Litch+, navegação e a comunidade.';
        }
        if (includesAny(text, ['obrigado', 'obrigada', 'valeu', 'thanks'])) {
            return 'Por nada! Pode continuar perguntando sobre a Litch.';
        }
        if (includesAny(text, ['tchau', 'ate mais', 'bye'])) {
            return 'Até mais! Estarei aqui quando você precisar.';
        }
        if (isPlanQuestion) {
            if (plan) return `${plan.name}: ${plan.price}/mês, streaming até ${plan.quality}, ${plan.devices} e ${plan.features.join('; ')}.`;
            return 'Os planos Litch+ são: Basic por R$ 19,90/mês (1080p, 1 dispositivo); Standard por R$ 34,90/mês (1440p, 2 dispositivos); e Ultra por R$ 69,90/mês (4K, 4 dispositivos).';
        }
        if (game && includesAny(text, ['preco', 'custa', 'valor', 'quanto', 'price', 'cost'])) {
            return formatGame(game);
        }
        if (game && includesAny(text, ['desconto', 'promocao', 'promo'])) {
            return game.discount ? `${game.name} está com ${game.discount} de desconto: de ${game.oldPrice} por ${game.price}.` : `${game.name} aparece na Store por ${game.price}, sem desconto exibido no momento.`;
        }
        if (game && includesAny(text, ['genero', 'tipo', 'estilo', 'sobre', 'como e', 'o que e'])) {
            return `${game.name} é classificado como ${game.genres.join(', ')} e está listado por ${game.price}.`;
        }
        if (game && includesAny(text, ['litch+', 'litch plus', 'assinatura', 'biblioteca'])) {
            return game.plus ? `${game.name} está indicado como disponível no Litch+. Consulte os planos na seção Litch+ para comparar qualidade, dispositivos e benefícios.` : `${game.name} não está marcado como parte do Litch+ na vitrine atual; ele aparece para compra na Game Store por ${game.price}.`;
        }
        if (game && includesAny(text, ['online', 'multiplayer', 'coop', 'co-op', 'jogar com'])) {
            return game.online ? `${game.name} está na seção Online Games e é descrito como ${game.genres.join(', ')}.` : `${game.name} não está listado na seção Online Games. A página o apresenta como ${game.genres.join(', ')}.`;
        }
        if (game) return formatGame(game) + ' Posso detalhar preço, desconto, gênero ou disponibilidade no Litch+.';

        if (includesAny(text, ['litch+', 'litch plus', 'assinatura', 'streaming', 'console'])) {
            return 'Litch+ é a experiência de streaming da plataforma: permite jogar no PC, celular, tablet ou TV, sem console. A página apresenta os planos Basic, Standard e Ultra com diferentes qualidades e limites de dispositivos.';
        }
        if (includesAny(text, ['jogos online', 'online games', 'multiplayer', 'co-op', 'coop'])) {
            return `Na seção Online Games estão: ${gameList(item => item.online)}. Posso informar o preço ou o gênero de qualquer um deles.`;
        }
        if (includesAny(text, ['desconto', 'promocao', 'promocoes', 'oferta', 'mais barato'])) {
            return `Os descontos exibidos na Store incluem: ${gameList(item => item.discount)}. Os valores podem ser consultados diretamente na seção Game Store.`;
        }
        if (includesAny(text, ['recomenda', 'indica', 'sugestao', 'melhor jogo'])) {
            return 'Para aventura, veja Peak, Crimson Desert ou Sea Of Thieves. Para multiplayer, há Minecraft, Counter Strike 2, Dead By Daylight e Diablo IV. Para RPG, uma opção é Dark Souls 3 ou Diablo IV.';
        }
        if (includesAny(text, ['comprar', 'compra', 'adquirir', 'loja', 'store', 'game store', 'pagamento'])) {
            return 'A Game Store reúne os títulos, gêneros e preços exibidos na Home. Escolha um card para consultar a oferta. Como este é um protótipo visual, ainda não há checkout, pagamento ou biblioteca de usuário implementados.';
        }
        if (includesAny(text, ['o que e litch', 'sobre litch', 'plataforma', 'what is litch'])) {
            return 'Litch é uma plataforma de jogos focada em descoberta e acesso a títulos. A Home reúne a Game Store, jogos online, Litch+ e avaliações da comunidade.';
        }
        if (includesAny(text, ['comunidade', 'avaliacao', 'reviews', 'nota', 'opiniao'])) {
            return 'A comunidade avalia a Litch em 4,8 de 5, com base em 2.847 avaliações. Os comentários destacam a interface organizada, o design moderno, a variedade de jogos e a seção Online Games.';
        }
        if (includesAny(text, ['onde', 'navegar', 'encontrar', 'secao', 'pagina', 'home'])) {
            return 'Use a navegação superior: Home mostra os destaques; Game Store reúne jogos e preços; Litch+ mostra streaming, planos e biblioteca; Community traz avaliações; Help-Me! é esta área de suporte.';
        }
        if (includesAny(text, ['conta', 'login', 'senha', 'cadastro', 'reembolso', 'cancelar', 'suporte', 'problema', 'erro', 'bug', 'atendente'])) {
            return 'Ainda não há login, conta, checkout, reembolso ou atendimento humano implementados neste protótipo. Posso ajudar a interpretar as informações visíveis sobre jogos, planos e navegação.';
        }

        return 'Ainda não encontrei essa informação na Litch. Tente perguntar pelo nome de um jogo, por exemplo “quanto custa Crimson Desert?”, ou sobre preços, descontos, jogos online, planos Litch+ ou avaliações da comunidade.';
    }

    async function requestAnswer(userText) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, history: state.history })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.answer) return data.answer;
            }
        } catch (error) {
            // Abrir o HTML diretamente ou ficar sem rede deve continuar funcionando.
        }
        return getAnswer(userText);
    }

    function escapeHTML(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(text, sender = 'bot') {
        const wrapper = document.createElement('div');
        wrapper.className = `ai-message ai-message--${sender}`;
        const avatar = document.createElement('div');
        avatar.className = 'ai-message__avatar';
        avatar.textContent = sender === 'bot' ? 'L' : 'U';
        const content = document.createElement('div');
        content.className = 'ai-message__content';
        const name = document.createElement('strong');
        name.textContent = sender === 'bot' ? 'Litch AI' : 'Você';
        const paragraph = document.createElement('p');
        paragraph.innerHTML = escapeHTML(text);
        content.append(name, paragraph);
        wrapper.append(avatar, content);
        messagesEl.appendChild(wrapper);
        scrollToBottom();
        return wrapper;
    }

    function showTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-message ai-message--bot ai-message--typing';
        const avatar = document.createElement('div');
        avatar.className = 'ai-message__avatar';
        avatar.textContent = 'L';
        const content = document.createElement('div');
        content.className = 'ai-message__content';
        content.innerHTML = '<span class="ai-typing-dot"></span><span class="ai-typing-dot"></span><span class="ai-typing-dot"></span>';
        wrapper.append(avatar, content);
        messagesEl.appendChild(wrapper);
        scrollToBottom();
        return wrapper;
    }

    function handleSend() {
        const text = inputEl.value.trim();
        if (!text) return;
        if (containsBlockedTerm(text)) {
            inputEl.value = '';
            addMessage('Vamos manter a conversa respeitosa. Posso ajudar com jogos, preços, planos Litch+ e recursos da plataforma.');
            inputEl.focus();
            return;
        }
        addMessage(text, 'user');
        inputEl.value = '';
        inputEl.focus();
        const typingBubble = showTypingIndicator();
        window.setTimeout(async () => {
            typingBubble.remove();
            const answer = await requestAnswer(text);
            state.history.push({ role: 'user', content: text }, { role: 'assistant', content: answer });
            state.history = state.history.slice(-6);
            addMessage(answer);
        }, 450);
    }

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSend();
        }
    });
    suggestionBtns.forEach(button => button.addEventListener('click', () => {
        inputEl.value = button.textContent.trim();
        handleSend();
    }));
});
