
// ==========================================
// BREAK TEC - PESQUISA DE MEMBROS NA HOME
// ==========================================

(() => {

    const campo = document.getElementById("searchInput");
    const botao = document.getElementById("searchButton");

    const resultados = document.getElementById(
        "resultadosMembrosHome"
    );

    if (!campo || !botao || !resultados) {
        return;
    }

    let temporizador = null;
    let requisicaoAtual = null;
    let versaoPesquisa = 0;


    // ======================================
    // ESCONDER RESULTADOS
    // ======================================

    function esconderResultados() {

        resultados.hidden = true;
        resultados.replaceChildren();

    }


    // ======================================
    // MOSTRAR MENSAGEM
    // ======================================

    function mostrarMensagem(texto) {

        resultados.replaceChildren();

        const mensagem = document.createElement("p");

        mensagem.className = "busca-membros-mensagem";
        mensagem.textContent = texto;

        resultados.appendChild(mensagem);

        resultados.hidden = false;

    }


    // ======================================
    // CRIAR CARD DE MEMBRO
    // ======================================

    function criarResultadoMembro(membro) {

        const id = Number(membro.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return null;
        }

        const nome =
            typeof membro.nome === "string" &&
            membro.nome.trim()
                ? membro.nome.trim()
                : "Jogador";

        const link = document.createElement("a");

        link.className = "busca-membros-item";
        link.href = `pages/usuario.html?id=${id}`;

        // AVATAR

        const avatar = document.createElement("span");

        avatar.className = "busca-membros-avatar";
        avatar.textContent = nome.charAt(0).toUpperCase();

        avatar.setAttribute("aria-hidden", "true");

        // INFORMAÇÕES

        const informacoes = document.createElement("span");

        informacoes.className = "busca-membros-info";

        const titulo = document.createElement("strong");
        titulo.textContent = nome;

        const subtitulo = document.createElement("small");
        subtitulo.textContent = "Ver perfil público";

        informacoes.append(titulo, subtitulo);

        // SETA

        const seta = document.createElement("span");

        seta.className = "busca-membros-seta";
        seta.textContent = "↗";

        seta.setAttribute("aria-hidden", "true");

        link.append(avatar, informacoes, seta);

        return link;

    }


    // ======================================
    // PESQUISAR NO MYSQL PELA API
    // ======================================

    async function pesquisarMembros() {

        const termo = campo.value.trim();

        versaoPesquisa++;

        const versaoAtual = versaoPesquisa;

        // CANCELAR PESQUISA ANTERIOR

        if (requisicaoAtual) {
            requisicaoAtual.abort();
        }

        if (termo.length < 2) {
            esconderResultados();
            return;
        }

        if (termo.length > 60) {
            mostrarMensagem(
                "Digite no máximo 60 caracteres."
            );
            return;
        }

        const controlador = new AbortController();

        requisicaoAtual = controlador;

        mostrarMensagem("Buscando membros...");

        try {

            const resposta = await fetch(
                `/api/usuarios/publicos?busca=${encodeURIComponent(termo)}&pagina=1`,
                {
                    signal: controlador.signal
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível realizar a pesquisa."
                );
            }

            const dados = await resposta.json();

            // IGNORAR RESPOSTAS ANTIGAS

            if (versaoAtual !== versaoPesquisa) {
                return;
            }

            const membros = Array.isArray(dados.usuarios)
                ? dados.usuarios.slice(0, 5)
                : [];

            resultados.replaceChildren();

            if (membros.length === 0) {

                mostrarMensagem(
                    "Nenhum membro público encontrado."
                );

                return;
            }

            // TÍTULO DA LISTA

            const titulo = document.createElement("p");

            titulo.className = "busca-membros-titulo";
            titulo.textContent = "MEMBROS DA COMUNIDADE";

            resultados.appendChild(titulo);

            // ADICIONAR MEMBROS

            membros.forEach(membro => {

                const card = criarResultadoMembro(membro);

                if (card) {
                    resultados.appendChild(card);
                }

            });

            resultados.hidden = false;

        } catch (erro) {

            if (erro.name === "AbortError") {
                return;
            }

            if (versaoAtual === versaoPesquisa) {

                mostrarMensagem(
                    "Não foi possível buscar membros agora."
                );

                console.error(
                    "Erro na pesquisa de membros:",
                    erro
                );

            }

        } finally {

            if (requisicaoAtual === controlador) {
                requisicaoAtual = null;
            }

        }

    }


    // ======================================
    // PESQUISAR ENQUANTO DIGITA
    // ======================================

    campo.addEventListener("input", () => {

        clearTimeout(temporizador);

        temporizador = setTimeout(
            pesquisarMembros,
            300
        );

    });


    // ======================================
    // PESQUISAR AO CLICAR NA LUPA
    // ======================================

    botao.addEventListener("click", () => {

        clearTimeout(temporizador);

        pesquisarMembros();

    });


    // ======================================
    // FECHAR COM ESC
    // ======================================

    campo.addEventListener("keydown", evento => {

        if (evento.key === "Escape") {

            clearTimeout(temporizador);

            versaoPesquisa++;

            if (requisicaoAtual) {
                requisicaoAtual.abort();
            }

            esconderResultados();

        }

    });


    // ======================================
    // FECHAR AO CLICAR FORA
    // ======================================

    document.addEventListener("click", evento => {

        const container = campo.closest(
            ".search-container"
        );

        if (
            container &&
            !container.contains(evento.target)
        ) {
            esconderResultados();
        }

    });

})();
