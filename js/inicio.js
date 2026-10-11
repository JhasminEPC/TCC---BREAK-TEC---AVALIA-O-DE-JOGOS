// ================================
// BOTÃO EXPLORAR
// ================================

const exploreButton =
    document.getElementById("exploreButton");

if (exploreButton) {

    exploreButton.addEventListener(
        "click",
        function () {

            document
                .getElementById("projetos")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


// ================================
// MENU MOBILE
// ================================

const menuButton =
    document.getElementById("menuButton");

const nav =
    document.getElementById("nav");

if (menuButton && nav) {

    menuButton.addEventListener(
        "click",
        function () {

            nav.classList.toggle(
                "mobile-active"
            );

        }
    );

}


// ================================
// BARRINHA DO MENU ACOMPANHA SCROLL
// ================================

const secoes =
    document.querySelectorAll("section[id]");

const linksMenu =
    document.querySelectorAll(".nav a");

const navIndicator =
    document.getElementById("navIndicator");


function moverIndicador() {

    if (
        !navIndicator ||
        !nav ||
        secoes.length === 0 ||
        linksMenu.length === 0
    ) {
        return;
    }


    const header =
        document.querySelector(".header");

    const alturaHeader =
        header ? header.offsetHeight : 0;


    /*
        Ponto usado para decidir qual seção
        está realmente ocupando a tela.
    */

    const pontoTela =
        window.scrollY +
        alturaHeader +
        (
            window.innerHeight -
            alturaHeader
        ) * 0.35;


    let indiceAtual = 0;


    secoes.forEach(
        function (secao, indice) {

            if (
                pontoTela >=
                secao.offsetTop
            ) {

                indiceAtual = indice;

            }

        }
    );


    const linkAtual =
        linksMenu[indiceAtual];


    if (!linkAtual) {
        return;
    }


    // ==========================
    // POSICIONA EXATAMENTE
    // NO LINK ATIVO
    // ==========================

    const navRect =
        nav.getBoundingClientRect();

    const linkRect =
        linkAtual.getBoundingClientRect();


    const centroLink =
        linkRect.left -
        navRect.left +
        linkRect.width / 2;


    const larguraIndicador =
        navIndicator.offsetWidth || 38;


    const posicaoX =
        centroLink -
        larguraIndicador / 2;


    navIndicator.style.transform =
        `translateX(${posicaoX}px)`;


    // ==========================
    // LINK ATIVO
    // ==========================

    linksMenu.forEach(
        function (link, indice) {

            link.classList.toggle(
                "active",
                indice === indiceAtual
            );

        }
    );

}


// Atualiza durante a rolagem

window.addEventListener(
    "scroll",
    moverIndicador,
    { passive: true }
);


// Recalcula se a tela mudar

window.addEventListener(
    "resize",
    moverIndicador
);


// Corrige posição inicial

window.addEventListener(
    "load",
    moverIndicador
);


moverIndicador();


// ================================
// CLIQUE NO MENU
// ================================

linksMenu.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function () {

                linksMenu.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                link.classList.add(
                    "active"
                );

            }
        );

    }
);


// ================================
// PESQUISA UNIFICADA - BREAK TEC
// ================================

const searchContainer =
    document.querySelector(".search-container");

const searchButton =
    document.getElementById("searchButton");

const searchInput =
    document.getElementById("searchInput");

const searchResults =
    document.getElementById("searchResults");

const searchResultsTitle =
    document.getElementById("searchResultsTitle");

const searchResultsContent =
    document.getElementById("searchResultsContent");

const searchResultsClose =
    document.getElementById("searchResultsClose");

let pesquisaTimer;
let pesquisaControlador;
let pesquisaVersao = 0;


// ================================
// ABRIR E FECHAR RESULTADOS
// ================================

function abrirResultados() {

    searchResults.hidden = false;

    searchInput.setAttribute(
        "aria-expanded",
        "true"
    );
}

