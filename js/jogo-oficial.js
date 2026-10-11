// ====================================
// BREAK TEC - PÁGINA DE JOGOS OFICIAIS
// ====================================

// ELEMENTOS DO HTML

const jogoCarregando =
    document.getElementById("jogoCarregando");

const jogoErro =
    document.getElementById("jogoErro");

const jogoConteudo =
    document.getElementById("jogoConteudo");

const jogoImagem =
    document.getElementById("jogoImagem");

const jogoTitulo =
    document.getElementById("jogoTitulo");

const jogoDesenvolvedora =
    document.getElementById("jogoDesenvolvedora");

const jogoPublicadora =
    document.getElementById("jogoPublicadora");

const jogoGenero =
    document.getElementById("jogoGenero");

const jogoLancamento =
    document.getElementById("jogoLancamento");

const jogoDescricao =
    document.getElementById("jogoDescricao");

const jogoFonteLink =
    document.getElementById("jogoFonteLink");


// ====================================
// IDENTIFICAR O JOGO PELA URL
// ====================================

const parametrosURL =
    new URLSearchParams(window.location.search);

const jogoId =
    parametrosURL.get("id");


// ====================================
// FORMATAR DATA DE LANÇAMENTO
// ====================================

function formatarLancamento(data) {

    if (!data) {
        return "Não informado";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    const [ano, mes, dia] = partes.map(Number);

    const dataFormatada =
        new Date(ano, mes - 1, dia);

    if (Number.isNaN(dataFormatada.getTime())) {
        return "Não informado";
    }

    return dataFormatada.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


// ====================================
// FORMATAR LISTAS DE INFORMAÇÕES
// ====================================

function formatarLista(lista) {

    if (!Array.isArray(lista) || lista.length === 0) {
        return "Não informado";
    }

    return lista.join(", ");
}


// ====================================
// EXIBIR MENSAGEM DE ERRO
// ====================================

function exibirErro(mensagem) {

    jogoErro.textContent = mensagem;

    jogoErro.hidden = false;

    jogoConteudo.hidden = true;
}


// ====================================
// CARREGAR INFORMAÇÕES DO JOGO
// ====================================

async function carregarJogoOficial() {

    const idNumerico = Number(jogoId);

    // VERIFICA SE O ID É VÁLIDO

    if (
        !jogoId ||
        !Number.isSafeInteger(idNumerico) ||
        idNumerico <= 0
    ) {

        jogoCarregando.hidden = true;

        exibirErro(
            "Jogo inválido. Volte à página inicial e escolha um jogo."
        );

        return;
    }


    try {

        // CONSULTAR NOSSO SERVIDOR

        const resposta = await fetch(
            `/api/jogos-oficiais/${idNumerico}`
        );


        if (!resposta.ok) {

            if (resposta.status === 404) {
                throw new Error("Jogo não encontrado.");
            }

            throw new Error(
                "Não foi possível carregar as informações do jogo."
            );
        }


        const dados = await resposta.json();

        const jogo = dados.jogo;


        if (!jogo) {
            throw new Error("Dados do jogo indisponíveis.");
        }


        // ====================================
        // TÍTULO
        // ====================================

        jogoTitulo.textContent =
            jogo.titulo || "Jogo sem título";

        document.title =
            `${jogo.titulo || "Jogo Oficial"} | Break Tec`;


        // ====================================
        // IMAGEM
        // ====================================

        const capaContainer =
            jogoImagem.parentElement;

        function mostrarImagemIndisponivel() {

            jogoImagem.hidden = true;

            if (!capaContainer.querySelector(".jogo-sem-capa")) {

                const aviso = document.createElement("div");

                aviso.className = "jogo-sem-capa";

                aviso.textContent = "Imagem indisponível";

                capaContainer.appendChild(aviso);
            }
        }

        if (jogo.imagem) {

            jogoImagem.alt =
                `Imagem ilustrativa do jogo ${jogo.titulo}`;

            jogoImagem.onerror = mostrarImagemIndisponivel;

            jogoImagem.src = jogo.imagem;

        } else {

            mostrarImagemIndisponivel();
        }


        // ====================================
        // DESENVOLVEDORA E PUBLICADORA
        // ====================================

        jogoDesenvolvedora.textContent =
            formatarLista(jogo.desenvolvedores);

        jogoPublicadora.textContent =
            formatarLista(jogo.publicadoras);


        // ====================================
        // GÊNERO
        // ====================================

        jogoGenero.textContent =
            jogo.genero || "Não informado";


        // ====================================
        // DATA DE LANÇAMENTO
        // ====================================

        jogoLancamento.textContent =
            formatarLancamento(jogo.lancamento);


        // ====================================
        // DESCRIÇÃO
        // ====================================

        jogoDescricao.textContent =
            jogo.descricao ||
            "Este jogo ainda não possui uma descrição disponível.";


        // ====================================
        // FONTE DOS DADOS
        // ====================================

        const fonte = jogo.fonte_url;

        if (
            typeof fonte === "string" &&
            /^https:\/\/(www\.)?rawg\.io\//.test(fonte)
        ) {

            jogoFonteLink.href = fonte;

        } else {

            jogoFonteLink.href = "https://rawg.io/";
        }


        // ====================================
        // EXIBIR CONTEÚDO
        // ====================================

        jogoConteudo.hidden = false;


    } catch (erro) {

        console.error(
            "Erro ao carregar jogo oficial:",
            erro
        );

        exibirErro(erro.message);


    } finally {

        // REMOVE MENSAGEM DE CARREGAMENTO

        jogoCarregando.hidden = true;

    }
}


// ====================================
// INICIAR PÁGINA
// ====================================

carregarJogoOficial();


// ====================================
// BREAK SCORE - JOGOS OFICIAIS
// ====================================

const categoriasOficiais = [
    "jogabilidade",
    "historia",
    "visual",
    "som",
    "originalidade"
];

const notasOficiais = {
    jogabilidade: 0,
    historia: 0,
    visual: 0,
    som: 0,
    originalidade: 0
};

const formularioOficial =
    document.getElementById("avaliacaoOficialForm");

const avaliacaoLogin =
    document.getElementById("avaliacaoLogin");

const avaliacaoStatus =
    document.getElementById("avaliacaoStatus");

const botaoEnviarOficial =
    document.getElementById("enviarAvaliacaoOficial");

const idOficial = Number(jogoId);


// ====================================
// ATUALIZAR AS ESTRELAS
// ====================================

function atualizarEstrelasOficiais(categoria) {

    const container = document.querySelector(
        `.avaliacao-estrelas[data-categoria="${categoria}"]`
    );

    if (!container) return;

    const botoes = container.querySelectorAll("button");

    botoes.forEach((botao, indice) => {

        const selecionada =
            indice < notasOficiais[categoria];

        botao.classList.toggle("ativa", selecionada);

        botao.setAttribute(
            "aria-pressed",
            String(selecionada)
        );

    });
}


// ====================================
// CRIAR ESTRELAS INTERATIVAS
// ====================================

function criarEstrelasOficiais() {

    categoriasOficiais.forEach(categoria => {

        const container = document.querySelector(
            `.avaliacao-estrelas[data-categoria="${categoria}"]`
        );

        if (!container) return;

        container.replaceChildren();

        for (let nota = 1; nota <= 5; nota++) {

            const estrela = document.createElement("button");

            estrela.type = "button";

            estrela.textContent = "★";

            estrela.setAttribute(
                "aria-label",
                `${nota} ${nota === 1 ? "estrela" : "estrelas"} para ${categoria}`
            );

            estrela.setAttribute(
                "aria-pressed",
                "false"
            );

            estrela.addEventListener("click", () => {

                notasOficiais[categoria] = nota;

                atualizarEstrelasOficiais(categoria);

            });

            container.appendChild(estrela);
        }

        atualizarEstrelasOficiais(categoria);
    });
}


// ====================================
// CARREGAR BREAK SCORE
// ====================================

async function carregarBreakScoreOficial() {

    const resposta = await fetch(
        `/api/jogos-oficiais/${idOficial}/dna`
    );

    if (!resposta.ok) {
        throw new Error("Erro ao carregar o Break Score.");
    }

    const dna = await resposta.json();

    const total = Number(dna.totalAvaliacoes) || 0;

    const valor = document.getElementById("breakScoreValor");

    const totalElemento =
        document.getElementById("breakScoreTotal");

    valor.textContent = total > 0
        ? Number(dna.breakScore).toFixed(1)
        : "—";

    totalElemento.textContent = total === 1
        ? "1 avaliação"
        : `${total} avaliações`;


    // MÉDIAS DO DNA DO JOGO

    const campos = {
        jogabilidade: "dnaJogabilidade",
        historia: "dnaHistoria",
        visual: "dnaVisual",
        som: "dnaSom",
        originalidade: "dnaOriginalidade"
    };

    categoriasOficiais.forEach(categoria => {

        const elemento =
            document.getElementById(campos[categoria]);

        if (!elemento) return;

        elemento.textContent = total > 0
            ? Number(dna[categoria]).toFixed(1)
            : "—";

    });
}


// ====================================
// VERIFICAR SESSÃO DO USUÁRIO
// ====================================

async function verificarSessaoAvaliacaoOficial() {

    try {

        const resposta = await fetch("/api/sessao");

        if (resposta.status === 401) {

            formularioOficial.hidden = true;
            avaliacaoLogin.hidden = false;

            avaliacaoStatus.textContent =
                "Entre na sua conta para participar.";

            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro ao verificar sessão.");
        }

        const dados = await resposta.json();

        if (!dados.logado) {

            formularioOficial.hidden = true;
            avaliacaoLogin.hidden = false;

            avaliacaoStatus.textContent =
                "Entre na sua conta para participar.";

            return;
        }

        // USUÁRIO LOGADO

        formularioOficial.hidden = false;
        avaliacaoLogin.hidden = true;

        avaliacaoStatus.textContent =
            "Carregando sua avaliação...";

        await carregarMinhaAvaliacaoOficial();

    } catch (erro) {

        console.error(erro);

        avaliacaoStatus.textContent =
            "Não foi possível verificar sua sessão. Recarregue a página.";
    }
}


// ====================================
// CARREGAR AVALIAÇÃO JÁ REALIZADA
// ====================================

async function carregarMinhaAvaliacaoOficial() {

    const resposta = await fetch(
        `/api/jogos-oficiais/${idOficial}/minha-avaliacao`
    );

    if (!resposta.ok) {
        throw new Error("Erro ao carregar sua avaliação.");
    }

    const dados = await resposta.json();

    if (!dados.avaliou) {

        avaliacaoStatus.textContent =
            "Você ainda não avaliou este jogo.";

        botaoEnviarOficial.textContent =
            "Enviar avaliação";

        return;
    }

    // RECUPERA AS NOTAS SALVAS NO MYSQL

    categoriasOficiais.forEach(categoria => {

        notasOficiais[categoria] =
            Number(dados.avaliacao[categoria]) || 0;

        atualizarEstrelasOficiais(categoria);

    });

    avaliacaoStatus.textContent =
        "Você já avaliou este jogo. Pode atualizar suas notas.";

    botaoEnviarOficial.textContent =
        "Atualizar avaliação";
}


// ====================================
// ENVIAR AVALIAÇÃO
// ====================================

async function enviarAvaliacaoOficial(event) {

    event.preventDefault();

    // VERIFICA SE TODAS AS CATEGORIAS FORAM AVALIADAS

    const todasPreenchidas =
        categoriasOficiais.every(categoria => {

            const nota = notasOficiais[categoria];

            return Number.isInteger(nota) &&
                nota >= 1 &&
                nota <= 5;

        });

    if (!todasPreenchidas) {

        avaliacaoStatus.textContent =
            "Selecione de 1 a 5 estrelas em todas as categorias.";

        return;
    }


    botaoEnviarOficial.disabled = true;

    botaoEnviarOficial.textContent = "Salvando...";

    avaliacaoStatus.textContent =
        "Enviando sua avaliação...";


    try {

        const resposta = await fetch(
            `/api/jogos-oficiais/${idOficial}/avaliacoes`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "same-origin",

                body: JSON.stringify(notasOficiais)
            }
        );

        const dados = await resposta.json();


        if (resposta.status === 401) {

            formularioOficial.hidden = true;
            avaliacaoLogin.hidden = false;

            avaliacaoStatus.textContent =
                "Sua sessão expirou. Entre novamente para avaliar.";

            return;
        }


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível salvar a avaliação."
            );
        }


        // AVALIAÇÃO SALVA

        avaliacaoStatus.textContent =
            "Avaliação salva com sucesso!";

        botaoEnviarOficial.textContent =
            "Atualizar avaliação";


        // ATUALIZA A PONTUAÇÃO SEM RECARREGAR A PÁGINA

        try {

            await carregarBreakScoreOficial();

        } catch (erro) {

            console.error(
                "Avaliação salva, mas houve erro ao atualizar o Break Score:",
                erro
            );

            avaliacaoStatus.textContent =
                "Avaliação salva! Recarregue a página para atualizar a pontuação.";
        }


    } catch (erro) {

        console.error(
            "Erro ao enviar avaliação:",
            erro
        );

        avaliacaoStatus.textContent = erro.message;

    } finally {

        botaoEnviarOficial.disabled = false;

        if (botaoEnviarOficial.textContent === "Salvando...") {
            botaoEnviarOficial.textContent = "Enviar avaliação";
        }
    }
}


