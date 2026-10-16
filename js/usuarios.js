
// ==========================================
// BREAK TEC - EXPLORAR PERFIS
// ==========================================

// ELEMENTOS DA PÁGINA

const pesquisaUsuarios =
    document.getElementById("pesquisaUsuarios");

const limparPesquisaUsuarios =
    document.getElementById("limparPesquisaUsuarios");

const usuariosGrid =
    document.getElementById("usuariosGrid");

const usuariosQuantidade =
    document.getElementById("usuariosQuantidade");

const usuariosMensagem =
    document.getElementById("usuariosMensagem");

const usuariosPaginacao =
    document.getElementById("usuariosPaginacao");

const usuariosAnterior =
    document.getElementById("usuariosAnterior");

const usuariosProximo =
    document.getElementById("usuariosProximo");

const usuariosPagina =
    document.getElementById("usuariosPagina");


// ==========================================
// ESTADO DA LISTAGEM
// ==========================================

let paginaUsuariosAtual = 1;

let totalPaginasUsuarios = 0;

let temporizadorBuscaUsuarios = null;

let controladorBuscaUsuarios = null;

let versaoBuscaUsuarios = 0;


// ==========================================
// CRIAR ELEMENTOS DE TEXTO
// ==========================================

function criarTextoUsuario(
    elemento,
    classe,
    texto
) {

    const item = document.createElement(elemento);

    if (classe) {
        item.className = classe;
    }

    item.textContent = texto;

    return item;
}


// ==========================================
// CRIAR ESTATÍSTICA DO PERFIL
// ==========================================

function criarEstatisticaUsuario(
    quantidade,
    descricao
) {

    const container =
        document.createElement("div");

    container.className =
        "usuario-card-estatistica";


    const numero = criarTextoUsuario(
        "strong",
        "",
        String(Number(quantidade) || 0)
    );

    const texto = criarTextoUsuario(
        "span",
        "",
        descricao
    );


    container.append(numero, texto);

    return container;

}


// ==========================================
// CRIAR CARD DO USUÁRIO
// ==========================================

function criarCardUsuario(usuario) {

    const id = Number(usuario.id);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        return null;
    }


    // CARD PRINCIPAL

    const card =
        document.createElement("article");

    card.className = "usuario-card";


    // ======================================
    // IDENTIDADE
    // ======================================

    const identidade =
        document.createElement("div");

    identidade.className =
        "usuario-card-identidade";


    // AVATAR COM A INICIAL DO NOME

    const avatar =
        document.createElement("div");

    avatar.className =
        "usuario-card-avatar";

    avatar.setAttribute(
        "aria-hidden",
        "true"
    );


    const nome = String(
        usuario.nome || "Jogador"
    ).trim();

    avatar.textContent =
        nome.charAt(0).toUpperCase() || "J";


    // NOME E IDENTIFICAÇÃO

    const dados =
        document.createElement("div");

    dados.className =
        "usuario-card-dados";


    const titulo = criarTextoUsuario(
        "h3",
        "usuario-card-nome",
        nome
    );


    const etiqueta = criarTextoUsuario(
        "span",
        "usuario-card-etiqueta",
        "MEMBRO DA BREAK TEC"
    );


    dados.append(
        titulo,
        etiqueta
    );


    identidade.append(
        avatar,
        dados
    );


    // ======================================
    // BIOGRAFIA
    // ======================================

    const biografia = criarTextoUsuario(
        "p",
        "usuario-card-biografia",
        usuario.biografia ||
        "Este jogador ainda não adicionou uma biografia."
    );


    // ======================================
    // ESTATÍSTICAS
    // ======================================

    const estatisticas =
        document.createElement("div");

    estatisticas.className =
        "usuario-card-estatisticas";


    const projetos =
        criarEstatisticaUsuario(
            usuario.total_projetos,
            "Projetos"
        );


    const avaliacoes =
        criarEstatisticaUsuario(
            usuario.total_avaliacoes,
            "Avaliações"
        );


    estatisticas.append(
        projetos,
        avaliacoes
    );


    // ======================================
    // LINK DO PERFIL PÚBLICO
    // ======================================

    const link =
        document.createElement("a");

    link.className =
        "usuario-card-link";

    link.href =
        `usuario.html?id=${encodeURIComponent(id)}`;

    link.textContent =
        "Ver perfil →";

    link.setAttribute(
        "aria-label",
        `Ver perfil de ${nome}`
    );


    // MONTAR CARD

    card.append(
        identidade,
        biografia,
        estatisticas,
        link
    );


    return card;

}


// ==========================================
// EXIBIR ESTADO DA LISTAGEM
// ==========================================

function mostrarEstadoUsuarios(
    mensagem,
    classe = "usuarios-carregando"
) {

    const estado =
        document.createElement("div");

    estado.className = classe;

    estado.textContent = mensagem;

    usuariosGrid.replaceChildren(estado);

}


// ==========================================
// CARREGAR USUÁRIOS PÚBLICOS
// ==========================================

