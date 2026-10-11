// ==========================================
// BREAK TEC - CATÁLOGO DE JOGOS
// ==========================================

// ELEMENTOS DA PÁGINA

const catalogoGrid =
    document.getElementById("catalogoGrid");

const catalogoQuantidade =
    document.getElementById("catalogoQuantidade");

const catalogoPesquisa =
    document.getElementById("catalogoPesquisa");

const catalogoGenero =
    document.getElementById("catalogoGenero");

const catalogoOrdenacao =
    document.getElementById("catalogoOrdenacao");

const catalogoAnterior =
    document.getElementById("catalogoAnterior");

const catalogoProximo =
    document.getElementById("catalogoProximo");

const catalogoPagina =
    document.getElementById("catalogoPagina");

const botoesTipo =
    document.querySelectorAll(".catalogo-tipo");


// ==========================================
// ESTADO DO CATÁLOGO
// ==========================================

const parametrosURL =
    new URLSearchParams(window.location.search);

const tiposPermitidos = [
    "todos",
    "oficial",
    "comunidade"
];

let tipoAtual = tiposPermitidos.includes(
    parametrosURL.get("tipo")
)
    ? parametrosURL.get("tipo")
    : "todos";

let paginaAtual = 1;

let temProximaPagina = false;

let temporizadorPesquisa = null;

let controladorCatalogo = null;

let versaoConsulta = 0;


// ==========================================
// NORMALIZAR TEXTOS
// ==========================================