function fecharResultados() {

    clearTimeout(pesquisaTimer);

    pesquisaVersao++;

    if (pesquisaControlador) {
        pesquisaControlador.abort();
    }

    searchResults.hidden = true;

    searchInput.setAttribute(
        "aria-expanded",
        "false"
    );
}


// ================================
// CRIAR CARD DE RESULTADO
// ================================

function criarResultado(jogo, origem) {

    const oficial = origem === "oficial";

    const item = document.createElement("a");

    item.className = "search-result-item";

    item.href = oficial
        ? `Pages/jogo-oficial.html?id=${encodeURIComponent(jogo.id_externo)}`
        : `Pages/jogos.html?id=${encodeURIComponent(jogo.id)}`;


    // IMAGEM

    const imagemContainer =
        document.createElement("div");

    imagemContainer.className =
        "search-result-image";

    if (jogo.imagem) {

        const imagem = document.createElement("img");

        imagem.src = jogo.imagem;

        imagem.alt = "";

        imagem.loading = "lazy";

        imagemContainer.appendChild(imagem);

    } else {

        imagemContainer.textContent = "🎮";

    }


    // INFORMAÇÕES

    const informacoes =
        document.createElement("div");

    informacoes.className =
        "search-result-info";

    const titulo = document.createElement("strong");

    titulo.textContent =
        oficial ? jogo.titulo : jogo.titulo;

    const criador = document.createElement("span");

    criador.textContent = oficial
        ? "Estúdio: veja os detalhes"
        : `Criado por: ${jogo.autor_nome || "Comunidade Break Tec"}`;

    const genero = document.createElement("small");

    genero.textContent = oficial
        ? jogo.genero || "Gênero não informado"
        : jogo.categoria || "Categoria não informada";

    informacoes.append(
        titulo,
        criador,
        genero
    );


    // IDENTIFICAÇÃO DA ORIGEM

    const etiqueta =
        document.createElement("span");

    etiqueta.className = oficial
        ? "search-result-badge oficial"
        : "search-result-badge comunidade";

    etiqueta.textContent = oficial
        ? "OFICIAL"
        : "COMUNIDADE";


    item.append(
        imagemContainer,
        informacoes,
        etiqueta
    );

    return item;
}


// ================================
// PESQUISAR NOS DOIS CATÁLOGOS
// ================================

