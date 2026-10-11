// ==========================
// CARREGAR PERFIL DO USUÁRIO
// ==========================

async function carregarPerfil() {

    const perfilNome =
        document.getElementById("perfilNome");

    const perfilEmail =
        document.getElementById("perfilEmail");

    const perfilInicial =
        document.getElementById("perfilInicial");


    try {

        const resposta =
            await fetch("/api/sessao");

        // USUÁRIO NÃO ESTÁ LOGADO
        if (!resposta.ok) {

            window.location.href =
                "login.html";

            return;
        }

        const dados =
            await resposta.json();

        const usuario =
            dados.usuario;


        // COLOCA OS DADOS NA TELA

        perfilNome.textContent =
            usuario.nome;

        perfilEmail.textContent =
            usuario.email;

        perfilInicial.textContent =
            usuario.nome
                .charAt(0)
                .toUpperCase();

    } catch (erro) {

        console.error(
            "Erro ao carregar perfil:",
            erro
        );

        window.location.href =
            "login.html";

    }

}


// EXECUTA QUANDO A PÁGINA ABRIR
carregarPerfil();

// ==========================
// ESTATÍSTICAS DO PERFIL
// ==========================

async function carregarEstatisticas() {

    const totalProjetos =
        document.getElementById("totalProjetos");

    const totalAvaliacoes =
        document.getElementById("totalAvaliacoes");

    const totalFavoritos =
        document.getElementById("totalFavoritos");


    try {

        const resposta =
            await fetch(
                "/api/perfil/estatisticas"
            );


        if (!resposta.ok) {
            return;
        }


        const dados =
            await resposta.json();


        totalProjetos.textContent =
            dados.projetos;

        totalAvaliacoes.textContent =
            dados.avaliacoes;


    } catch (erro) {

        console.error(
            "Erro ao carregar estatísticas:",
            erro
        );

    }

}


carregarEstatisticas();

// ==========================
// NOVO PROJETO
// ==========================

const botaoNovoProjeto =
    document.getElementById("novoProjeto");

const formProjetoArea =
    document.getElementById("formProjetoArea");

const formProjeto =
    document.getElementById("formProjeto");

const cancelarProjeto =
    document.getElementById("cancelarProjeto");

const mensagemProjeto =
    document.getElementById("mensagemProjeto");

let projetoEmEdicao = null;

botaoNovoProjeto.addEventListener(
    "click",
    function () {

        projetoEmEdicao = null;
        formProjeto.reset();
        mensagemProjeto.textContent = "";
        formProjetoArea.hidden = false;

    }
);


cancelarProjeto.addEventListener(
    "click",
    function () {
        projetoEmEdicao = null;
        formProjetoArea.hidden = true;
        formProjeto.reset();
        mensagemProjeto.textContent = "";
    }
);

formProjeto.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        mensagemProjeto.textContent = "";


        const titulo =
            document
                .getElementById("tituloProjeto")
                .value
                .trim();

        const descricao =
            document
                .getElementById("descricaoProjeto")
                .value
                .trim();

        const categoria =
            document
                .getElementById("categoriaProjeto")
                .value
                .trim();


        try {

           let url = "/api/projetos";
           let metodo = "POST";

        if (projetoEmEdicao !== null) {
           url =
        `/api/projetos/${projetoEmEdicao}`;

        metodo = "PUT";
}

        const resposta =
          await fetch(url, {

        method: metodo,

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify({
            titulo,
            descricao,
            categoria
        })

    });

        const dados =
        await resposta.json();

        mensagemProjeto.textContent =
        dados.mensagem;


        if (!resposta.ok) {
        return;
}

        formProjeto.reset();

        projetoEmEdicao = null;

        formProjetoArea.hidden = true;

     carregarEstatisticas();
     carregarMeusProjetos();

     alert(dados.mensagem);


        } catch (erro) {

            console.error(
                "Erro ao publicar projeto:",
                erro
            );

            mensagemProjeto.textContent =
                "Não foi possível publicar o projeto.";

        }

    }
);

// ==========================
// CARREGAR MEUS PROJETOS
// ==========================

