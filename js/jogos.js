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

        // ==========================
// CARREGAR IMAGEM DO PROJETO
// ==========================

const areaImagem =
    document.getElementById("jogoImagem");

areaImagem.replaceChildren();

if (projeto.imagem) {

    const imagem = document.createElement("img");

    imagem.src = `/api/projetos/${projetoId}/imagem`;

    imagem.alt = `Imagem do projeto ${projeto.titulo}`;

    imagem.classList.add("imagem-projeto-detalhe");

    imagem.onerror = function () {
        areaImagem.textContent = "Imagem indisponível.";
    };

    areaImagem.appendChild(imagem);

} else {

    areaImagem.textContent = "Imagem do projeto";

}

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

        document.getElementById(
        "comentarioAvaliacaoProjeto"
        ).value = avaliacao.comentario || "";

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

            const resposta = await fetch(
    `/api/projetos/${projetoId}/avaliacoes`,
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            ...notas,
            comentario: document.getElementById(
                "comentarioAvaliacaoProjeto"
            ).value.trim()
        })
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
            carregarComentariosBreakTec();

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

// ==========================
// FAVORITAR PROJETO
// ==========================

const botaoFavoritar =
    document.getElementById("favoritarProjeto");

let projetoFavoritado = false;


// Verifica se o projeto já está favoritado
async function verificarFavorito() {

    try {

        const resposta = await fetch(
            `/api/favoritos/${projetoId}/status`
        );

        // Usuário não está logado
        if (resposta.status === 401) {
            projetoFavoritado = false;
            atualizarBotaoFavorito();
            return;
        }

        const dados = await resposta.json();

        projetoFavoritado = dados.favoritado;

        atualizarBotaoFavorito();

    } catch (erro) {

        console.error(
            "Erro ao verificar favorito:",
            erro
        );

    }
}


// Atualiza o texto e aparência do botão
function atualizarBotaoFavorito() {

    if (projetoFavoritado) {

        botaoFavoritar.textContent =
            "★ Favoritado";

        botaoFavoritar.classList.add(
            "favoritado"
        );

    } else {

        botaoFavoritar.textContent =
            "☆ Favoritar";

        botaoFavoritar.classList.remove(
            "favoritado"
        );

    }
}


// Adiciona ou remove o favorito
botaoFavoritar.addEventListener(
    "click",
    async function () {

        try {

            const metodo =
                projetoFavoritado
                    ? "DELETE"
                    : "POST";

            const resposta = await fetch(
                `/api/favoritos/${projetoId}`,
                {
                    method: metodo
                }
            );

            const dados =
                await resposta.json();

            if (resposta.status === 401) {

                alert(
                    "Faça login para favoritar este projeto."
                );

                return;
            }

            if (!resposta.ok) {

                alert(dados.mensagem);
                return;

            }

            projetoFavoritado =
                !projetoFavoritado;

            atualizarBotaoFavorito();

        } catch (erro) {

            console.error(
                "Erro ao alterar favorito:",
                erro
            );

        }

    }
);


// Verifica o favorito assim que a página abre
verificarFavorito();


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
                `${rotaBase}/comentario`,
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
                `${rotaBase}/comentarios`,
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