async function pesquisarJogos() {

    const termo = searchInput.value.trim();

    pesquisaVersao++;

    const versaoAtual = pesquisaVersao;

    if (pesquisaControlador) {
        pesquisaControlador.abort();
    }

    if (termo.length < 2) {

        fecharResultados();

        return;
    }

    pesquisaControlador = new AbortController();

    const sinal = pesquisaControlador.signal;

    abrirResultados();

    searchResultsTitle.textContent =
        "Buscando jogos...";

    searchResultsContent.textContent =
        "Consultando jogos oficiais e projetos da comunidade...";


    // REQUISIÇÕES

    const requisicaoComunidade = fetch(
        "/api/projetos",
        { signal: sinal }
    ).then(async resposta => {

        if (!resposta.ok) {
            throw new Error("Erro no catálogo da comunidade");
        }

        return resposta.json();
    });


    const requisicaoOficial = fetch(
        `/api/jogos-oficiais?busca=${encodeURIComponent(termo)}`,
        { signal: sinal }
    ).then(async resposta => {

        if (!resposta.ok) {
            throw new Error("Erro no catálogo oficial");
        }

        return resposta.json();
    });


    const [resultadoComunidade, resultadoOficial] =
        await Promise.allSettled([
            requisicaoComunidade,
            requisicaoOficial
        ]);


    // IGNORA PESQUISAS ANTIGAS

    if (versaoAtual !== pesquisaVersao) {
        return;
    }


    // RESULTADOS DO MYSQL

    let projetos = [];

    if (resultadoComunidade.status === "fulfilled") {

        const dados = resultadoComunidade.value;

        const texto = termo.toLocaleLowerCase("pt-BR");

        projetos = (Array.isArray(dados) ? dados : [])
            .filter(projeto => {

                const conteudo = [
                    projeto.titulo,
                    projeto.categoria,
                    projeto.descricao,
                    projeto.autor_nome
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase("pt-BR");

                return conteudo.includes(texto);

            })
            .slice(0, 6);
    }


    // RESULTADOS DA RAWG

    let jogosOficiais = [];

    if (resultadoOficial.status === "fulfilled") {

        const dados = resultadoOficial.value;

        jogosOficiais = (
            Array.isArray(dados.jogos)
                ? dados.jogos
                : []
        ).slice(0, 6);
    }


    // EXIBIR RESULTADOS

    searchResultsContent.replaceChildren();

    const resultados = [];

    const quantidadeMaxima = Math.max(
        projetos.length,
        jogosOficiais.length
    );

    // Alterna os tipos de jogo na listagem.

    for (let i = 0; i < quantidadeMaxima; i++) {

        if (jogosOficiais[i]) {
            resultados.push(
                criarResultado(jogosOficiais[i], "oficial")
            );
        }

        if (projetos[i]) {
            resultados.push(
                criarResultado(projetos[i], "comunidade")
            );
        }
    }


    searchResultsTitle.textContent =
        `Resultados para "${termo}"`;


    if (resultados.length === 0) {

        const mensagem = document.createElement("p");

        mensagem.className = "search-empty";

        mensagem.textContent =
            "Nenhum jogo ou projeto encontrado.";

        searchResultsContent.appendChild(mensagem);

    } else {

        searchResultsContent.append(...resultados);

    }


    // SE ALGUMA FONTE FALHAR

    if (
        resultadoComunidade.status === "rejected" ||
        resultadoOficial.status === "rejected"
    ) {

        const aviso = document.createElement("p");

        aviso.className = "search-warning";

        aviso.textContent =
            "Parte do catálogo está temporariamente indisponível.";

        searchResultsContent.appendChild(aviso);
    }
}


// ================================
// EVENTOS DA PESQUISA
// ================================

if (
    searchContainer &&
    searchButton &&
    searchInput &&
    searchResults &&
    searchResultsContent &&
    searchResultsTitle &&
    searchResultsClose
) {

    // PESQUISA ENQUANTO DIGITA

    searchInput.addEventListener("input", function () {

        clearTimeout(pesquisaTimer);

        pesquisaVersao++;

        if (pesquisaControlador) {
            pesquisaControlador.abort();
        }

        if (searchInput.value.trim().length < 2) {

            fecharResultados();

            return;
        }

        pesquisaTimer = setTimeout(
            pesquisarJogos,
            400
        );

    });


    // CLIQUE NA LUPA

    searchButton.addEventListener("click", function () {

        if (searchInput.value.trim().length < 2) {

            searchInput.focus();

            return;
        }

        clearTimeout(pesquisaTimer);

        pesquisarJogos();

    });


    // ENTER PARA PESQUISAR

    searchInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            clearTimeout(pesquisaTimer);

            pesquisarJogos();
        }

        if (event.key === "Escape") {

            fecharResultados();

            searchInput.blur();
        }
    });


    // FECHAR PELO X

    searchResultsClose.addEventListener(
        "click",
        fecharResultados
    );


    // FECHAR AO CLICAR FORA

    document.addEventListener("click", function (event) {

        if (!searchContainer.contains(event.target)) {

            fecharResultados();

        }
    });

}

//===============================
// VERIFICAR SESSÃO DO USUÁRIO
//===============================

const areaUsuario = document.getElementById("areaUsuario");

async function verificarSessao() {

    const usuarioDeslogado =
        document.getElementById("usuarioDeslogado");

    const usuarioLogado =
        document.getElementById("usuarioLogado");

    const nomeUsuario =
        document.getElementById("nomeUsuario");


    try {

        const resposta =
            await fetch("/api/sessao");


        if (!resposta.ok) {

            usuarioDeslogado.hidden = false;
            usuarioLogado.hidden = true;

            return;
        }


        const dados =
            await resposta.json();


        usuarioDeslogado.hidden = true;
        usuarioLogado.hidden = false;

        nomeUsuario.textContent =
            dados.usuario.nome;


    } catch (erro) {

        console.error(
            "Erro ao verificar sessão:",
            erro
        );

    }

    finally {
    areaUsuario.classList.remove("auth-carregando");
    }
}


