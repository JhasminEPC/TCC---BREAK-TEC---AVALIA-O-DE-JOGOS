
// ==========================================
// BREAK TEC - GAME VAULT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("vaultModal");
    const modalTitulo = document.getElementById("vaultModalTitulo");
    const modalFechar = document.getElementById("vaultFecharModal");

    const busca = document.getElementById("vaultBusca");
    const resultados = document.getElementById("vaultResultados");
    const modalMensagem = document.getElementById("vaultModalMensagem");

    const secaoVault = document.querySelector(".game-vault");

    const slots = {
        favorito: {
            botao: document.getElementById("vaultFavorito"),
            titulo: "Jogo favorito",
            descricao: "Seu jogo favorito de todos os tempos."
        },

        jogando: {
            botao: document.getElementById("vaultJogando"),
            titulo: "Jogando atualmente",
            descricao: "O jogo que está na sua lista atual."
        },

        quero_jogar: {
            botao: document.getElementById("vaultDesejados"),
            titulo: "Quero jogar",
            descricao: "Sua próxima aventura."
        }
    };

    if (
        !modal ||
        !busca ||
        !resultados ||
        !secaoVault ||
        !modalTitulo ||
        !modalFechar ||
        !modalMensagem ||
        Object.values(slots).some(item => !item.botao)
    ) {
        console.error("Elementos do Game Vault não encontrados.");
        return;
    }

    let slotAtual = null;
    let disponivel = false;
    let ocupado = false;

    let temporizador = null;
    let controladorBusca = null;
    let versaoBusca = 0;

    // MENSAGEM GERAL

    const mensagemGeral = document.createElement("p");

    mensagemGeral.className = "vault-mensagem-geral";
    mensagemGeral.setAttribute("role", "status");

    secaoVault.appendChild(mensagemGeral);


    // ======================================
    // MENSAGENS DA PESQUISA
    // ======================================

    function mostrarEstado(texto) {

        resultados.replaceChildren();

        const mensagem = document.createElement("p");

        mensagem.className = "vault-estado";
        mensagem.textContent = texto;

        resultados.appendChild(mensagem);

    }


    // ======================================
    // CONTROLAR BOTÕES
    // ======================================

    function atualizarBotoes() {

        Object.values(slots).forEach(item => {

            item.botao.disabled = !disponivel || ocupado;

            if (item.remover) {
                item.remover.disabled = !disponivel || ocupado;
            }

        });

    }


    // ======================================
    // EXIBIR JOGO NO CARD
    // ======================================

    function atualizarCard(slot, jogo) {

        const item = slots[slot];

        if (!item) return;

        const card = item.botao.closest(".vault-slot");

        if (!card) return;

        const capa = card.querySelector(".vault-capa");
        const descricao = card.querySelector("p");

        if (!capa || !descricao) return;

        capa.replaceChildren();

        // CRIAR BOTÃO DE REMOÇÃO UMA ÚNICA VEZ

        if (!item.remover) {

            const remover = document.createElement("button");

            remover.type = "button";
            remover.className = "vault-remover";
            remover.textContent = "Remover jogo";

            remover.addEventListener("click", () => {
                removerJogo(slot);
            });

            item.botao.insertAdjacentElement(
                "afterend",
                remover
            );

            item.remover = remover;
        }

        // SLOT VAZIO

        if (!jogo) {

            capa.textContent = "+";
            descricao.textContent = item.descricao;

            item.botao.textContent = "Selecionar jogo";
            item.remover.hidden = true;

            atualizarBotoes();
            return;
        }

        // SLOT PREENCHIDO

        const titulo = String(jogo.titulo || "Jogo");

        descricao.textContent = titulo;

        item.botao.textContent = "Trocar jogo";
        item.remover.hidden = false;

        if (jogo.imagem) {

            const imagem = document.createElement("img");

            imagem.src = jogo.imagem;
            imagem.alt = "";
            imagem.loading = "lazy";

            imagem.addEventListener("error", () => {
                capa.textContent = "🎮";
            });

            capa.appendChild(imagem);

        } else {

            capa.textContent = "🎮";

        }

        atualizarBotoes();

    }


    // ======================================
    // CARREGAR JOGOS SALVOS NO MYSQL
    // ======================================

    async function carregarVault() {

        mensagemGeral.textContent =
            "Carregando sua coleção...";

        try {

            const resposta = await fetch(
                "/api/perfil/game-vault"
            );

            if (!resposta.ok) {

                throw new Error(
                    resposta.status === 401
                        ? "Faça login para editar seu Game Vault."
                        : "Não foi possível carregar sua coleção."
                );

            }

            const dados = await resposta.json();

            if (!dados.vault) {
                throw new Error("Resposta do Game Vault inválida.");
            }

            disponivel = true;

            Object.keys(slots).forEach(slot => {
                atualizarCard(slot, dados.vault[slot] || null);
            });

            mensagemGeral.textContent =
                "Sua coleção está pronta para personalização.";

        } catch (erro) {

            disponivel = false;

            mensagemGeral.textContent = erro.message;

            console.error(
                "Erro ao carregar Game Vault:",
                erro
            );

        }

        atualizarBotoes();

    }


    // ======================================
    // CANCELAR PESQUISAS PENDENTES
    // ======================================

    function cancelarBusca() {

        clearTimeout(temporizador);

        versaoBusca++;

        if (controladorBusca) {
            controladorBusca.abort();
            controladorBusca = null;
        }

    }


    // ======================================
    // ABRIR JANELA
    // ======================================

    function abrirModal(slot) {

        if (!disponivel || ocupado) return;

        slotAtual = slot;

        modalTitulo.textContent =
            slots[slot].titulo;

        busca.value = "";
        busca.disabled = false;

        modalMensagem.textContent = "";

        mostrarEstado(
            "Digite pelo menos duas letras para pesquisar."
        );

        cancelarBusca();

        modal.showModal();
        busca.focus();

    }


    // ======================================
    // CRIAR RESULTADO DA RAWG
    // ======================================

    function criarResultadoJogo(jogo) {

        const rawgId = Number(jogo.id_externo);

        if (!Number.isSafeInteger(rawgId) || rawgId <= 0) {
            return null;
        }

        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "vault-resultado-item";

        // CAPA

        const capa = document.createElement("div");

        capa.className = "vault-resultado-capa";

        if (jogo.imagem) {

            const imagem = document.createElement("img");

            imagem.src = jogo.imagem;
            imagem.alt = "";
            imagem.loading = "lazy";

            imagem.addEventListener("error", () => {
                capa.textContent = "🎮";
            });

            capa.appendChild(imagem);

        } else {

            capa.textContent = "🎮";

        }

        // DADOS DO JOGO

        const informacoes = document.createElement("div");

        informacoes.className = "vault-resultado-info";

        const titulo = document.createElement("strong");
        titulo.textContent = jogo.titulo || "Jogo sem título";

        const genero = document.createElement("span");
        genero.textContent = jogo.genero || "Jogo oficial";

        informacoes.append(titulo, genero);

        const acao = document.createElement("span");

        acao.className = "vault-resultado-acao";
        acao.textContent = "Selecionar";

        botao.append(capa, informacoes, acao);

        botao.addEventListener("click", () => {
            salvarJogo(rawgId);
        });

        return botao;

    }


    // ======================================
    // PESQUISAR JOGOS OFICIAIS
    // ======================================

    async function pesquisarJogos(termo) {

        cancelarBusca();

        const minhaVersao = versaoBusca;

        if (termo.length < 2) {

            mostrarEstado(
                "Digite pelo menos duas letras para pesquisar."
            );

            return;
        }

        const controlador = new AbortController();

        controladorBusca = controlador;

        mostrarEstado("Buscando jogos oficiais...");

        try {

            const resposta = await fetch(
                `/api/jogos-oficiais?busca=${encodeURIComponent(termo)}`,
                {
                    signal: controlador.signal
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível pesquisar os jogos."
                );
            }

            const dados = await resposta.json();

            if (minhaVersao !== versaoBusca) {
                return;
            }

            resultados.replaceChildren();

            const jogos = Array.isArray(dados.jogos)
                ? dados.jogos
                : [];

            let encontrados = 0;

            jogos.forEach(jogo => {

                const elemento = criarResultadoJogo(jogo);

                if (elemento) {
                    resultados.appendChild(elemento);
                    encontrados++;
                }

            });

            if (encontrados === 0) {
                mostrarEstado("Nenhum jogo encontrado.");
            }

        } catch (erro) {

            if (erro.name === "AbortError") {
                return;
            }

            if (minhaVersao === versaoBusca) {

                mostrarEstado(
                    "Erro ao pesquisar jogos. Tente novamente."
                );

                console.error(
                    "Erro na busca do Game Vault:",
                    erro
                );

            }

        } finally {

            if (controladorBusca === controlador) {
                controladorBusca = null;
            }

        }

    }


    // ======================================
    // SALVAR JOGO ESCOLHIDO
    // ======================================

    async function salvarJogo(rawgId) {

        if (!slotAtual || ocupado) return;

        const slotSelecionado = slotAtual;

        ocupado = true;
        busca.disabled = true;
        modalFechar.disabled = true;

        resultados.querySelectorAll("button").forEach(botao => {
            botao.disabled = true;
        });

        modalMensagem.textContent = "Salvando jogo...";

        atualizarBotoes();

        try {

            const resposta = await fetch(
                `/api/perfil/game-vault/${slotSelecionado}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        rawg_id: rawgId
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    "Não foi possível salvar o jogo."
                );
            }

            atualizarCard(
                slotSelecionado,
                dados.jogo
            );

            mensagemGeral.textContent =
                "Jogo salvo no Game Vault com sucesso!";

            modal.close();

        } catch (erro) {

            modalMensagem.textContent = erro.message;

            console.error(
                "Erro ao salvar jogo:",
                erro
            );

        } finally {

            ocupado = false;

            busca.disabled = false;
            modalFechar.disabled = false;

            resultados.querySelectorAll("button").forEach(botao => {
                botao.disabled = false;
            });

            atualizarBotoes();

        }

    }


    // ======================================
    // REMOVER JOGO DO SLOT
    // ======================================

    async function removerJogo(slot) {

        if (!disponivel || ocupado) return;

        const confirmar = window.confirm(
            "Deseja remover este jogo do Game Vault?"
        );

        if (!confirmar) return;

        ocupado = true;
        atualizarBotoes();

        mensagemGeral.textContent = "Removendo jogo...";

        try {

            const resposta = await fetch(
                `/api/perfil/game-vault/${slot}`,
                {
                    method: "DELETE"
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    "Não foi possível remover o jogo."
                );
            }

            atualizarCard(slot, null);

            mensagemGeral.textContent =
                "Jogo removido com sucesso.";

        } catch (erro) {

            mensagemGeral.textContent = erro.message;

            console.error(
                "Erro ao remover jogo:",
                erro
            );

        } finally {

            ocupado = false;
            atualizarBotoes();

        }

    }


    // ======================================
    // EVENTOS DOS TRÊS BOTÕES
    // ======================================

    Object.entries(slots).forEach(([slot, item]) => {

        item.botao.addEventListener("click", () => {
            abrirModal(slot);
        });

    });


    // ======================================
    // PESQUISA ENQUANTO DIGITA
    // ======================================

    busca.addEventListener("input", () => {

        clearTimeout(temporizador);

        const termo = busca.value.trim();

        cancelarBusca();

        if (termo.length < 2) {

            mostrarEstado(
                "Digite pelo menos duas letras para pesquisar."
            );

            return;
        }

        temporizador = setTimeout(() => {
            pesquisarJogos(termo);
        }, 350);

    });


    // ======================================
    // PESQUISAR COM ENTER
    // ======================================

    busca.addEventListener("keydown", evento => {

        if (evento.key === "Enter") {

            evento.preventDefault();

            clearTimeout(temporizador);

            pesquisarJogos(busca.value.trim());

        }

    });


    // ======================================
    // FECHAR A JANELA
    // ======================================

    modalFechar.addEventListener("click", () => {
        if (!ocupado) {
            modal.close();
        }
    });

    modal.addEventListener("cancel", evento => {

        if (ocupado) {
            evento.preventDefault();
        }

    });

    modal.addEventListener("close", () => {

        cancelarBusca();
        slotAtual = null;

    });


    // ======================================
    // INICIAR GAME VAULT
    // ======================================

    carregarVault();

});
