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

        totalFavoritos.textContent =
            dados.favoritos;


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

        <button
        type="button"
        class="favoritar-projeto"
        data-id="${projeto.id}"
        >
        ☆ Favoritar
        </button>

    </div>
`;


    meusProjetos.appendChild(card);
    
// ==========================
// FAVORITAR PROJETO
// ==========================

const botaoFavoritar =
    card.querySelector(".favoritar-projeto");

botaoFavoritar.addEventListener(
    "click",
    async function () {

        try {

            const resposta =
                await fetch(
                    `/api/favoritos/${projeto.id}`,
                    {
                        method: "POST"
                    }
                );

            const dados =
                await resposta.json();

            if (!resposta.ok) {

                alert(dados.mensagem);
                return;

            }

            alert(dados.mensagem);

            // Atualiza favoritos e contador
            carregarFavoritos();
            carregarEstatisticas();

        } catch (erro) {

            console.error(
                "Erro ao favoritar projeto:",
                erro
            );

        }

    }
);

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

// ==========================
// CARREGAR FAVORITOS
// ==========================

async function carregarFavoritos() {

    const meusFavoritos =
    document.getElementById("meusFavoritos");

    try {

    const resposta =
    await fetch("/api/meus-favoritos");

    if (!resposta.ok) {
        return;
        }

    const favoritos =
    await resposta.json();

    meusFavoritos.innerHTML = "";

    if (favoritos.length === 0) {

    meusFavoritos.innerHTML = `
        <div class="estado-vazio">
        <h3>
        Nenhum favorito ainda
        </h3>

        <p>
        Os projetos que você favoritar
        aparecerão aqui.
        </p>
                </div>
            `;

            return;
        }

        favoritos.forEach(
            function (projeto) {

            const card =
                document.createElement("article");

            card.classList.add("projeto-card");
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

                <button
                    type="button"
                    class="remover-favorito"
                    >
                    Remover favorito
                    </button>
                `;

            const botaoRemover =
                card.querySelector(".remover-favorito");

                botaoRemover.addEventListener(
                    "click",
                    async function () {

                        try {

                            const resposta =
                                await fetch(
                                    `/api/favoritos/${projeto.id}`,
                                    {
                                        method: "DELETE"
                                    }
                                );

                            const dados =
                                await resposta.json();

                            if (!resposta.ok) {
                                alert(dados.mensagem);
                                return;
                            }

                            carregarFavoritos();
                            carregarEstatisticas();

                        } catch (erro) {

                            console.error(
                                "Erro ao remover favorito:",
                                erro
                            );
                        }
                    }
                );

                meusFavoritos.appendChild(
                    card
                );
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar favoritos:",
            erro
        );
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