// CHAMA A FUNÇÃO UMA ÚNICA VEZ
verificarSessao();

// ================================
// PROJETOS EM DESTAQUE
// ================================

const projetosGrid =
    document.getElementById("projetosGrid");

const verTodosProjetos =
    document.getElementById("verTodosProjetos");


// ========================================
// PROJETOS E JOGOS OFICIAIS EM DESTAQUE
// ========================================

// PROTEGE OS TEXTOS INSERIDOS NOS CARDS

function escaparTexto(valor) {

    return String(valor ?? "").replace(
        /[&<>"']/g,
        caractere => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caractere]
    );
}


// VALIDA ENDEREÇOS DE IMAGENS

function imagemSegura(valor) {

    if (!valor || typeof valor !== "string") {
        return "";
    }

    try {

        const url = new URL(valor, window.location.href);

        if (!["http:", "https:"].includes(url.protocol)) {
            return "";
        }

        return escaparTexto(url.href);

    } catch {
        return "";
    }
}


// CRIAR CARD DE DESTAQUE

function criarCardDestaque(jogo) {

    const oficial = jogo.origem === "oficial";

    const id = Number(
        oficial ? jogo.id_externo : jogo.id
    );

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    const titulo = escaparTexto(jogo.titulo);

    const categoria = escaparTexto(
        oficial
            ? jogo.genero || "Jogo oficial"
            : jogo.categoria || "Projeto"
    );

    const autor = escaparTexto(
        oficial
            ? jogo.desenvolvedor || "Não informado"
            : jogo.autor_nome || "Comunidade Break Tec"
    );

    const descricao = escaparTexto(
        oficial
            ? `Explore este jogo do catálogo oficial da Break Tec.`
            : jogo.descricao ||
              "Projeto publicado na comunidade Break Tec."
    );

    const totalAvaliacoes =
        Number(jogo.total_avaliacoes) || 0;

    const score =
        totalAvaliacoes > 0
            ? `${Number(jogo.break_score).toFixed(1)}/10`
            : "Novo";

    const link = oficial
        ? `Pages/jogo-oficial.html?id=${id}`
        : `Pages/jogos.html?id=${id}`;

    const imagem = imagemSegura(jogo.imagem);

    const card = document.createElement("article");

    card.className = "projeto-home-card";

    card.innerHTML = `

        <div class="projeto-home-imagem">

            ${
                imagem
                    ? `<img src="${imagem}"
                            alt="Imagem de ${titulo}"
                            loading="lazy">`

                    : `<div class="projeto-sem-imagem">
                            BREAKTEC
                       </div>`
            }

            <span class="destaque-origem ${
                oficial ? "oficial" : "comunidade"
            }">
                ${oficial ? "OFICIAL" : "COMUNIDADE"}
            </span>

        </div>


        <div class="projeto-home-conteudo">

            <span class="projeto-home-categoria">
                ${categoria}
            </span>

            <h3>${titulo}</h3>

            <span class="projeto-home-autor">
                ${oficial ? "Desenvolvido por" : "Criado por"}
                ${autor}
            </span>

            <p class="projeto-home-descricao">
                ${descricao}
            </p>


            <div class="projeto-home-info">

                <div class="projeto-score">

                    <span class="score-icone">★</span>

                    <div>
                        <small>BREAK SCORE</small>
                        <strong>${score}</strong>
                    </div>

                </div>

                <div class="projeto-avaliacoes">

                    <strong>${totalAvaliacoes}</strong>

                    <span>
                        ${
                            totalAvaliacoes === 1
                                ? "avaliação"
                                : "avaliações"
                        }
                    </span>

                </div>

            </div>


            <a
                href="${link}"
                class="projeto-home-link"
            >
                ${oficial ? "Ver jogo" : "Ver projeto"}
                <span>→</span>
            </a>

        </div>
    `;

    return card;
}