// ====================================
// INICIAR SISTEMA DE AVALIAÇÕES
// ====================================

async function iniciarAvaliacoesOficiais() {

    if (
        !Number.isSafeInteger(idOficial) ||
        idOficial <= 0
    ) {
        return;
    }

    if (
        !formularioOficial ||
        !avaliacaoLogin ||
        !avaliacaoStatus ||
        !botaoEnviarOficial
    ) {
        return;
    }

    criarEstrelasOficiais();

    formularioOficial.addEventListener(
        "submit",
        enviarAvaliacaoOficial
    );

    // CARREGA A PONTUAÇÃO PÚBLICA

    carregarBreakScoreOficial().catch(erro => {

        console.error(erro);

        document.getElementById(
            "breakScoreTotal"
        ).textContent =
            "Não foi possível carregar as avaliações.";
    });

    // VERIFICA SE O VISITANTE PODE AVALIAR

    await verificarSessaoAvaliacaoOficial();
}


// EXECUTA AS NOVAS FUNCIONALIDADES

iniciarAvaliacoesOficiais();


// ==========================================
// FAVORITOS - JOGOS OFICIAIS
// ==========================================

const favoritoOficialBotao =
    document.getElementById("favoritoOficialBotao");

const favoritoOficialTexto =
    document.getElementById("favoritoOficialTexto");