async function carregarMeusProjetos() {

    const meusProjetos =
        document.getElementById("meusProjetos");

    try {

        const resposta =
            await fetch("/api/meus-projetos");


        if (!resposta.ok) {
            return;
        }


        const projetos =
            await resposta.json();


        // LIMPA O CONTEÚDO ATUAL
        meusProjetos.innerHTML = "";


        // NÃO TEM PROJETOS
        if (projetos.length === 0) {

            meusProjetos.innerHTML = `
                <div class="estado-vazio">
                    <h3>
                        Nenhum projeto ainda
                    </h3>

                    <p>
                        Seus projetos publicados
                        aparecerão aqui.
                    </p>
                </div>
            `;

            return;
        }


        // CRIA UM CARD PARA CADA PROJETO
        projetos.forEach(
            function (projeto) {

                const card =
                    document.createElement("article");

                card.classList.add(
                    "projeto-card"
                );


                const categoria =
                    projeto.categoria
                    || "Sem categoria";


                const descricao =
                    projeto.descricao
                    || "Sem descrição.";


        card.innerHTML = `
        <span class="projeto-categoria">
            ${categoria}
            </span>

               <h3>
                   ${projeto.titulo}
               </h3>

                <p>
                   ${descricao}
                </p>

        <div class="acoes-projeto">

         <a
        href="jogos.html?id=${projeto.id}"
        class="ver-projeto"
        >
        Ver projeto →
        </a>

        <button
            type="button"
            class="editar-projeto"
            data-id="${projeto.id}"
        >
            Editar
        </button>

        <button
            type="button"
            class="excluir-projeto"
            data-id="${projeto.id}"
        >
            Excluir
        </button>

     </div>
`;


    meusProjetos.appendChild(card);
    
// ==========================
// EDITAR PROJETO
// ==========================

    const botaoEditar =
    card.querySelector(".editar-projeto");

    botaoEditar.addEventListener("click",
    function () {

        projetoEmEdicao =
            projeto.id;

        document
            .getElementById("tituloProjeto")
            .value =
            projeto.titulo;

        document
            .getElementById("descricaoProjeto")
            .value =
            projeto.descricao || "";

        document
            .getElementById("categoriaProjeto")
            .value =
            projeto.categoria || "";

        formProjetoArea.hidden =
            false;

        mensagemProjeto.textContent =
            "Editando projeto";

        formProjetoArea.scrollIntoView({
            behavior: "smooth"
        });

    }
);

//=========================
//EXCLUIR PROJETO
//=========================

    const botaoExcluir =
    card.querySelector(".excluir-projeto");

    botaoExcluir.addEventListener("click",
    async function () {

    const projetoId =
    botaoExcluir.dataset.id;

    const confirmar = confirm("Tem certeza que deseja excluir este projeto?");

    if (!confirmar) {
        return;
        }

        try {

        const resposta =
        await fetch(
            `/api/projetos/${projetoId}`,
            {
                method: "DELETE"
                                    });

        const dados =
        await resposta.json();

        if (!resposta.ok) {

        alert(dados.mensagem);

        return;
            }

            carregarMeusProjetos();
            carregarEstatisticas();

        } catch (erro) {

            console.error(
                "Erro ao excluir projeto:",
                erro
            );

        }

    }
);

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar projetos:",
            erro
        );

    }

}

carregarMeusProjetos();

// ==========================================
// FAVORITOS - OFICIAIS E COMUNIDADE
// ==========================================

// CONSULTAR UMA LISTA DE FAVORITOS

async function buscarListaFavoritos(url) {

    const resposta = await fetch(url, {
        credentials: "same-origin"
    });

    if (!resposta.ok) {
        throw new Error(
            `Erro ao consultar favoritos: ${resposta.status}`
        );
    }

    const dados = await resposta.json();

    return Array.isArray(dados) ? dados : [];
}


// ==========================================
// CRIAR CARD DE FAVORITO
// ==========================================

function criarCardFavorito(item, origem) {

    const oficial = origem === "oficial";

    const id = Number(
        oficial ? item.id_externo : item.id
    );

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    const titulo = item.titulo || "Sem título";

    const card = document.createElement("article");

    card.className = "projeto-card favorito-card";


    // IMAGEM DO JOGO

    const capa = document.createElement("div");

    capa.className = "favorito-capa";

    let urlImagem = null;

    if (typeof item.imagem === "string" && item.imagem) {

        try {

            const url = new URL(
                item.imagem,
                window.location.origin + "/"
            );

            if (["http:", "https:"].includes(url.protocol)) {
                urlImagem = url.href;
            }

        } catch (erro) {

            console.warn("Imagem inválida:", erro);

        }
    }

    if (urlImagem) {

        const imagem = document.createElement("img");

        imagem.src = urlImagem;
        imagem.alt = `Capa de ${titulo}`;
        imagem.loading = "lazy";

        imagem.addEventListener("error", () => {
            imagem.remove();
            capa.textContent = "BREAKTEC";
        }, { once: true });

        capa.appendChild(imagem);

    } else {

        capa.textContent = "BREAKTEC";

    }


    // IDENTIFICAÇÃO DE ORIGEM

    const etiqueta = document.createElement("span");

    etiqueta.className = oficial
        ? "favorito-origem oficial"
        : "favorito-origem comunidade";

    etiqueta.textContent = oficial
        ? "OFICIAL"
        : "COMUNIDADE";


    // TÍTULO

    const nome = document.createElement("h3");

    nome.textContent = titulo;


    // DESENVOLVEDOR / AUTOR

    const autor = document.createElement("p");

    autor.className = "favorito-autor";

    autor.textContent = oficial
        ? `Desenvolvido por: ${item.desenvolvedor || "Não informado"}`
        : `Criado por: ${item.autor_nome || "Autor não disponível"}`;


    // DESCRIÇÃO / CATEGORIA

    const descricao = document.createElement("p");

    descricao.className = "favorito-descricao";

    descricao.textContent = oficial
        ? item.genero || "Jogo do catálogo oficial."
        : item.descricao || item.categoria ||
          "Projeto da comunidade Break Tec.";


    // AÇÕES DO CARD

    const acoes = document.createElement("div");

    acoes.className = "favorito-acoes";


    // ABRIR JOGO

    const link = document.createElement("a");

    link.className = "favorito-ver";

    link.href = oficial
        ? `jogo-oficial.html?id=${id}`
        : `jogos.html?id=${id}`;

    link.textContent = oficial
        ? "Ver jogo →"
        : "Ver projeto →";


    // REMOVER FAVORITO

    const botaoRemover = document.createElement("button");

    botaoRemover.type = "button";

    botaoRemover.className = "remover-favorito";

    botaoRemover.textContent = "Remover favorito";

    botaoRemover.setAttribute(
        "aria-label",
        `Remover ${titulo} dos favoritos`
    );


    // MENSAGEM DE STATUS

    const status = document.createElement("p");

    status.className = "favorito-status";

    status.setAttribute("role", "status");


    // EVENTO DE REMOÇÃO

    botaoRemover.addEventListener("click", async () => {

        botaoRemover.disabled = true;

        botaoRemover.textContent = "Removendo...";

        status.textContent = "";

        const endereco = oficial
            ? `/api/jogos-oficiais/${id}/favoritos`
            : `/api/favoritos/${id}`;

        try {

            const resposta = await fetch(endereco, {
                method: "DELETE",
                credentials: "same-origin"
            });

            if (!resposta.ok) {

                const dados = await resposta.json();

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível remover o favorito."
                );
            }

            // RECARREGA OS DOIS CATÁLOGOS

            await carregarFavoritos();

        } catch (erro) {

            console.error(
                "Erro ao remover favorito:",
                erro
            );

            status.textContent = erro.message;

        } finally {

            botaoRemover.disabled = false;

            botaoRemover.textContent =
                "Remover favorito";

        }
    });


    acoes.append(link, botaoRemover);

    card.append(
        capa,
        etiqueta,
        nome,
        autor,
        descricao,
        acoes,
        status
    );

    return card;
}