function normalizarTexto(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


// ==========================================
// GÊNEROS DA COMUNIDADE
// ==========================================

const generosComunidade = {

    action: ["acao", "action"],

    adventure: ["aventura", "adventure"],

    "role-playing-games-rpg": ["rpg", "role-playing"],

    shooter: ["tiro", "fps", "shooter"],

    strategy: ["estrategia", "strategy"],

    simulation: ["simulacao", "simulation"],

    puzzle: ["puzzle", "quebra-cabeca"],

    platformer: ["plataforma", "platformer"],

    racing: ["corrida", "racing"]

};


// ==========================================
// FILTRAR PROJETOS DA COMUNIDADE
// ==========================================

function filtrarProjetosComunidade(projetos) {

    const busca = normalizarTexto(
        catalogoPesquisa.value
    );

    const genero = catalogoGenero.value;


    return projetos.filter(projeto => {

        // PESQUISA POR TÍTULO, CATEGORIA,
        // DESCRIÇÃO OU AUTOR

        const conteudo = normalizarTexto([

            projeto.titulo,
            projeto.categoria,
            projeto.descricao,
            projeto.autor_nome

        ].filter(Boolean).join(" "));


        const correspondeBusca =
            !busca || conteudo.includes(busca);


        // FILTRO POR GÊNERO

        let correspondeGenero = true;

        if (genero !== "todos") {

            const categoria = normalizarTexto(
                projeto.categoria
            );

            const palavras =
                generosComunidade[genero] || [];

            correspondeGenero = palavras.some(
                palavra => categoria.includes(palavra)
            );
        }


        return correspondeBusca && correspondeGenero;

    });
}


// ==========================================
// ORDENAR PROJETOS DA COMUNIDADE
// ==========================================

function ordenarProjetosComunidade(projetos) {

    const ordenacao = catalogoOrdenacao.value;

    const lista = [...projetos];


    if (ordenacao === "nome") {

        lista.sort((a, b) =>
            a.titulo.localeCompare(
                b.titulo,
                "pt-BR"
            )
        );

    } else if (ordenacao === "recentes") {

        lista.sort((a, b) =>
            new Date(b.criado_em) -
            new Date(a.criado_em)
        );

    } else if (ordenacao === "avaliacao") {

        lista.sort((a, b) =>
            (Number(b.break_score) || 0) -
            (Number(a.break_score) || 0)
        );

    } else {

        // POPULARIDADE PELA QUANTIDADE
        // DE AVALIAÇÕES NA BREAK TEC

        lista.sort((a, b) =>
            (Number(b.total_avaliacoes) || 0) -
            (Number(a.total_avaliacoes) || 0)
        );

    }


    return lista;
}


// ==========================================
// CRIAR CARD DE JOGO
// ==========================================

function criarCardCatalogo(jogo, origem) {

    const oficial = origem === "oficial";

    const id = Number(
        oficial ? jogo.id_externo : jogo.id
    );

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }


    const card = document.createElement("article");

    card.className = "catalogo-card";


    // =====================================
    // CAPA
    // =====================================

    const imagemContainer =
        document.createElement("div");

    imagemContainer.className =
        "catalogo-card-imagem";

    imagemContainer.textContent = "BREAKTEC";


    if (jogo.imagem) {

        try {

            const endereco = new URL(
                jogo.imagem,
                window.location.href
            );

            if (
                endereco.protocol === "https:" ||
                endereco.protocol === "http:"
            ) {

                const imagem = document.createElement("img");

                imagem.src = endereco.href;

                imagem.alt =
                    `Imagem de ${jogo.titulo}`;

                imagem.loading = "lazy";

                imagem.addEventListener("error", () => {
                    imagem.remove();
                    imagemContainer.textContent = "BREAKTEC";
                    imagemContainer.appendChild(etiqueta);
                });

                imagemContainer.replaceChildren(imagem);
            }

        } catch (erro) {

            console.warn(
                "Imagem inválida:",
                jogo.titulo
            );
        }
    }


    // =====================================
    // ORIGEM
    // =====================================

    const etiqueta = document.createElement("span");

    etiqueta.className = oficial
        ? "catalogo-card-origem oficial"
        : "catalogo-card-origem comunidade";

    etiqueta.textContent = oficial
        ? "OFICIAL"
        : "COMUNIDADE";

    imagemContainer.appendChild(etiqueta);


    // =====================================
    // CONTEÚDO
    // =====================================

    const conteudo = document.createElement("div");

    conteudo.className =
        "catalogo-card-conteudo";


    // GÊNERO

    const genero = document.createElement("span");

    genero.className = "catalogo-card-genero";

    genero.textContent = oficial
        ? jogo.genero || "Jogo oficial"
        : jogo.categoria || "Projeto da comunidade";


    // TÍTULO

    const titulo = document.createElement("h3");

    titulo.textContent =
        jogo.titulo || "Sem título";


    // DESENVOLVEDOR OU AUTOR

    const autor = document.createElement("p");

    autor.className = "catalogo-card-autor";

    autor.textContent = oficial
        ? jogo.desenvolvedor
            ? `Desenvolvido por ${jogo.desenvolvedor}`
            : "Desenvolvedora disponível nos detalhes"

        : `Criado por ${
            jogo.autor_nome || "Comunidade Break Tec"
        }`;


    // DESCRIÇÃO

    const descricao = document.createElement("p");

    descricao.className =
        "catalogo-card-descricao";

    descricao.textContent = oficial
        ? "Descubra mais sobre este jogo, suas características e avaliações."
        : jogo.descricao ||
          "Projeto publicado na comunidade Break Tec.";


    // BREAK SCORE

    const score = document.createElement("p");

    score.className = "catalogo-card-score";

    const totalAvaliacoes =
        Number(jogo.total_avaliacoes) || 0;

    score.textContent = totalAvaliacoes > 0
        ? `★ Break Score: ${
            Number(jogo.break_score).toFixed(1)
        }/10 · ${totalAvaliacoes} avaliações`

        : "★ Ainda sem avaliações na Break Tec";


    // LINK PARA A PÁGINA CORRETA

    const link = document.createElement("a");

    link.className = "catalogo-card-link";

    link.href = oficial
        ? `jogo-oficial.html?id=${id}`
        : `jogos.html?id=${id}`;

    link.textContent = oficial
        ? "Ver jogo →"
        : "Ver projeto →";


    conteudo.append(
        genero,
        titulo,
        autor,
        descricao,
        score,
        link
    );

    card.append(
        imagemContainer,
        conteudo
    );

    return card;
}


// ==========================================
// CARREGAR CATÁLOGO
// ==========================================

