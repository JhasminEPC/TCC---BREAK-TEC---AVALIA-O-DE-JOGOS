
// ==========================================
// BREAK TEC - PERFIL PÚBLICO DO USUÁRIO
// ==========================================

// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const usuarioCarregando =
    document.getElementById("usuarioCarregando");

const usuarioErro =
    document.getElementById("usuarioErro");

const usuarioErroMensagem =
    document.getElementById("usuarioErroMensagem");

const usuarioConteudo =
    document.getElementById("usuarioConteudo");

const usuarioInicial =
    document.getElementById("usuarioInicial");

const usuarioNome =
    document.getElementById("usuarioNome");

const usuarioBiografia =
    document.getElementById("usuarioBiografia");

const usuarioTotalProjetos =
    document.getElementById("usuarioTotalProjetos");

const usuarioTotalAvaliacoes =
    document.getElementById("usuarioTotalAvaliacoes");

const usuarioAvaliacoes =
    document.getElementById("usuarioAvaliacoes");

const usuarioProjetos =
    document.getElementById("usuarioProjetos");


// ==========================================
// OBTER ID DO USUÁRIO PELA URL
// ==========================================

const parametrosUsuario =
    new URLSearchParams(window.location.search);

const idUsuarioTexto =
    parametrosUsuario.get("id");

const idUsuario =
    Number(idUsuarioTexto);


// ==========================================
// CRIAR ELEMENTOS COM SEGURANÇA
// ==========================================

function criarElementoUsuario(tag, classe, texto) {

    const elemento =
        document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined && texto !== null) {
        elemento.textContent = String(texto);
    }

    return elemento;

}


// ==========================================
// VALIDAR ENDEREÇO DE IMAGEM
// ==========================================

function obterImagemUsuario(endereco) {

    if (
        typeof endereco !== "string" ||
        !endereco.trim()
    ) {
        return null;
    }

    try {

        // ACEITA IMAGENS EXTERNAS E CAMINHOS
        // RELATIVOS À RAIZ DO PROJETO

        const url = new URL(
            endereco.trim(),
            window.location.origin + "/"
        );

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {
            return null;
        }

        return url.href;

    } catch (erro) {

        return null;

    }

}


// ==========================================
// FORMATAR DATA
// ==========================================