// ==========================================
// CARREGAR TODOS OS FAVORITOS
// ==========================================

async function carregarFavoritos() {

    const meusFavoritos =
        document.getElementById("meusFavoritos");

    const totalFavoritos =
        document.getElementById("totalFavoritos");

    if (!meusFavoritos) return;

    meusFavoritos.textContent = "Carregando favoritos...";


    // CONSULTA AS DUAS FONTES

    const resultados = await Promise.allSettled([

        buscarListaFavoritos("/api/meus-favoritos"),

        buscarListaFavoritos("/api/meus-favoritos-oficiais")

    ]);


    const comunidadeDisponivel =
        resultados[0].status === "fulfilled";

    const oficiaisDisponiveis =
        resultados[1].status === "fulfilled";


    const comunidade = comunidadeDisponivel
        ? resultados[0].value
        : [];

    const oficiais = oficiaisDisponiveis
        ? resultados[1].value
        : [];


    meusFavoritos.replaceChildren();


    // ATUALIZA O TOTAL SOMENTE QUANDO AS
    // DUAS CONSULTAS TERMINAREM COM SUCESSO

    if (totalFavoritos) {

        totalFavoritos.textContent =
            comunidadeDisponivel && oficiaisDisponiveis
                ? comunidade.length + oficiais.length
                : "—";
    }


    // ORGANIZA OS CARDS ALTERNANDO AS ORIGENS

    const quantidade = Math.max(
        oficiais.length,
        comunidade.length
    );

    for (let i = 0; i < quantidade; i++) {

        if (oficiais[i]) {

            const card = criarCardFavorito(
                oficiais[i],
                "oficial"
            );

            if (card) {
                meusFavoritos.appendChild(card);
            }
        }

        if (comunidade[i]) {

            const card = criarCardFavorito(
                comunidade[i],
                "comunidade"
            );

            if (card) {
                meusFavoritos.appendChild(card);
            }
        }
    }


    // NENHUM FAVORITO

    if (quantidade === 0) {

        const vazio = document.createElement("div");

        vazio.className = "estado-vazio";

        const titulo = document.createElement("h3");

        titulo.textContent =
            "Nenhum favorito disponível";

        const mensagem = document.createElement("p");

        mensagem.textContent =
            "Os jogos e projetos favoritados aparecerão aqui.";

        vazio.append(titulo, mensagem);

        meusFavoritos.appendChild(vazio);
    }


    // AVISO EM CASO DE FALHA PARCIAL

    if (!comunidadeDisponivel || !oficiaisDisponiveis) {

        const aviso = document.createElement("p");

        aviso.className = "favoritos-aviso";

        aviso.textContent =
        "Não foi possível carregar todos os favoritos. Tente atualizar a página.";

        meusFavoritos.appendChild(aviso);
    }
}

carregarFavoritos();

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
                "login.html";

        } catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

        }

    }
);