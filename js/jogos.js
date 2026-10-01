const parametros = new URLSearchParams(window.location.search);

const projetoId = parametros.get("id");

async function carregarProjeto() {

    if (!projetoId) {
        mostrarErro("Projeto não encontrado.");
        return;
    }

    try {

        const resposta = await fetch(`/api/projetos/${projetoId}`);

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarErro(dados.mensagem);
            return;
        }

        const projeto = dados.projeto;

        document.getElementById("jogoTitulo").textContent =
            projeto.titulo;

        document.getElementById("jogoDescricao").textContent =
            projeto.descricao || "Este projeto ainda não possui descrição.";

        document.getElementById("jogoCategoria").textContent =
            projeto.categoria || "Sem categoria";

        document.getElementById("jogoAutor").textContent =
            projeto.autor_nome || "Usuário desconhecido";

        document.title =
            `${projeto.titulo} | Break Tec`;

    } catch (erro) {

        console.error("Erro ao carregar projeto:", erro);

        mostrarErro(
            "Não foi possível carregar este projeto."
        );

    }

}


function mostrarErro(mensagem) {

    document.getElementById("jogoTitulo").textContent =
        mensagem;

    document.getElementById("jogoDescricao").textContent =
        "";

    document.getElementById("jogoCategoria").textContent =
        "ERRO";

    document.getElementById("jogoAutor").textContent =
        "-";

}


carregarProjeto();

// ==========================
// SISTEMA DE AVALIAÇÃO
// ==========================

const botaoAvaliar =
    document.getElementById("avaliarProjeto");

const modalAvaliacao =
    document.getElementById("modalAvaliacao");

const fecharAvaliacao =
    document.getElementById("fecharAvaliacao");

const formAvaliacao =
    document.getElementById("formAvaliacao");

const mensagemAvaliacao =
    document.getElementById("mensagemAvaliacao");


const notas = {
    jogabilidade: 0,
    historia: 0,
    visual: 0,
    som: 0,
    originalidade: 0
};


// ==========================
// CRIAR ESTRELAS
// ==========================

document
    .querySelectorAll(".estrelas")
    .forEach(function (grupo) {

        const categoria =
            grupo.dataset.categoria;

        for (let numero = 1; numero <= 5; numero++) {

            const estrela =
                document.createElement("button");

            estrela.type = "button";
            estrela.classList.add("estrela");
            estrela.textContent = "★";

            estrela.dataset.valor = numero;

            estrela.addEventListener(
                "click",
                function () {

                    notas[categoria] = numero;

                    atualizarEstrelas(
                        grupo,
                        numero
                    );

                }
            );

            grupo.appendChild(estrela);
        }

    });


// ==========================
// ATUALIZAR VISUAL
// ==========================

function atualizarEstrelas(grupo, nota) {

    const estrelas =
        grupo.querySelectorAll(".estrela");

    estrelas.forEach(function (estrela) {

        const valor =
            Number(estrela.dataset.valor);

        estrela.classList.toggle(
            "selecionada",
            valor <= nota
        );

    });

}

// ==========================
// CARREGAR MINHA AVALIAÇÃO
// ==========================

async function carregarMinhaAvaliacao() {

    try {

        const resposta =
            await fetch(
                `/api/projetos/${projetoId}/minha-avaliacao`
            );

        // Usuário não está logado
        if (resposta.status === 401) {
            return;
        }

        if (!resposta.ok) {
            return;
        }

        const dados =
            await resposta.json();

        if (!dados.avaliou) {
            return;
        }

        document
       .getElementById("tituloModalAvaliacao")
       .textContent ="Edite sua avaliação";

        const avaliacao =
            dados.avaliacao;

        notas.jogabilidade =
            Number(avaliacao.jogabilidade);

        notas.historia =
            Number(avaliacao.historia);

        notas.visual =
            Number(avaliacao.visual);

        notas.som =
            Number(avaliacao.som);

        notas.originalidade =
            Number(avaliacao.originalidade);


        document
            .querySelectorAll(".estrelas")
            .forEach(function (grupo) {

                const categoria =
                    grupo.dataset.categoria;

                atualizarEstrelas(
                    grupo,
                    notas[categoria]
                );

            });


        botaoAvaliar.textContent =
            "★ Sua avaliação";

    } catch (erro) {

        console.error(
            "Erro ao carregar sua avaliação:",
            erro
        );

    }

}