function formatarDataUsuario(valor) {

    if (!valor) {
        return "";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return "";
    }

    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


// ==========================================
// EXIBIR ERROS
// ==========================================

function mostrarErroUsuario(mensagem) {

    usuarioCarregando.hidden = true;

    usuarioConteudo.hidden = true;

    usuarioErro.hidden = false;

    usuarioErroMensagem.textContent = mensagem;

}


// ==========================================
// EXIBIR MENSAGEM DE LISTA VAZIA
// ==========================================

function criarEstadoVazioUsuario(mensagem) {

    return criarElementoUsuario(
        "p",
        "usuario-vazio",
        mensagem
    );

}


// ==========================================
// PREENCHER IDENTIDADE DO USUÁRIO
// ==========================================

function preencherIdentidadeUsuario(usuario) {

    const nome =
        typeof usuario.nome === "string" &&
        usuario.nome.trim()

            ? usuario.nome.trim()
            : "Jogador";


    // NOME

    usuarioNome.textContent = nome;


    // AVATAR COM A PRIMEIRA LETRA

    usuarioInicial.textContent =
        nome.charAt(0).toUpperCase();


    // BIOGRAFIA

    usuarioBiografia.textContent =
        typeof usuario.biografia === "string" &&
        usuario.biografia.trim()

            ? usuario.biografia.trim()
            : "Este jogador ainda não adicionou uma biografia.";


    // TÍTULO DA ABA DO NAVEGADOR

    document.title =
        `${nome} | Break Tec`;

}


// ==========================================
// PREENCHER GAMER PASSPORT PÚBLICO
// ==========================================

function preencherPassportPublico(passport) {

    const secao =
        document.getElementById("usuarioPassport");

    const campos = {
        arquetipo: "usuarioPassportArquetipo",
        generos: "usuarioPassportGeneros",
        plataforma: "usuarioPassportPlataforma",
        estilo: "usuarioPassportEstilo",
        lema: "usuarioPassportLema"
    };

    const dados =
        passport && typeof passport === "object"
            ? passport
            : {};

    let possuiInformacoes = false;

    Object.entries(campos).forEach(([chave, id]) => {

        const elemento =
            document.getElementById(id);

        const valor =
            typeof dados[chave] === "string"
                ? dados[chave].trim()
                : "";

        elemento.textContent =
            valor || "Não informado";

        if (valor) {
            possuiInformacoes = true;
        }

    });

    // OCULTAR O PASSPORT SE ESTIVER VAZIO

    secao.hidden = !possuiInformacoes;

}


// ==========================================
// BREAK TEC - GAME VAULT PÚBLICO
// ==========================================

function preencherGameVaultPublico(vault) {

    const secao =
        document.getElementById("usuarioGameVault");

    const grid =
        document.getElementById("usuarioVaultGrid");

    if (!secao || !grid) {
        return;
    }

    grid.replaceChildren();


    // CONFIGURAÇÃO DOS TRÊS ESPAÇOS

    const slots = [
        {
            chave: "favorito",
            titulo: "Favorito",
            descricao: "O favorito de todos os tempos."
        },

        {
            chave: "jogando",
            titulo: "Jogando",
            descricao: "O que está jogando atualmente."
        },

        {
            chave: "quero_jogar",
            titulo: "Quero jogar",
            descricao: "Sua próxima aventura."
        }
    ];


    const dados =
        vault && typeof vault === "object"
            ? vault
            : {};


    // VERIFICAR SE EXISTE ALGUM JOGO

    const possuiJogos = slots.some(item => {

        const jogo = dados[item.chave];

        return (
            jogo &&
            Number.isSafeInteger(Number(jogo.id_externo)) &&
            Number(jogo.id_externo) > 0
        );

    });


    if (!possuiJogos) {

        secao.hidden = true;
        return;

    }


    // ======================================
    // GERAR CADA CARD
    // ======================================

    slots.forEach((item, indice) => {

        const jogo = dados[item.chave];

        const id = Number(jogo?.id_externo);

        const jogoValido =
            Number.isSafeInteger(id) && id > 0;


        // CARD PRINCIPAL

        const card =
            document.createElement("article");

        card.className = "usuario-vault-card";


        // NÚMERO DO SLOT

        const numero =
            document.createElement("span");

        numero.className = "usuario-vault-numero";

        numero.textContent =
            String(indice + 1).padStart(2, "0");


        // CAPA DO JOGO

        const capa =
            document.createElement("div");

        capa.className = "usuario-vault-capa";


        if (jogoValido && jogo.imagem) {

            const endereco =
                obterImagemUsuario(jogo.imagem);

            if (endereco) {

                const imagem =
                    document.createElement("img");

                imagem.src = endereco;

                imagem.alt =
                    `Capa do jogo ${jogo.titulo || "selecionado"}`;

                imagem.loading = "lazy";

                imagem.addEventListener("error", () => {
                    capa.textContent = "🎮";
                });

                capa.appendChild(imagem);

            } else {

                capa.textContent = "🎮";

            }

        } else {

            capa.textContent = jogoValido ? "🎮" : "+";

        }


        // TIPO DO SLOT

        const tipo =
            document.createElement("span");

        tipo.className = "usuario-vault-tipo";

        tipo.textContent = item.titulo;


        // TÍTULO DO JOGO

        const titulo =
            document.createElement("h3");

        titulo.textContent = jogoValido
            ? jogo.titulo || "Jogo selecionado"
            : "Nenhum jogo selecionado";


        // DESCRIÇÃO

        const descricao =
            document.createElement("p");

        descricao.textContent = jogoValido
            ? "Explore este jogo no catálogo da Break Tec."
            : item.descricao;


        card.append(
            numero,
            capa,
            tipo,
            titulo,
            descricao
        );


        // ==================================
        // LINK PARA JOGO OFICIAL
        // ==================================

        if (jogoValido) {

            const link =
                document.createElement("a");

            link.className = "usuario-vault-link";

            link.href =
                `jogo-oficial.html?id=${encodeURIComponent(id)}`;

            link.textContent = "Conhecer jogo →";

            card.appendChild(link);

        }


        grid.appendChild(card);

    });


    secao.hidden = false;

}


// ==========================================
// PREENCHER ESTATÍSTICAS
// ==========================================

function preencherEstatisticasUsuario(estatisticas) {

    usuarioTotalProjetos.textContent =
        String(
            Number(estatisticas.projetos) || 0
        );

    usuarioTotalAvaliacoes.textContent =
        String(
            Number(estatisticas.avaliacoes) || 0
        );

}


// ==========================================
// CRIAR CARD DE AVALIAÇÃO
// ==========================================

function criarAvaliacaoUsuario(avaliacao) {

    const oficial =
        avaliacao.origem === "oficial";

    const id = Number(avaliacao.jogo_id);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        return null;
    }


    // CARD PRINCIPAL

    const card =
        document.createElement("article");

    card.className =
        "usuario-avaliacao-card";


    // INFORMAÇÕES

    const informacoes =
        document.createElement("div");

    informacoes.className =
        "usuario-avaliacao-info";


    // TÍTULO COM LINK

    const titulo =
        criarElementoUsuario(
            "a",
            "usuario-avaliacao-titulo",
            avaliacao.titulo || "Jogo sem título"
        );

    titulo.href = oficial

        ? `jogo-oficial.html?id=${id}`

        : `jogos.html?id=${id}`;


    // ORIGEM

    const origem =
        criarElementoUsuario(
            "span",
            oficial

                ? "usuario-avaliacao-origem oficial"

                : "usuario-avaliacao-origem comunidade",

            oficial
                ? "JOGO OFICIAL"
                : "COMUNIDADE"
        );


    informacoes.append(
        titulo,
        origem
    );


    // DATA DA AVALIAÇÃO

    const data =
        formatarDataUsuario(avaliacao.criado_em);

    if (data) {

        const elementoData =
            criarElementoUsuario(
                "span",
                "usuario-avaliacao-data",
                `Avaliado em ${data}`
            );

        informacoes.appendChild(elementoData);

    }


    // ======================================
    // NOTA DO USUÁRIO
    // ======================================

    const notaContainer =
        document.createElement("div");

    notaContainer.className =
        "usuario-avaliacao-nota";


    // NOTAS SÃO REGISTRADAS DE 1 A 5.
    // CONVERTEMOS PARA A ESCALA DE 0 A 10.

    const notaOriginal =
        Number(avaliacao.nota);

    const notaValida =
        Number.isFinite(notaOriginal) &&
        notaOriginal >= 1 &&
        notaOriginal <= 5;

    const notaFormatada = notaValida

        ? `${(notaOriginal * 2).toFixed(1)}/10`

        : "Sem nota";


    notaContainer.textContent =
        `★ ${notaFormatada}`;

    notaContainer.setAttribute(
        "aria-label",
        notaValida
            ? `Nota atribuída pelo jogador: ${notaFormatada}`
            : "Nota indisponível"
    );


    card.append(
        informacoes,
        notaContainer
    );

    return card;

}


