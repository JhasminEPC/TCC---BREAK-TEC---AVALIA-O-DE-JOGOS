
// ==========================================
// BREAK TEC - CONFIGURAÇÕES DA CONTA
// ==========================================

const carregando =
    document.getElementById("configCarregando");

const conteudo =
    document.getElementById("configConteudo");

const mensagemGeral =
    document.getElementById("configErro");

const nome =
    document.getElementById("configNome");

const email =
    document.getElementById("configEmail");

const dataCriacao =
    document.getElementById("configCriacao");

const telefone =
    document.getElementById("configTelefone");

const estadoTelefone =
    document.getElementById("configEstadoTelefone");

const formTelefone =
    document.getElementById("formConfigTelefone");

const senhaTelefone =
    document.getElementById("configSenhaTelefone");

const mensagemTelefone =
    document.getElementById("configMensagemTelefone");

const formSenha =
    document.getElementById("formConfigSenha");

const senhaAtual =
    document.getElementById("configSenhaAtual");

const senhaNova =
    document.getElementById("configSenhaNova");

const senhaConfirmacao =
    document.getElementById("configSenhaConfirmacao");

const mensagemSenha =
    document.getElementById("configMensagemSenha");


// ==========================================
// MOSTRAR ESTADO DO TELEFONE
// ==========================================

function exibirEstadoTelefone(numero, verificado) {

    telefone.value = numero || "";

    if (!numero) {

        estadoTelefone.textContent =
            "Nenhum número cadastrado.";

    } else if (verificado) {

        estadoTelefone.textContent =
            "Número verificado.";

    } else {

        estadoTelefone.textContent =
            "Número não verificado. A recuperação por SMS ainda não está disponível.";

    }

}


// ==========================================
// REALIZAR REQUISIÇÕES PRIVADAS
// ==========================================

async function requisicaoConfiguracoes(
    url,
    metodo,
    corpo
) {

    const resposta = await fetch(url, {

        method: metodo,

        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(corpo)

    });

    const dados = await resposta.json();

    if (resposta.status === 401) {

        window.location.href = "login.html";

        throw new Error(
            "Sua sessão expirou. Entre novamente."
        );

    }

    if (!resposta.ok) {

        throw new Error(
            dados.mensagem ||
            "Não foi possível concluir a operação."
        );

    }

    return dados;

}


// ==========================================
// CARREGAR DADOS PESSOAIS
// ==========================================

async function carregarConfiguracoes() {

    try {

        const resposta = await fetch(
            "/api/configuracoes",
            {
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        // IMPEDIR ACESSO SEM LOGIN

        if (resposta.status === 401) {

            window.location.replace("login.html");
            return;

        }

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível consultar os dados da conta."
            );

        }

        const dados = await resposta.json();

        // NOME E E-MAIL

        nome.textContent =
            dados.nome || "Não informado";

        email.textContent =
            dados.email || "Não informado";


        // DATA DE CRIAÇÃO

        const data = dados.criado_em
            ? new Date(dados.criado_em)
            : null;

        dataCriacao.textContent =
            data && !Number.isNaN(data.getTime())
                ? data.toLocaleDateString(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    }
                )
                : "Não disponível";


        // TELEFONE

        exibirEstadoTelefone(
            dados.telefone,
            dados.telefone_verificado
        );


        // EXIBIR CONTEÚDO

        conteudo.hidden = false;

        carregando.hidden = true;

    } catch (erro) {

        carregando.hidden = true;

        mensagemGeral.textContent =
            erro.message;

        console.error(
            "Erro ao carregar configurações:",
            erro
        );

    }

}


// ==========================================
// SALVAR OU REMOVER TELEFONE
// ==========================================

formTelefone.addEventListener("submit", async evento => {

    evento.preventDefault();

    const botao = formTelefone.querySelector(
        'button[type="submit"]'
    );

    botao.disabled = true;

    mensagemTelefone.textContent =
        "Salvando telefone...";

    try {

        const dados = await requisicaoConfiguracoes(
            "/api/configuracoes/telefone",
            "PUT",
            {
                telefone: telefone.value.trim(),
                senhaAtual: senhaTelefone.value
            }
        );

        exibirEstadoTelefone(
            dados.telefone,
            dados.telefone_verificado
        );

        senhaTelefone.value = "";

        mensagemTelefone.textContent =
            dados.mensagem;

    } catch (erro) {

        mensagemTelefone.textContent =
            erro.message;

    } finally {

        botao.disabled = false;

    }

});


// ==========================================
// ALTERAR SENHA
// ==========================================

formSenha.addEventListener("submit", async evento => {

    evento.preventDefault();

    mensagemSenha.textContent = "";

    // CONFIRMAR SE AS NOVAS SENHAS SÃO IGUAIS

    if (
        senhaNova.value !==
        senhaConfirmacao.value
    ) {

        mensagemSenha.textContent =
            "As novas senhas não são iguais.";

        return;

    }

    const botao = formSenha.querySelector(
        'button[type="submit"]'
    );

    botao.disabled = true;

    mensagemSenha.textContent =
        "Atualizando senha...";

    try {

        const dados = await requisicaoConfiguracoes(
            "/api/configuracoes/senha",
            "PUT",
            {
                senhaAtual: senhaAtual.value,
                novaSenha: senhaNova.value
            }
        );

        formSenha.reset();

        mensagemSenha.textContent =
            dados.mensagem;

        // SENHA ALTERADA: ENTRAR NOVAMENTE

        if (dados.entrarNovamente) {

            window.location.replace(
                "login.html"
            );

        }

    } catch (erro) {

        mensagemSenha.textContent =
            erro.message;

    } finally {

        botao.disabled = false;

    }

});


// ==========================================
// INICIAR CONFIGURAÇÕES
// ==========================================

carregarConfiguracoes();