carregarMinhaAvaliacao();


// ==========================
// ABRIR MODAL
// ==========================

botaoAvaliar.addEventListener(
    "click",
    function () {

        modalAvaliacao.hidden = false;

        document.body.classList.add(
            "modal-aberto"
        );

    }
);


// ==========================
// FECHAR MODAL
// ==========================

function fecharModalAvaliacao() {

    modalAvaliacao.hidden = true;

    document.body.classList.remove(
        "modal-aberto"
    );

}


fecharAvaliacao.addEventListener(
    "click",
    fecharModalAvaliacao
);


// CLICAR FORA DO PAINEL

modalAvaliacao.addEventListener(
    "click",
    function (event) {

        if (event.target === modalAvaliacao) {
            fecharModalAvaliacao();
        }

    }
);


// ==========================
// ENVIAR AVALIAÇÃO
// ==========================

formAvaliacao.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        mensagemAvaliacao.textContent = "";

        const todasPreenchidas =
            Object
                .values(notas)
                .every(nota => nota >= 1);

        if (!todasPreenchidas) {

            mensagemAvaliacao.textContent =
                "Avalie todas as categorias.";

            return;
        }

        try {

            const resposta =
                await fetch(
                    `/api/projetos/${projetoId}/avaliacoes`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify(notas)
                    }
                );

            const dados =
                await resposta.json();

            mensagemAvaliacao.textContent =
                dados.mensagem;

            if (!resposta.ok) {
                return;
            }

            carregarDNA();
            carregarMinhaAvaliacao();

            setTimeout(
                fecharModalAvaliacao,
                800
            );

        } catch (erro) {

            console.error(
                "Erro ao enviar avaliação:",
                erro
            );

            mensagemAvaliacao.textContent =
                "Não foi possível enviar a avaliação.";

        }

    }
);

// ==========================
// CARREGAR DNA DO JOGO
// ==========================

async function carregarDNA() {

    try {

        const resposta =
            await fetch(
                `/api/projetos/${projetoId}/dna`
            );

        const dna =
            await resposta.json();

        if (!resposta.ok) {
            return;
        }


        // ==========================
        // TOTAL DE AVALIAÇÕES
        // ==========================

        const textoAvaliacoes =
            dna.totalAvaliacoes === 1
                ? "1 avaliação da comunidade"
                : `${dna.totalAvaliacoes} avaliações da comunidade`;

        document
            .getElementById("totalAvaliacoes")
            .textContent =
            textoAvaliacoes;


        // ==========================
        // NOTAS
        // ==========================

        atualizarDNA(
            "Jogabilidade",
            dna.jogabilidade
        );

        atualizarDNA(
            "Historia",
            dna.historia
        );

        atualizarDNA(
            "Visual",
            dna.visual
        );

        atualizarDNA(
            "Som",
            dna.som
        );

        atualizarDNA(
            "Originalidade",
            dna.originalidade
        );


        // ==========================
        // BREAK SCORE
        // ==========================

        const breakScore =
            dna.breakScore * 2;

        document
            .getElementById("breakScore")
            .textContent =
            breakScore.toFixed(1);


    } catch (erro) {

        console.error(
            "Erro ao carregar DNA:",
            erro
        );

    }

}


// ==========================
// ATUALIZAR UMA CATEGORIA
// ==========================

function atualizarDNA(categoria, nota) {

    const notaElemento =
        document.getElementById(
            `nota${categoria}`
        );

    const barra =
        document.getElementById(
            `barra${categoria}`
        );


    notaElemento.textContent =
        Number(nota).toFixed(1);


    // 5 estrelas = 100%
    const porcentagem =
        (Number(nota) / 5) * 100;


    barra.style.width =
        `${porcentagem}%`;

}


carregarDNA();