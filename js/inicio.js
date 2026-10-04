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
// PESQUISA
// ================================

const searchButton =
    document.getElementById("searchButton");

const searchInput =
    document.getElementById("searchInput");


if (searchButton && searchInput) {

    searchButton.addEventListener(
        "click",
        function () {

            const pesquisa =
                searchInput.value.trim();

            if (pesquisa !== "") {

                console.log(
                    "Pesquisando por:",
                    pesquisa
                );

            } else {

                searchInput.focus();

            }

        }
    );


    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchButton.click();

            }

        }
    );

}

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


async function carregarProjetos() {

    if (!projetosGrid) {
        return;
    }

    try {

    const resposta =
        await fetch("/api/projetos");

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar os projetos.");
        }

    const projetos =
        await resposta.json();


// Remove "Carregando projetos..."
    projetosGrid.innerHTML = "";


    if (projetos.length === 0) {

        projetosGrid.innerHTML = `
            <div class="projetos-vazio">
            Nenhum projeto publicado ainda.
            </div>
            `;

        return;
        }


// Mostra no máximo 6 projetos na Home
    projetos
        .slice(0, 6)
        .forEach(function (projeto) {

        const card =
        document.createElement("article");

        card.classList.add("projeto-home-card");

        card.innerHTML = `

    <div class="projeto-home-imagem">

        ${
            projeto.imagem

            ? `
                <img
                    src="${projeto.imagem}"
                    alt="Imagem do projeto ${projeto.titulo}"
                >
            `

            : `
                <div class="projeto-sem-imagem">
                    BREAKTEC
                </div>
            `
        }

        <span class="projeto-home-categoria">
            ${projeto.categoria || "Projeto"}
        </span>

    </div>


    <div class="projeto-home-conteudo">

        <h3>
            ${projeto.titulo}
        </h3>


        <span class="projeto-home-autor">
            por ${projeto.autor_nome || "Comunidade Break Tec"}
        </span>


        <p class="projeto-home-descricao">

            ${
                projeto.descricao ||
                "Projeto publicado na comunidade Break Tec."
            }

        </p>


        <div class="projeto-home-info">

        <div class="projeto-score">

            <span class="score-icone">★</span>

        <div>
            <small>BREAK SCORE</small>

            <strong>
        ${
           projeto.total_avaliacoes > 0
            ? `${projeto.break_score}/10`
            : "Novo" }
            </strong>
        </div>

            </div>


        <div class="projeto-avaliacoes">

            <strong>
             ${projeto.total_avaliacoes || 0}
            </strong>

            <span>
                ${
                Number(projeto.total_avaliacoes) === 1
                ? "avaliação"
                : "avaliações"
                }
            </span>

        </div>

        </div>


        <a
            href="Pages/jogos.html?id=${projeto.id}"
            class="projeto-home-link"
        >
            Ver projeto
            <span>→</span>
        </a>

       </div>
          `;

            projetosGrid.appendChild(card);

            });

    } catch (erro) {

        console.error(
            "Erro ao carregar projetos:",
            erro
        );

        projetosGrid.innerHTML = `
            <div class="projetos-vazio">
                Não foi possível carregar os projetos.
            </div>
        `;

    }

}


// Carrega os projetos ao abrir a Home
carregarProjetos();

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