// CARREGAR OS DOIS CATÁLOGOS

async function carregarProjetos() {

    if (!projetosGrid) {
        return;
    }

    try {

        const requisicoes = await Promise.allSettled([

            fetch("/api/projetos").then(resposta => {

                if (!resposta.ok) {
                    throw new Error("Erro nos projetos.");
                }

                return resposta.json();
            }),

            fetch("/api/destaques-oficiais").then(resposta => {

                if (!resposta.ok) {
                    throw new Error("Erro nos jogos oficiais.");
                }

                return resposta.json();
            })

        ]);


        // PROJETOS DA COMUNIDADE

        const projetos = requisicoes[0].status === "fulfilled"
            && Array.isArray(requisicoes[0].value)

            ? requisicoes[0].value.slice(0, 3).map(
                projeto => ({
                    ...projeto,
                    origem: "comunidade"
                })
            )

            : [];


        // JOGOS OFICIAIS

        const dadosOficiais =
            requisicoes[1].status === "fulfilled"
                ? requisicoes[1].value
                : null;

        const oficiais = Array.isArray(dadosOficiais?.jogos)
            ? dadosOficiais.jogos.slice(0, 3)
            : [];


        // MISTURA OS RESULTADOS

        const destaques = [];

        for (let i = 0; i < 3; i++) {

            if (oficiais[i]) {
                destaques.push(oficiais[i]);
            }

            if (projetos[i]) {
                destaques.push(projetos[i]);
            }
        }


        projetosGrid.replaceChildren();


        // NENHUM RESULTADO

        if (destaques.length === 0) {

            projetosGrid.innerHTML = `
                <div class="projetos-vazio">
                    Nenhum jogo ou projeto disponível.
                </div>
            `;

            return;
        }


        // MOSTRAR OS CARDS

        destaques.forEach(jogo => {

            const card = criarCardDestaque(jogo);

            if (card) {
                projetosGrid.appendChild(card);
            }

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar destaques:",
            erro
        );

        projetosGrid.innerHTML = `
            <div class="projetos-vazio">
                Não foi possível carregar os destaques.
            </div>
        `;
    }
}
// Carrega os projetos ao abrir a Home
carregarProjetos();


// ==========================================
// BOTÃO VER TODOS - CATÁLOGO
// ==========================================

if (verTodosProjetos) {

    verTodosProjetos.addEventListener(
        "click",
        function () {

            window.location.href =
                "Pages/catalogo.html?tipo=todos";

        }
    );

}

// ==========================
// RANKING DE AVALIAÇÕES
// ==========================

const avaliacaoDestaque =
    document.getElementById("avaliacaoDestaque");

const rankingLista =
    document.getElementById("rankingLista");


async function carregarRanking() {

    if (!avaliacaoDestaque || !rankingLista) {
        return;
    }


    try {

        const resposta =
            await fetch("/api/ranking");


        if (!resposta.ok) {
            throw new Error(
                "Não foi possível carregar o ranking."
            );
        }


        const projetos =
            await resposta.json();


        // NENHUM PROJETO AVALIADO

        if (projetos.length === 0) {

            avaliacaoDestaque.innerHTML = `
                <div class="avaliacoes-vazio">
                    Nenhum projeto foi avaliado ainda.
                </div>
            `;

            rankingLista.innerHTML = `
                <div class="avaliacoes-vazio">
                    O ranking aparecerá quando
                    surgirem avaliações.
                </div>
            `;

            return;
        }


        // PROJETO Nº 1 DO RANKING

        const primeiro =
            projetos[0];


        avaliacaoDestaque.innerHTML = `

            <div class="avaliacao-destaque-conteudo">

                <span class="avaliacao-posicao">
                    #1 DA COMUNIDADE
                </span>

                <h3>
                    ${primeiro.titulo}
                </h3>

                <span class="avaliacao-autor">
                    por ${primeiro.autor || "Comunidade Break Tec"}
                </span>


                <div class="break-score-grande">

                    <strong>
                        ${primeiro.break_score}
                    </strong>

                    <span>/10</span>

                </div>

                <span class="break-score-label">
                    BREAK SCORE
                </span>


                <a
                    href="Pages/jogos.html?id=${primeiro.id}"
                    class="projeto-home-link"
                >
                    Ver projeto →
                </a>

            </div>
        `;


        // RANKING

        rankingLista.innerHTML = "";


        projetos.forEach(
            function (projeto, indice) {

                const item =
                    document.createElement("div");

                item.classList.add("ranking-item");


                item.innerHTML = `

                    <span class="ranking-numero">
                        ${String(indice + 1).padStart(2, "0")}
                    </span>


                    <div class="ranking-jogo">

                        <strong>
                            ${projeto.titulo}
                        </strong>

                        <span>
                            ${projeto.total_avaliacoes}
                            ${
                                Number(projeto.total_avaliacoes) === 1
                                    ? "avaliação"
                                    : "avaliações"
                            }
                        </span>

                    </div>


                    <span class="ranking-score">
                        ${projeto.break_score}
                    </span>

                `;


                rankingLista.appendChild(item);

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar ranking:",
            erro
        );


        avaliacaoDestaque.innerHTML = `
            <div class="avaliacoes-vazio">
                Não foi possível carregar as avaliações.
            </div>
        `;

    }

}


carregarRanking();

// ==========================
// COMUNIDADE
// ==========================

const atividadeLista =
    document.getElementById("atividadeLista");

const comunidadeProjetos =
    document.getElementById("comunidadeProjetos");

const comunidadeAvaliacoes =
    document.getElementById("comunidadeAvaliacoes");

const comunidadeUsuarios =
    document.getElementById("comunidadeUsuarios");


async function carregarComunidade() {

    if (
        !atividadeLista ||
        !comunidadeProjetos ||
        !comunidadeAvaliacoes ||
        !comunidadeUsuarios
    ) {
        return;
    }


    try {

        const resposta =
            await fetch("/api/comunidade");


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar a comunidade."
            );

        }


        const dados =
            await resposta.json();


        // ==========================
        // NÚMEROS DA COMUNIDADE
        // ==========================

        comunidadeProjetos.textContent =
            dados.totais.projetos;

        comunidadeAvaliacoes.textContent =
            dados.totais.avaliacoes;

        comunidadeUsuarios.textContent =
            dados.totais.usuarios;


        // ==========================
        // ATIVIDADES
        // ==========================

        atividadeLista.innerHTML = "";


        if (dados.atividades.length === 0) {

            atividadeLista.innerHTML = `
                <div class="comunidade-vazio">
                    Nenhuma atividade recente.
                </div>
            `;

            return;
        }


        dados.atividades.forEach(
            function (atividade) {

                const item =
                    document.createElement("div");

                item.classList.add("atividade-item");


                let icone = "◆";
                let texto = "";


                // PROJETO PUBLICADO

                if (atividade.tipo === "projeto") {

                    icone = "◆";

                    texto = `
                        <strong>${atividade.usuario}</strong>
                        publicou
                        <strong>${atividade.projeto}</strong>
                    `;

                }


                // PROJETO AVALIADO

                if (atividade.tipo === "avaliacao") {

                    icone = "★";

                    texto = `
                        <strong>${atividade.usuario}</strong>
                        avaliou
                        <strong>${atividade.projeto}</strong>
                    `;

                }


                item.innerHTML = `

                    <div class="atividade-icone">
                        ${icone}
                    </div>


                    <div class="atividade-texto">

                        <p>
                            ${texto}
                        </p>

                        <span>
                            ${formatarDataAtividade(
                                atividade.data
                            )}
                        </span>

                    </div>

                `;


                // CLICAR LEVA AO PROJETO

                item.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            `Pages/jogos.html?id=${atividade.projeto_id}`;

                    }
                );


                atividadeLista.appendChild(item);

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar comunidade:",
            erro
        );


        atividadeLista.innerHTML = `
            <div class="comunidade-vazio">
                Não foi possível carregar as atividades.
            </div>
        `;

    }

}


