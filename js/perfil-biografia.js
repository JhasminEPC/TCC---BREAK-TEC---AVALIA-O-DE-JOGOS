
// ==========================================
// BREAK TEC - EDITAR BIOGRAFIA
// ==========================================

const biografiaForm =
    document.getElementById("perfilBiografiaForm");

const biografiaTexto =
    document.getElementById("perfilBiografiaTexto");

const biografiaContador =
    document.getElementById("perfilBiografiaContador");

const biografiaSalvar =
    document.getElementById("perfilBiografiaSalvar");

const biografiaMensagem =
    document.getElementById("perfilBiografiaMensagem");

let biografiaSalva = "";


// ==========================================
// ATUALIZAR CONTADOR
// ==========================================

function atualizarContadorBiografia() {

    const quantidade = biografiaTexto.value.length;

    biografiaContador.textContent =
        `${quantidade}/280 caracteres`;

    biografiaSalvar.disabled =
        biografiaTexto.disabled ||
        biografiaTexto.value.trim() === biografiaSalva;
}


// ==========================================
// EXIBIR MENSAGEM
// ==========================================

function mostrarMensagemBiografia(texto, tipo = "") {

    biografiaMensagem.textContent = texto;

    biografiaMensagem.className =
        "perfil-biografia-mensagem";

    if (tipo) {
        biografiaMensagem.classList.add(tipo);
    }

}


// ==========================================
// CARREGAR BIOGRAFIA SALVA
// ==========================================

async function carregarBiografia() {

    biografiaTexto.disabled = true;
    biografiaSalvar.disabled = true;
    biografiaSalvar.textContent = "Carregando...";

    try {

        const resposta = await fetch(
            "/api/perfil/biografia"
        );

        if (!resposta.ok) {
            throw new Error(
                resposta.status === 401
                    ? "Sua sessão expirou. Entre novamente."
                    : "Não foi possível carregar sua biografia."
            );
        }

        const dados = await resposta.json();

        biografiaSalva =
            typeof dados.biografia === "string"
                ? dados.biografia
                : "";

        biografiaTexto.value = biografiaSalva;

        biografiaTexto.disabled = false;
        biografiaSalvar.textContent = "Salvar biografia";

        atualizarContadorBiografia();

    } catch (erro) {

        console.error(
            "Erro ao carregar biografia:",
            erro
        );

        biografiaSalvar.textContent = "Indisponível";

        mostrarMensagemBiografia(
            erro.message,
            "erro"
        );

    }

}


// ==========================================
// ATUALIZAR CONTADOR AO DIGITAR
// ==========================================

biografiaTexto.addEventListener("input", () => {

    atualizarContadorBiografia();

    mostrarMensagemBiografia("");

});


// ==========================================
// SALVAR BIOGRAFIA
// ==========================================

biografiaForm.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        if (biografiaTexto.disabled) {
            return;
        }

        const texto = biografiaTexto.value.trim();

        if (texto.length > 280) {

            mostrarMensagemBiografia(
                "A biografia deve ter no máximo 280 caracteres.",
                "erro"
            );

            return;
        }

        biografiaTexto.disabled = true;
        biografiaSalvar.disabled = true;

        biografiaSalvar.textContent = "Salvando...";

        mostrarMensagemBiografia("");

        try {

            const resposta = await fetch(
                "/api/perfil/biografia",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        biografia: texto
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível salvar a biografia."
                );

            }

            biografiaSalva = dados.biografia;

            biografiaTexto.value = biografiaSalva;

            mostrarMensagemBiografia(
                "Biografia salva com sucesso!",
                "sucesso"
            );

        } catch (erro) {

            console.error(
                "Erro ao salvar biografia:",
                erro
            );

            mostrarMensagemBiografia(
                erro.message,
                "erro"
            );

        } finally {

            biografiaTexto.disabled = false;
            biografiaSalvar.textContent = "Salvar biografia";

            atualizarContadorBiografia();

        }

    }
);


// ==========================================
// INICIAR
// ==========================================

carregarBiografia();