async function carregarCatalogo() {

    versaoConsulta++;

    const consultaAtual = versaoConsulta;

    if (controladorCatalogo) {
        controladorCatalogo.abort();
    }

    controladorCatalogo = new AbortController();

    const sinal = controladorCatalogo.signal;


    catalogoGrid.innerHTML = `
        <div class="catalogo-carregando">
            Carregando jogos...
        </div>
    `;

    catalogoQuantidade.textContent =
        "Carregando...";

    catalogoAnterior.disabled = true;
    catalogoProximo.disabled = true;


    // =====================================
    // CONSULTAS
    // =====================================

    const buscarOficiais =
        tipoAtual !== "comunidade";

    const buscarComunidade =
        tipoAtual !== "oficial";


    const parametros = new URLSearchParams({

        pagina: String(paginaAtual),

        genero: catalogoGenero.value,

        ordenacao: catalogoOrdenacao.value,

        busca: catalogoPesquisa.value.trim()

    });


    const requisicaoOficiais = buscarOficiais

        ? fetch(
            `/api/catalogo/oficiais?${parametros}`,
            { signal: sinal }
        ).then(async resposta => {

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao consultar jogos oficiais."
                );
            }

            return resposta.json();

        })

        : Promise.resolve(null);


    const requisicaoComunidade = buscarComunidade

        ? fetch(
            "/api/projetos",
            { signal: sinal }
        ).then(async resposta => {

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao consultar a comunidade."
                );
            }

            return resposta.json();

        })

        : Promise.resolve(null);


    const resultados = await Promise.allSettled([

        requisicaoOficiais,

        requisicaoComunidade

    ]);


    // IGNORA CONSULTAS ANTIGAS

    if (consultaAtual !== versaoConsulta) {
        return;
    }


    // =====================================
    // RESULTADOS OFICIAIS
    // =====================================

    const oficiaisDisponiveis =
        resultados[0].status === "fulfilled";

    const dadosOficiais = oficiaisDisponiveis
        ? resultados[0].value
        : null;

    const oficiais = Array.isArray(
        dadosOficiais?.jogos
    )
        ? dadosOficiais.jogos
        : [];


    // =====================================
    // RESULTADOS DA COMUNIDADE
    // =====================================

    const comunidadeDisponivel =
        resultados[1].status === "fulfilled";

    const projetosRecebidos = comunidadeDisponivel
        ? resultados[1].value
        : [];

    const projetos = ordenarProjetosComunidade(
        filtrarProjetosComunidade(
            Array.isArray(projetosRecebidos)
                ? projetosRecebidos
                : []
        )
    );


    // PROJETOS POR PÁGINA

    // Na aba Todos: até 3 projetos e
    // 12 jogos oficiais por página.
    //
    // Na aba Comunidade: 12 projetos
    // por página.

    const projetosPorPagina =
        tipoAtual === "todos" ? 3 : 12;

    const inicio =
        (paginaAtual - 1) * projetosPorPagina;

    const projetosPagina = projetos.slice(
        inicio,
        inicio + projetosPorPagina
    );


    // =====================================
    // MISTURAR OS RESULTADOS
    // =====================================

    const itens = [];

    if (tipoAtual === "todos") {

        const quantidade = Math.max(
            oficiais.length,
            projetosPagina.length
        );

        for (let i = 0; i < quantidade; i++) {

            if (oficiais[i]) {
                itens.push({
                    dados: oficiais[i],
                    origem: "oficial"
                });
            }

            if (projetosPagina[i]) {
                itens.push({
                    dados: projetosPagina[i],
                    origem: "comunidade"
                });
            }

        }

    } else if (tipoAtual === "oficial") {

        oficiais.forEach(jogo => {

            itens.push({
                dados: jogo,
                origem: "oficial"
            });

        });

    } else {

        projetosPagina.forEach(projeto => {

            itens.push({
                dados: projeto,
                origem: "comunidade"
            });

        });
    }


    // =====================================
    // EXIBIR OS CARDS
    // =====================================

    catalogoGrid.replaceChildren();

    let totalExibido = 0;

    itens.forEach(item => {

        const card = criarCardCatalogo(
            item.dados,
            item.origem
        );

        if (card) {

            catalogoGrid.appendChild(card);

            totalExibido++;
        }

    });


    // =====================================
    // MENSAGEM DE CATÁLOGO VAZIO
    // =====================================

    if (totalExibido === 0) {

        const vazio = document.createElement("div");

        vazio.className = "catalogo-vazio";

        vazio.textContent =
            "Nenhum jogo encontrado com os filtros selecionados.";

        catalogoGrid.appendChild(vazio);
    }


    // =====================================
    // AVISO DE ERROS PARCIAIS
    // =====================================

    const falhaOficial =
        buscarOficiais && !oficiaisDisponiveis;

    const falhaComunidade =
        buscarComunidade && !comunidadeDisponivel;

    if (falhaOficial || falhaComunidade) {

        const aviso = document.createElement("div");

        aviso.className = "catalogo-erro";

        aviso.textContent =
            "Parte do catálogo está temporariamente indisponível.";

        catalogoGrid.appendChild(aviso);
    }


    // =====================================
    // QUANTIDADE DE JOGOS
    // =====================================

    catalogoQuantidade.textContent =
        `${totalExibido} ${
            totalExibido === 1
                ? "jogo nesta página"
                : "jogos nesta página"
        }`;


    // =====================================
    // PAGINAÇÃO
    // =====================================

    const totalPaginasComunidade =
        Math.ceil(
            projetos.length / projetosPorPagina
        );

    const proximaOficial =
        buscarOficiais &&
        oficiaisDisponiveis &&
        Boolean(dadosOficiais?.temProxima);

    const proximaComunidade =
        buscarComunidade &&
        comunidadeDisponivel &&
        paginaAtual < totalPaginasComunidade;

    temProximaPagina =
        proximaOficial || proximaComunidade;


    catalogoAnterior.disabled =
        paginaAtual <= 1;

    catalogoProximo.disabled =
        !temProximaPagina;

    catalogoPagina.textContent =
        `Página ${paginaAtual}`;
}