// ==========================
// FORMATAR DATA
// ==========================

function formatarDataAtividade(data) {

    const dataAtividade =
        new Date(data);

    return dataAtividade.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


carregarComunidade();

// ==========================
// LOGOUT
// ==========================

const botaoSair =
    document.getElementById("botaoSair");

botaoSair.addEventListener(
    "click",
    async function () {

        try {

            const resposta =
                await fetch("/api/logout", {
                    method: "POST"
                });

            if (!resposta.ok) {

                alert(
                    "Não foi possível sair da conta."
                );

                return;
            }

            window.location.href =
                "/index.html";


        } catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

        }

    }
);


// ==========================================
// MENU LATERAL - CATÁLOGO BREAK TEC
// ==========================================

const catalogMenuButton =
    document.getElementById("catalogMenuButton");

const catalogSidebar =
    document.getElementById("catalogSidebar");

const catalogOverlay =
    document.getElementById("catalogOverlay");

const catalogClose =
    document.getElementById("catalogClose");


// ==========================================
// ABRIR MENU
// ==========================================

function abrirMenuCatalogo() {

    catalogOverlay.hidden = false;

    catalogSidebar.classList.add("aberto");

    catalogOverlay.classList.add("ativo");

    document.body.classList.add(
        "catalog-sidebar-aberta"
    );

    // Permite interação com o menu

    catalogSidebar.inert = false;

    catalogSidebar.setAttribute(
        "aria-hidden",
        "false"
    );

    catalogMenuButton.setAttribute(
        "aria-expanded",
        "true"
    );

    // Posiciona o foco no botão de fechar

    catalogClose.focus();
}


