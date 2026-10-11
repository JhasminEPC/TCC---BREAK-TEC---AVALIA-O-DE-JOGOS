
// ==========================================
// BREAK TEC - VISIBILIDADE DO PERFIL
// ==========================================

const perfilVisibilidadeBotao =
    document.getElementById("perfilVisibilidadeBotao");

const perfilVisibilidadeEstado =
    document.getElementById("perfilVisibilidadeEstado");

const perfilVisibilidadeMensagem =
    document.getElementById("perfilVisibilidadeMensagem");

let perfilEstaPublico = false;
let perfilVisibilidadeCarregada = false;


// ==========================================
// ATUALIZAR APARÊNCIA
// ==========================================

function atualizarAparenciaVisibilidade() {

    perfilVisibilidadeEstado.classList.remove(
        "publico",
        "privado"
    );

    if (perfilEstaPublico) {

        perfilVisibilidadeEstado.textContent =
            "● Perfil público";

        perfilVisibilidadeEstado.classList.add(
            "publico"
        );

        perfilVisibilidadeBotao.textContent =
            "Tornar privado";

    } else {

        perfilVisibilidadeEstado.textContent =
            "● Perfil privado";

        perfilVisibilidadeEstado.classList.add(
            "privado"
        );

        perfilVisibilidadeBotao.textContent =
            "Tornar público";

    }

    perfilVisibilidadeBotao.classList.toggle(
        "ativo",
        perfilEstaPublico
    );

    perfilVisibilidadeBotao.setAttribute(
        "aria-pressed",
        String(perfilEstaPublico)
    );

}


// ==========================================
// CONSULTAR VISIBILIDADE ATUAL
// ==========================================

async function carregarVisibilidadePerfil() {

    perfilVisibilidadeBotao.disabled = true;

    perfilVisibilidadeMensagem.textContent = "";

    try {

        const resposta = await fetch(
            "/api/perfil/visibilidade",
            {
                credentials: "same-origin"
            }
        );

        if (!resposta.ok) {

            throw new Error(
                resposta.status === 401
                    ? "Faça login para alterar a visibilidade."
                    : "Não foi possível consultar a visibilidade."
            );

        }

        const dados = await resposta.json();

        perfilEstaPublico = dados.publico === true;

        perfilVisibilidadeCarregada = true;

        atualizarAparenciaVisibilidade();

        perfilVisibilidadeBotao.disabled = false;

    } catch (erro) {

        console.error(
            "Erro ao consultar visibilidade:",
            erro
        );

        perfilVisibilidadeEstado.textContent =
            "Visibilidade indisponível";

        perfilVisibilidadeMensagem.textContent =
            erro.message;

        perfilVisibilidadeMensagem.classList.add(
            "erro"
        );

        perfilVisibilidadeBotao.disabled = true;

    }

}


// ==========================================
// ALTERAR VISIBILIDADE
// ==========================================

async function alterarVisibilidadePerfil() {

    if (!perfilVisibilidadeCarregada) {
        return;
    }

    const novaVisibilidade = !perfilEstaPublico;

    perfilVisibilidadeBotao.disabled = true;

    perfilVisibilidadeBotao.textContent =
        "Salvando...";

    perfilVisibilidadeMensagem.textContent = "";

    perfilVisibilidadeMensagem.classList.remove(
        "erro"
    );

    try {

        const resposta = await fetch(
            "/api/perfil/visibilidade",
            {
                method: "PUT",

                credentials: "same-origin",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    publico: novaVisibilidade
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível alterar a visibilidade."
            );

        }


        // ALTERAR SOMENTE DEPOIS
        // DA CONFIRMAÇÃO DO SERVIDOR

        perfilEstaPublico = dados.publico === true;

        atualizarAparenciaVisibilidade();

        perfilVisibilidadeMensagem.textContent =
            dados.mensagem;


    } catch (erro) {

        console.error(
            "Erro ao alterar visibilidade:",
            erro
        );

        perfilVisibilidadeMensagem.textContent =
            erro.message;

        perfilVisibilidadeMensagem.classList.add(
            "erro"
        );

        // MANTER O ESTADO ANTERIOR

        atualizarAparenciaVisibilidade();

    } finally {

        perfilVisibilidadeBotao.disabled = false;

    }

}


// ==========================================
// EVENTOS
// ==========================================

if (
    perfilVisibilidadeBotao &&
    perfilVisibilidadeEstado &&
    perfilVisibilidadeMensagem
) {

    perfilVisibilidadeBotao.addEventListener(
        "click",
        alterarVisibilidadePerfil
    );

    carregarVisibilidadePerfil();

}