const favoritoOficialLogin =
    document.getElementById("favoritoOficialLogin");

const favoritoOficialStatus =
    document.getElementById("favoritoOficialStatus");

let jogoEstaFavoritado = false;


// ==========================================
// ATUALIZAR APARÊNCIA DO BOTÃO
// ==========================================

function atualizarBotaoFavoritoOficial(favoritado) {

    jogoEstaFavoritado = favoritado;

    favoritoOficialBotao.classList.toggle(
        "favoritado",
        favoritado
    );

    favoritoOficialBotao.setAttribute(
        "aria-pressed",
        String(favoritado)
    );

    favoritoOficialTexto.textContent = favoritado
        ? "Remover dos favoritos"
        : "Adicionar aos favoritos";

    const coracao =
        favoritoOficialBotao.querySelector(
            ".favorito-coracao"
        );

    coracao.textContent = favoritado ? "♥" : "♡";
}


// ==========================================
// EXIBIR OPÇÃO DE LOGIN
// ==========================================

function mostrarLoginFavoritoOficial() {

    favoritoOficialBotao.hidden = true;

    favoritoOficialLogin.hidden = false;

    favoritoOficialStatus.textContent =
        "Faça login para salvar este jogo.";
}


// ==========================================
// VERIFICAR ESTADO DO FAVORITO
// ==========================================