// ==========================================
// ATUALIZAR OS BOTÕES DE TIPO
// ==========================================

function atualizarTipoCatalogo() {

    botoesTipo.forEach(botao => {

        const ativo =
            botao.dataset.tipo === tipoAtual;

        botao.classList.toggle("ativo", ativo);

        botao.setAttribute(
            "aria-pressed",
            String(ativo)
        );

    });
}


// ==========================================
// ATUALIZAR URL
// ==========================================

function atualizarURLCatalogo() {

    const url = new URL(window.location.href);

    url.searchParams.set("tipo", tipoAtual);

    url.searchParams.set(
        "pagina",
        String(paginaAtual)
    );

    window.history.replaceState(
        null,
        "",
        url
    );
}


// ==========================================
// ALTERAR TIPO DE CATÁLOGO
// ==========================================

botoesTipo.forEach(botao => {

    botao.addEventListener("click", () => {

        tipoAtual = botao.dataset.tipo;

        paginaAtual = 1;

        atualizarTipoCatalogo();

        atualizarURLCatalogo();

        carregarCatalogo();

    });

});


// ==========================================
// PESQUISA COM PEQUENO INTERVALO
// ==========================================

catalogoPesquisa.addEventListener("input", () => {

    clearTimeout(temporizadorPesquisa);

    paginaAtual = 1;

    // Cancela imediatamente a pesquisa anterior.

    versaoConsulta++;

    if (controladorCatalogo) {
        controladorCatalogo.abort();
    }

    temporizadorPesquisa = setTimeout(() => {

        atualizarURLCatalogo();

        carregarCatalogo();

    }, 450);

});


// ==========================================
// FILTROS DE GÊNERO E ORDENAÇÃO
// ==========================================

[catalogoGenero, catalogoOrdenacao].forEach(campo => {

    campo.addEventListener("change", () => {

        paginaAtual = 1;

        atualizarURLCatalogo();

        carregarCatalogo();

    });

});


// ==========================================
// PAGINAÇÃO
// ==========================================

catalogoAnterior.addEventListener("click", () => {

    if (paginaAtual <= 1) {
        return;
    }

    paginaAtual--;

    atualizarURLCatalogo();

    carregarCatalogo();

    document.querySelector(
        ".catalogo-resultados"
    ).scrollIntoView({
        behavior: "smooth"
    });

});


catalogoProximo.addEventListener("click", () => {

    if (!temProximaPagina) {
        return;
    }

    paginaAtual++;

    atualizarURLCatalogo();

    carregarCatalogo();

    document.querySelector(
        ".catalogo-resultados"
    ).scrollIntoView({
        behavior: "smooth"
    });

});


// ==========================================
// INICIAR CATÁLOGO
// ==========================================

atualizarTipoCatalogo();

carregarCatalogo();