// ==========================================
// RENDERIZAR AVALIAÇÕES
// ==========================================

function renderizarAvaliacoesUsuario(avaliacoes) {

    usuarioAvaliacoes.replaceChildren();


    if (
        !Array.isArray(avaliacoes) ||
        avaliacoes.length === 0
    ) {

        usuarioAvaliacoes.appendChild(
            criarEstadoVazioUsuario(
                "Este jogador ainda não realizou avaliações."
            )
        );

        return;

    }


    let quantidade = 0;

    avaliacoes.forEach(avaliacao => {

        const card =
            criarAvaliacaoUsuario(avaliacao);

        if (card) {

            usuarioAvaliacoes.appendChild(card);

            quantidade++;

        }

    });


    if (quantidade === 0) {

        usuarioAvaliacoes.appendChild(
            criarEstadoVazioUsuario(
                "Nenhuma avaliação disponível."
            )
        );

    }

}


// ==========================================
// CRIAR CARD DE PROJETO
// ==========================================

function criarProjetoUsuario(projeto) {

    const id = Number(projeto.id);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        return null;
    }


    // CARD PRINCIPAL

    const card =
        document.createElement("article");

    card.className =
        "usuario-projeto-card";


    // ======================================
    // IMAGEM
    // ======================================

    const capa =
        document.createElement("div");

    capa.className =
        "usuario-projeto-imagem";

    capa.textContent = "BREAKTEC";


    const enderecoImagem =
        obterImagemUsuario(projeto.imagem);


    if (enderecoImagem) {

        const imagem =
            document.createElement("img");

        imagem.src = enderecoImagem;

        imagem.alt =
            `Capa do projeto ${projeto.titulo || "sem título"}`;

        imagem.loading = "lazy";


        // MANTER UM PLACEHOLDER SE A CAPA FALHAR

        imagem.addEventListener("error", () => {

            capa.textContent = "BREAKTEC";

        });


        capa.replaceChildren(imagem);

    }


    // ======================================
    // CONTEÚDO
    // ======================================

    const conteudo =
        document.createElement("div");

    conteudo.className =
        "usuario-projeto-conteudo";


    // CATEGORIA

    const categoria =
        criarElementoUsuario(
            "span",
            "usuario-projeto-categoria",
            projeto.categoria || "Projeto independente"
        );


    // TÍTULO

    const titulo =
        criarElementoUsuario(
            "h3",
            "",
            projeto.titulo || "Projeto sem título"
        );


    // DESCRIÇÃO

    const descricao =
        criarElementoUsuario(
            "p",
            "usuario-projeto-descricao",
            projeto.descricao ||
            "Projeto publicado na comunidade Break Tec."
        );


    // LINK

    const link =
        criarElementoUsuario(
            "a",
            "usuario-projeto-link",
            "Conhecer projeto →"
        );

    link.href =
        `jogos.html?id=${id}`;


    conteudo.append(
        categoria,
        titulo,
        descricao,
        link
    );


    card.append(
        capa,
        conteudo
    );

    return card;

}


