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


 // IDENTIFICA INTERNAMENTE A FONTE DO JOGO //

 const fonteJogoOficial =
     parametrosURL.get("fonte") === "igdb"
         ? "igdb"
         : "rawg";

 const consultaFonte =
     fonteJogoOficial === "igdb"
         ? "?fonte=igdb"
         : "";


 // GERA AS ROTAS DA API DE JOGOS OFICIAIS //

 function urlApiOficial(sufixo = "") {

     return `/api/jogos-oficiais/${Number(jogoId)}${sufixo}${consultaFonte}`;
 }


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

        // CONSULTAR NOSSO SERVIDOR //

        const resposta = await fetch(
        urlApiOficial()
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


        // DESENVOLVEDORA E PUBLICADORA //

        jogoDesenvolvedora.textContent =
            formatarLista(jogo.desenvolvedores);

        jogoPublicadora.textContent =
            formatarLista(jogo.publicadoras);


        // GÊNERO //
        jogoGenero.textContent =
            jogo.genero || "Não informado";


        // DATA DE LANÇAMENTO //

        jogoLancamento.textContent =
            formatarLancamento(jogo.lancamento);


        // DESCRIÇÃO //

        jogoDescricao.textContent =
            jogo.descricao ||
            "Este jogo ainda não possui uma descrição disponível.";


        // FONTE DOS DADOS //

        const fonte = jogo.fonte_url;

        const linkIgdb = fonteJogoOficial === "igdb";

        const dominioPermitido = linkIgdb
            ? /^https:\/\/(www\.)?igdb\.com\//
            : /^https:\/\/(www\.)?rawg\.io\//;

        jogoFonteLink.textContent = linkIgdb
            ? "IGDB"
            : "RAWG";

        jogoFonteLink.href =
        typeof fonte === "string" &&
        dominioPermitido.test(fonte)
            ? fonte
            : (
                linkIgdb
                 ? "https://www.igdb.com/"
                 : "https://rawg.io/"
            );



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
        urlApiOficial("/dna")
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
        urlApiOficial("/minha-avaliacao")
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

    document.getElementById(
    "comentarioAvaliacaoOficial"
    ).value = dados.avaliacao.comentario || "";

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
            urlApiOficial("/avaliacoes"),
        {
            method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "same-origin",

                body: JSON.stringify({...notasOficiais,
                comentario: document.getElementById(
                "comentarioAvaliacaoOficial").value.trim()
                })
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

            carregarComentariosBreakTec();

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
            urlApiOficial("/favoritos/status")
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
            urlApiOficial("/favoritos"),
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


/* ==========================================
   BREAK TEC - EXIBIÇÃO DE COMENTÁRIOS
========================================== */

(function () {

    const listaComentarios = document.getElementById(
        "comentariosListaBreakTec"
    );

    const avisoComentarios = document.getElementById(
        "comentariosAvisoBreakTec"
    );

    if (!listaComentarios || !avisoComentarios) return;

    const paginaOficial = Boolean(
        document.getElementById("avaliacaoOficialForm")
    );

    const idJogo = Number(
        new URLSearchParams(window.location.search).get("id")
    );

    const rotaBase = paginaOficial
        ? `/api/jogos-oficiais/${idJogo}`
        : `/api/projetos/${idJogo}`;

        const consultaComentarios = paginaOficial
        ? consultaFonte
        : "";

    const idCampo = paginaOficial
        ? "comentarioAvaliacaoOficial"
        : "comentarioAvaliacaoProjeto";


    function criarElemento(tag, classe, conteudo = "") {

        const elemento = document.createElement(tag);

        if (classe) {
            elemento.className = classe;
        }

        elemento.textContent = conteudo;

        return elemento;
    }


    function editarComentarioBreakTec() {

        const campo = document.getElementById(idCampo);

        if (!campo) return;

        if (!paginaOficial) {
            document.getElementById("avaliarProjeto")?.click();
        } else {
            campo.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        campo.focus();
    }


    async function excluirComentarioBreakTec() {

        const confirmar = confirm(
            "Excluir seu comentário? Suas estrelas serão mantidas."
        );

        if (!confirmar) return;

        avisoComentarios.textContent = "Excluindo comentário...";

        try {

            const resposta = await fetch(
                `${rotaBase}/comentario${consultaComentarios}`,
                {
                    method: "DELETE",
                    credentials: "same-origin"
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Erro ao excluir comentário."
                );
            }

            const campo = document.getElementById(idCampo);

            if (campo) {
                campo.value = "";
            }

            avisoComentarios.textContent = dados.mensagem;

            await carregarComentariosBreakTec();

        } catch (erro) {

            avisoComentarios.textContent = erro.message;
        }
    }


    async function carregarComentariosBreakTec() {

        if (!Number.isSafeInteger(idJogo) || idJogo <= 0) {
            listaComentarios.textContent = "Jogo inválido.";
            return;
        }

        listaComentarios.textContent = "Carregando comentários...";

        try {

            const resposta = await fetch(
                `${rotaBase}/comentarios${consultaComentarios}`,
                { cache: "no-store" }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error("Erro ao carregar comentários.");
            }

            listaComentarios.replaceChildren();

            const comentarios = Array.isArray(dados.comentarios)
                ? dados.comentarios
                : [];

            if (comentarios.length === 0) {

                listaComentarios.appendChild(
                    criarElemento(
                        "p",
                        "comentarios-breaktec-vazio",
                        "Ainda não há comentários. Seja o primeiro a compartilhar sua opinião!"
                    )
                );

                return;
            }


            comentarios.forEach(comentario => {

                const card = criarElemento(
                    "article",
                    "comentarios-breaktec-card"
                );

                const cabecalho = criarElemento(
                    "div",
                    "comentarios-breaktec-cabecalho"
                );

                const avatar = criarElemento(
                    "div",
                    "comentarios-breaktec-avatar"
                );

                const nome = typeof comentario.nome === "string"
                    ? comentario.nome.trim() || "Jogador"
                    : "Jogador";

                const inicial = criarElemento(
                    "span",
                    "",
                    nome.charAt(0).toUpperCase()
                );

                avatar.appendChild(inicial);

                // Foto pública do jogador
                if (comentario.perfil_publico || comentario.meu) {

                    const imagem = document.createElement("img");

                    imagem.alt = "";
                    imagem.loading = "lazy";

                    imagem.onload = () => {
                        inicial.hidden = true;
                    };

                    imagem.onerror = () => {
                        imagem.remove();
                        inicial.hidden = false;
                    };

                    imagem.src =
                        `/api/usuarios/${comentario.autor_id}/foto`;

                    avatar.appendChild(imagem);
                }


                const dadosAutor = criarElemento(
                    "div",
                    "comentarios-breaktec-autor"
                );

                if (comentario.perfil_publico) {

                    const link = criarElemento("a", "", nome);

                    link.href =
                        `usuario.html?id=${comentario.autor_id}`;

                    dadosAutor.appendChild(link);

                } else {

                    dadosAutor.appendChild(
                        criarElemento("strong", "", nome)
                    );
                }


                const data = new Date(comentario.criado_em);

                dadosAutor.appendChild(
                    criarElemento(
                        "small",
                        "",
                        Number.isNaN(data.getTime())
                            ? ""
                            : data.toLocaleDateString("pt-BR")
                    )
                );

                cabecalho.appendChild(avatar);
                cabecalho.appendChild(dadosAutor);


                const nota = Number(comentario.nota) * 2;

                const pontuacao = Number.isFinite(nota)
                    ? nota.toFixed(1)
                    : "—";

                const notaElemento = criarElemento(
                    "span",
                    "comentarios-breaktec-nota",
                    `★ ${pontuacao}/10`
                );

                const textoComentario = criarElemento(
                    "p",
                    "comentarios-breaktec-texto",
                    comentario.comentario || ""
                );


                card.appendChild(cabecalho);
                card.appendChild(notaElemento);
                card.appendChild(textoComentario);


                // Somente o autor visualiza estes botões
                if (comentario.meu) {

                    const acoes = criarElemento(
                        "div",
                        "comentarios-breaktec-acoes"
                    );

                    const editar = criarElemento(
                        "button",
                        "",
                        "Editar comentário"
                    );

                    editar.type = "button";

                    editar.addEventListener(
                        "click",
                        editarComentarioBreakTec
                    );


                    const excluir = criarElemento(
                        "button",
                        "excluir",
                        "Excluir comentário"
                    );

                    excluir.type = "button";

                    excluir.addEventListener(
                        "click",
                        excluirComentarioBreakTec
                    );

                    acoes.appendChild(editar);
                    acoes.appendChild(excluir);

                    card.appendChild(acoes);
                }

                listaComentarios.appendChild(card);

            });

        } catch (erro) {

            console.error(
                "Erro ao carregar comentários:",
                erro
            );

            listaComentarios.textContent =
                "Não foi possível carregar os comentários.";
        }
    }


    // Disponibilizar atualização para o formulário de avaliação
    window.carregarComentariosBreakTec =
        carregarComentariosBreakTec;

    // Carregar as opiniões quando a página abrir
    carregarComentariosBreakTec();

})();