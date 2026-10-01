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
    document.querySelectorAll(
        "section[id]"
    );

const linksMenu =
    document.querySelectorAll(
        ".nav a"
    );

const navIndicator =
    document.getElementById(
        "navIndicator"
    );

function moverIndicador() {

    if (
        !navIndicator ||
        !nav ||
        linksMenu.length === 0
    ) {
        return;
    }


    const scrollAtual =
        window.scrollY + 180;


    let indiceAtual = 0;


    // Descobre entre quais seções
    // o usuário está
    for (
        let i = 0;
        i < secoes.length;
        i++
    ) {

        if (
            scrollAtual >=
            secoes[i].offsetTop
        ) {

            indiceAtual = i;

        }

    }


    const indiceProximo =
        Math.min(
            indiceAtual + 1,
            linksMenu.length - 1
        );


    const secaoAtual =
        secoes[indiceAtual];

    const proximaSecao =
        secoes[indiceProximo];


    const linkAtual =
        linksMenu[indiceAtual];

    const proximoLink =
        linksMenu[indiceProximo];


    // ==========================
    // PROGRESSO ENTRE AS SEÇÕES
    // ==========================

    let progresso = 0;


    if (
        indiceAtual !== indiceProximo
    ) {

        const inicio =
            secaoAtual.offsetTop;

        const fim =
            proximaSecao.offsetTop;


        progresso =
            (scrollAtual - inicio) /
            (fim - inicio);


        progresso =
            Math.max(
                0,
                Math.min(1, progresso)
            );

    }


    // ==========================
    // POSIÇÃO DOS LINKS
    // ==========================

    const navRect =
        nav.getBoundingClientRect();

    const atualRect =
        linkAtual.getBoundingClientRect();

    const proximoRect =
        proximoLink.getBoundingClientRect();


    const inicioAtual =
        atualRect.left -
        navRect.left;

    const inicioProximo =
        proximoRect.left -
        navRect.left;


    // Centro de cada link
    const centroAtual =
        inicioAtual +
        atualRect.width / 2;

    const centroProximo =
        inicioProximo +
        proximoRect.width / 2;


    // Faz a barrinha viajar
    const centroInterpolado =
        centroAtual +
        (
            centroProximo -
            centroAtual
        ) * progresso;


    const larguraAtual = 38;


    const posicaoX =
        centroInterpolado -
        larguraAtual / 2;


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


// Atualiza enquanto rola
window.addEventListener(
    "scroll",
    moverIndicador,
    { passive: true }
);


// Atualiza caso tamanho da tela mude
window.addEventListener(
    "resize",
    moverIndicador
);


// Executa assim que abrir
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

}


// CHAMA A FUNÇÃO UMA ÚNICA VEZ
verificarSessao();


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