// ==========================================
// RENDERIZAR PROJETOS
// ==========================================

function renderizarProjetosUsuario(projetos) {

    usuarioProjetos.replaceChildren();


    if (
        !Array.isArray(projetos) ||
        projetos.length === 0
    ) {

        usuarioProjetos.appendChild(
            criarEstadoVazioUsuario(
                "Este membro ainda não publicou projetos."
            )
        );

        return;

    }


    let quantidade = 0;

    projetos.forEach(projeto => {

        const card =
            criarProjetoUsuario(projeto);

        if (card) {

            usuarioProjetos.appendChild(card);

            quantidade++;

        }

    });


    if (quantidade === 0) {

        usuarioProjetos.appendChild(
            criarEstadoVazioUsuario(
                "Nenhum projeto disponível."
            )
        );

    }

}


// ==========================================
// CARREGAR PERFIL PÚBLICO DO MYSQL
// ==========================================

async function carregarPerfilPublicoUsuario() {

    // VERIFICAR SE EXISTE UM ID VÁLIDO

    if (
        !idUsuarioTexto ||
        !/^\d+$/.test(idUsuarioTexto) ||
        !Number.isSafeInteger(idUsuario) ||
        idUsuario <= 0
    ) {

        mostrarErroUsuario(
            "O endereço do perfil é inválido."
        );

        return;

    }


    usuarioCarregando.hidden = false;

    usuarioErro.hidden = true;

    usuarioConteudo.hidden = true;


    try {

        // CONSULTAR A ROTA QUE JÁ CRIAMOS

        const resposta = await fetch(
            `/api/usuarios/publicos/${idUsuario}`
        );


        // PERFIL PRIVADO OU INEXISTENTE

        if (resposta.status === 404) {

            mostrarErroUsuario(
                "Este perfil não está disponível para visualização pública."
            );

            return;

        }


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar este perfil."
            );

        }


        const dados = await resposta.json();


        // VERIFICAR ESTRUTURA DA RESPOSTA

        if (
            !dados.usuario ||
            !dados.estatisticas
        ) {

            throw new Error(
                "Os dados do perfil estão incompletos."
            );

        }


        // ==================================
        // PREENCHER O PERFIL
        // ==================================

        preencherIdentidadeUsuario(
            dados.usuario
        );

        preencherPassportPublico(
            dados.passport
        );

        preencherGameVaultPublico(
            dados.gameVault
        );

        preencherEstatisticasUsuario(
            dados.estatisticas
        );

        renderizarAvaliacoesUsuario(
            dados.avaliacoes
        );

        renderizarProjetosUsuario(
            dados.projetos
        );


        // ==================================
        // EXIBIR CONTEÚDO
        // ==================================

        usuarioCarregando.hidden = true;

        usuarioErro.hidden = true;

        usuarioConteudo.hidden = false;


    } catch (erro) {

        console.error(
            "Erro ao carregar perfil público:",
            erro
        );

        mostrarErroUsuario(
            "Não foi possível carregar o perfil. Verifique sua conexão e tente novamente."
        );

    }

}


// ==========================================
// INICIAR PÁGINA
// ==========================================

carregarPerfilPublicoUsuario();