// ==========================================
// FECHAR MENU
// ==========================================

function fecharMenuCatalogo() {

    catalogSidebar.classList.remove("aberto");

    catalogOverlay.classList.remove("ativo");

    document.body.classList.remove(
        "catalog-sidebar-aberta"
    );

    // Impede interação com o menu fechado

    catalogSidebar.inert = true;

    catalogSidebar.setAttribute(
        "aria-hidden",
        "true"
    );

    catalogMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    // Devolve o foco ao botão principal

    catalogMenuButton.focus();
}


// ==========================================
// EVENTOS DO MENU
// ==========================================

if (
    catalogMenuButton &&
    catalogSidebar &&
    catalogOverlay &&
    catalogClose
) {

    // ABRIR PELAS TRÊS BARRINHAS

    catalogMenuButton.addEventListener(
        "click",
        abrirMenuCatalogo
    );


    // FECHAR PELO X

    catalogClose.addEventListener(
        "click",
        fecharMenuCatalogo
    );


    // FECHAR CLICANDO FORA

    catalogOverlay.addEventListener(
        "click",
        fecharMenuCatalogo
    );


    // FECHAR PELO ESC

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                catalogSidebar.classList.contains("aberto")
            ) {

                fecharMenuCatalogo();

            }

        }
    );


    // FECHAR AO SELECIONAR UM LINK

    const linksCatalogo =
        catalogSidebar.querySelectorAll("a");

    linksCatalogo.forEach(function (link) {

        link.addEventListener(
            "click",
            fecharMenuCatalogo
        );

    });


    // MANTER A NAVEGAÇÃO POR TAB DENTRO DO MENU

    catalogSidebar.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Tab") {
                return;
            }

            const elementos = Array.from(
                catalogSidebar.querySelectorAll(
                    'a[href], button:not([disabled])'
                )
            );

            if (elementos.length === 0) {
                return;
            }

            const primeiro = elementos[0];

            const ultimo =
                elementos[elementos.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === primeiro
            ) {

                event.preventDefault();

                ultimo.focus();

            } else if (
                !event.shiftKey &&
                document.activeElement === ultimo
            ) {

                event.preventDefault();

                primeiro.focus();

            }

        }
    );

}