async function carregarUsuariosPublicos() {

    // IMPEDE QUE CONSULTAS ANTIGAS
    // SOBRESCREVAM RESULTADOS NOVOS

    const consultaAtual = ++versaoBuscaUsuarios;


    // CANCELAR REQUISIÇÃO ANTERIOR

    if (controladorBuscaUsuarios) {

        controladorBuscaUsuarios.abort();

    }


    controladorBuscaUsuarios =
        new AbortController();


    // ESTADO DE CARREGAMENTO

    mostrarEstadoUsuarios(
        "Carregando perfis públicos..."
    );

    usuariosQuantidade.textContent =
        "Carregando...";

    usuariosMensagem.hidden = true;

    usuariosMensagem.textContent = "";

    usuariosPaginacao.hidden = true;


    // PARÂMETROS DA BUSCA

    const parametros =
        new URLSearchParams({

            busca: pesquisaUsuarios.value.trim(),

            pagina: String(paginaUsuariosAtual)

        });


    try {

        const resposta = await fetch(
            `/api/usuarios/publicos?${parametros}`,
            {
                signal:
                    controladorBuscaUsuarios.signal
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar os membros da comunidade."
            );

        }


        const dados = await resposta.json();


        // IGNORAR RESULTADOS ANTIGOS

        if (
            consultaAtual !== versaoBuscaUsuarios
        ) {
            return;
        }


        const usuarios =
            Array.isArray(dados.usuarios)
                ? dados.usuarios
                : [];


        const total =
            Number(dados.total) || 0;


        totalPaginasUsuarios =
            Number(dados.totalPaginas) || 0;


        // ==================================
        // QUANTIDADE DE MEMBROS
        // ==================================

        usuariosQuantidade.textContent =
            `${total} ${
                total === 1
                    ? "perfil encontrado"
                    : "perfis encontrados"
            }`;


        // ==================================
        // LIMPAR RESULTADOS ANTERIORES
        // ==================================

        usuariosGrid.replaceChildren();


        // ==================================
        // NENHUM PERFIL ENCONTRADO
        // ==================================

        if (usuarios.length === 0) {

            const mensagem =
                pesquisaUsuarios.value.trim()

                    ? "Nenhum perfil público encontrado com esse nome."

                    : "Ainda não existem perfis públicos disponíveis. Seja um dos primeiros a participar!";


            mostrarEstadoUsuarios(
                mensagem,
                "usuarios-vazio"
            );

        } else {

            // ==================================
            // CRIAR CARDS
            // ==================================

            usuarios.forEach(usuario => {

                const card =
                    criarCardUsuario(usuario);

                if (card) {

                    usuariosGrid.appendChild(card);

                }

            });

        }


        // ==================================
        // PAGINAÇÃO
        // ==================================

        usuariosPaginacao.hidden =
            totalPaginasUsuarios <= 1;


        usuariosPagina.textContent =
            `Página ${paginaUsuariosAtual} de ${totalPaginasUsuarios}`;


        usuariosAnterior.disabled =
            paginaUsuariosAtual <= 1;


        usuariosProximo.disabled =
            !dados.temProxima;


    } catch (erro) {

        // CANCELAMENTO NORMAL DA BUSCA

        if (erro.name === "AbortError") {
            return;
        }


        // IGNORAR ERROS DE BUSCAS ANTIGAS

        if (
            consultaAtual !== versaoBuscaUsuarios
        ) {
            return;
        }


        console.error(
            "Erro ao carregar usuários:",
            erro
        );


        mostrarEstadoUsuarios(
            "Não foi possível carregar os perfis. Tente novamente.",
            "usuarios-erro"
        );


        usuariosQuantidade.textContent =
            "Indisponível";


        usuariosMensagem.textContent =
            "Verifique sua conexão com o servidor e tente novamente.";

        usuariosMensagem.hidden = false;

        usuariosPaginacao.hidden = true;

    }

}


// ==========================================
// PESQUISA POR NOME
// ==========================================

pesquisaUsuarios.addEventListener(
    "input",
    function () {

        // VOLTAR PARA PRIMEIRA PÁGINA

        paginaUsuariosAtual = 1;


        // MOSTRAR OU ESCONDER BOTÃO LIMPAR

        limparPesquisaUsuarios.hidden =
            pesquisaUsuarios.value.length === 0;


        // CANCELAR TEMPORIZADOR ANTERIOR

        clearTimeout(temporizadorBuscaUsuarios);


        // INVALIDAR BUSCA ATUAL

        versaoBuscaUsuarios++;

        if (controladorBuscaUsuarios) {

            controladorBuscaUsuarios.abort();

        }


        // PEQUENO INTERVALO PARA EVITAR
        // UMA REQUISIÇÃO POR TECLA

        temporizadorBuscaUsuarios =
            setTimeout(() => {

                carregarUsuariosPublicos();

            }, 400);

    }
);


// ==========================================
// LIMPAR PESQUISA
// ==========================================

limparPesquisaUsuarios.addEventListener(
    "click",
    function () {

        clearTimeout(temporizadorBuscaUsuarios);

        pesquisaUsuarios.value = "";

        limparPesquisaUsuarios.hidden = true;

        paginaUsuariosAtual = 1;

        carregarUsuariosPublicos();

        pesquisaUsuarios.focus();

    }
);


// ==========================================
// PÁGINA ANTERIOR
// ==========================================

usuariosAnterior.addEventListener(
    "click",
    function () {

        if (paginaUsuariosAtual <= 1) {
            return;
        }


        paginaUsuariosAtual--;

        carregarUsuariosPublicos();


        document.querySelector(
            ".usuarios-resultados"
        ).scrollIntoView({
            behavior: "smooth"
        });

    }
);


// ==========================================
// PRÓXIMA PÁGINA
// ==========================================

usuariosProximo.addEventListener(
    "click",
    function () {

        if (
            paginaUsuariosAtual >=
            totalPaginasUsuarios
        ) {
            return;
        }


        paginaUsuariosAtual++;

        carregarUsuariosPublicos();


        document.querySelector(
            ".usuarios-resultados"
        ).scrollIntoView({
            behavior: "smooth"
        });

    }
);


// ==========================================
// INICIAR A PÁGINA
// ==========================================

carregarUsuariosPublicos();