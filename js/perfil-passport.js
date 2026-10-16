
// ==========================================
// BREAK TEC - GAMER PASSPORT
// ==========================================

// ELEMENTOS DO FORMULÁRIO

const passportForm =
    document.getElementById("passportForm");

const passportArquetipo =
    document.getElementById("passportArquetipo");

const passportGeneros =
    document.getElementById("passportGeneros");

const passportPlataforma =
    document.getElementById("passportPlataforma");

const passportEstilo =
    document.getElementById("passportEstilo");

const passportLema =
    document.getElementById("passportLema");

const passportSalvar =
    document.getElementById("passportSalvar");

const passportMensagem =
    document.getElementById("passportMensagem");


// ==========================================
// ORGANIZAR OS CAMPOS
// ==========================================

const camposPassport = [
    passportArquetipo,
    passportGeneros,
    passportPlataforma,
    passportEstilo,
    passportLema
];

let passportSalvo = null;
let passportDisponivel = false;
let passportOcupado = false;


// ==========================================
// OBTER VALORES DIGITADOS
// ==========================================

function obterDadosPassport() {

    return {
        arquetipo: passportArquetipo.value.trim(),
        generos: passportGeneros.value.trim(),
        plataforma: passportPlataforma.value,
        estilo: passportEstilo.value,
        lema: passportLema.value.trim()
    };

}


// ==========================================
// MOSTRAR MENSAGEM
// ==========================================

function mostrarMensagemPassport(mensagem, tipo = "") {

    passportMensagem.textContent = mensagem;

    passportMensagem.className =
        "passport-mensagem";

    if (tipo) {
        passportMensagem.classList.add(tipo);
    }

}


// ==========================================
// HABILITAR / DESABILITAR CAMPOS
// ==========================================

function controlarCamposPassport(desativar) {

    camposPassport.forEach(campo => {
        campo.disabled = desativar;
    });

}


// ==========================================
// VERIFICAR ALTERAÇÕES
// ==========================================

function atualizarBotaoPassport() {

    if (
        !passportDisponivel ||
        passportOcupado ||
        !passportSalvo
    ) {
        passportSalvar.disabled = true;
        return;
    }

    const atuais = obterDadosPassport();

    const houveAlteracao = Object.keys(atuais).some(
        campo => atuais[campo] !== passportSalvo[campo]
    );

    passportSalvar.disabled = !houveAlteracao;

}


// ==========================================
// CARREGAR GAMER PASSPORT
// ==========================================

async function carregarGamerPassport() {

    passportOcupado = true;

    controlarCamposPassport(true);

    passportSalvar.disabled = true;
    passportSalvar.textContent = "Carregando...";

    mostrarMensagemPassport(
        "Carregando suas preferências..."
    );

    try {

        const resposta = await fetch(
            "/api/perfil/passport"
        );

        if (!resposta.ok) {

            throw new Error(
                resposta.status === 401
                    ? "Sua sessão expirou. Entre novamente."
                    : "Não foi possível carregar o Gamer Passport."
            );

        }

        const dados = await resposta.json();

        // PREENCHER OS CAMPOS

        passportArquetipo.value =
            dados.arquetipo || "";

        passportGeneros.value =
            dados.generos || "";

        passportPlataforma.value =
            dados.plataforma || "";

        passportEstilo.value =
            dados.estilo || "";

        passportLema.value =
            dados.lema || "";

        // GUARDAR OS DADOS ORIGINAIS

        passportSalvo = obterDadosPassport();

        passportDisponivel = true;

        controlarCamposPassport(false);

        mostrarMensagemPassport(
            "Personalize sua identidade gamer."
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar Gamer Passport:",
            erro
        );

        passportDisponivel = false;

        controlarCamposPassport(true);

        mostrarMensagemPassport(
            erro.message,
            "erro"
        );

    } finally {

        passportOcupado = false;

        passportSalvar.textContent =
            "Salvar Passport";

        atualizarBotaoPassport();

    }

}


// ==========================================
// DETECTAR ALTERAÇÕES
// ==========================================

camposPassport.forEach(campo => {

    campo.addEventListener("input", () => {

        mostrarMensagemPassport("");

        atualizarBotaoPassport();

    });

    campo.addEventListener("change", () => {

        mostrarMensagemPassport("");

        atualizarBotaoPassport();

    });

});


// ==========================================
// SALVAR GAMER PASSPORT
// ==========================================

passportForm.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        if (
            !passportDisponivel ||
            passportOcupado ||
            passportSalvar.disabled
        ) {
            return;
        }

        const dados = obterDadosPassport();

        passportOcupado = true;

        controlarCamposPassport(true);

        passportSalvar.disabled = true;
        passportSalvar.textContent = "Salvando...";

        mostrarMensagemPassport("");

        try {

            const resposta = await fetch(
                "/api/perfil/passport",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dados)
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    resultado.mensagem ||
                    "Não foi possível salvar o Passport."
                );

            }

            // ATUALIZAR OS DADOS SALVOS

            passportSalvo = { ...resultado.passport };

            mostrarMensagemPassport(
                "Gamer Passport salvo com sucesso!",
                "sucesso"
            );

        } catch (erro) {

            console.error(
                "Erro ao salvar Gamer Passport:",
                erro
            );

            mostrarMensagemPassport(
                erro.message,
                "erro"
            );

        } finally {

            passportOcupado = false;

            controlarCamposPassport(false);

            passportSalvar.textContent =
                "Salvar Passport";

            atualizarBotaoPassport();

        }

    }
);


// ==========================================
// INICIAR
// ==========================================

carregarGamerPassport();