async function verificarFavoritoOficial() {

    favoritoOficialBotao.hidden = true;
    favoritoOficialLogin.hidden = true;

    favoritoOficialStatus.textContent =
        "Verificando favoritos...";

    try {

        const resposta = await fetch(
            `/api/jogos-oficiais/${idOficial}/favoritos/status`
        );

        if (resposta.status === 401) {

            mostrarLoginFavoritoOficial();

            return;
        }

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível verificar seus favoritos."
            );
        }

        const dados = await resposta.json();

        atualizarBotaoFavoritoOficial(
            Boolean(dados.favoritado)
        );

        favoritoOficialBotao.hidden = false;

        favoritoOficialStatus.textContent = "";

    } catch (erro) {

        console.error(
            "Erro ao verificar favorito:",
            erro
        );

        favoritoOficialStatus.textContent =
            "Não foi possível carregar o favorito. Recarregue a página.";
    }
}


// ==========================================
// ADICIONAR OU REMOVER FAVORITO
// ==========================================

async function alternarFavoritoOficial() {

    favoritoOficialBotao.disabled = true;

    const estavaFavoritado = jogoEstaFavoritado;

    favoritoOficialStatus.textContent =
        estavaFavoritado
            ? "Removendo dos favoritos..."
            : "Adicionando aos favoritos...";

    try {

        const resposta = await fetch(
            `/api/jogos-oficiais/${idOficial}/favoritos`,
            {
                method: estavaFavoritado
                    ? "DELETE"
                    : "POST",

                credentials: "same-origin"
            }
        );

        if (resposta.status === 401) {

            mostrarLoginFavoritoOficial();

            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível atualizar o favorito."
            );
        }

        // ATUALIZA SOMENTE APÓS O SERVIDOR CONFIRMAR

        atualizarBotaoFavoritoOficial(
            Boolean(dados.favoritado)
        );

        favoritoOficialStatus.textContent =
            dados.mensagem ||
            "Favoritos atualizados.";

    } catch (erro) {

        console.error(
            "Erro ao alterar favorito:",
            erro
        );

        favoritoOficialStatus.textContent =
            erro.message;

    } finally {

        favoritoOficialBotao.disabled = false;
    }
}


// ==========================================
// INICIAR SISTEMA DE FAVORITOS
// ==========================================

function iniciarFavoritosOficiais() {

    if (
        !Number.isSafeInteger(idOficial) ||
        idOficial <= 0
    ) {
        return;
    }

    if (
        !favoritoOficialBotao ||
        !favoritoOficialTexto ||
        !favoritoOficialLogin ||
        !favoritoOficialStatus
    ) {
        return;
    }

    favoritoOficialBotao.addEventListener(
        "click",
        alternarFavoritoOficial
    );

    verificarFavoritoOficial();
}


// INICIAR FAVORITOS

iniciarFavoritosOficiais();