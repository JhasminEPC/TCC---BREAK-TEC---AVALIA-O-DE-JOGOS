// ================================
// ELEMENTOS
// ================================

const cadastroForm = document.getElementById("cadastroForm");

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

const termos = document.getElementById("termos");

const cadastroMessage =
    document.getElementById("cadastroMessage");


// ================================
// MOSTRAR SENHA
// ================================

const mostrarSenha =
    document.getElementById("mostrarSenha");

mostrarSenha.addEventListener("click", function () {

    if (senha.type === "password") {

        senha.type = "text";

        mostrarSenha.setAttribute(
            "aria-label",
            "Ocultar senha"
        );

    } else {

        senha.type = "password";

        mostrarSenha.setAttribute(
            "aria-label",
            "Mostrar senha"
        );

    }

});


// ================================
// MOSTRAR CONFIRMAÇÃO
// ================================

const mostrarConfirmacao =
    document.getElementById("mostrarConfirmacao");

mostrarConfirmacao.addEventListener(
    "click",
    function () {

        if (confirmarSenha.type === "password") {

            confirmarSenha.type = "text";

            mostrarConfirmacao.setAttribute(
                "aria-label",
                "Ocultar confirmação de senha"
            );

        } else {

            confirmarSenha.type = "password";

            mostrarConfirmacao.setAttribute(
                "aria-label",
                "Mostrar confirmação de senha"
            );

        }

    }
);


// ================================
// CADASTRO
// ================================

cadastroForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        cadastroMessage.textContent = "";


        // CAMPOS VAZIOS

        if (
            nome.value.trim() === "" ||
            email.value.trim() === "" ||
            senha.value === "" ||
            confirmarSenha.value === ""
        ) {

            cadastroMessage.textContent =
                "Preencha todos os campos.";

            return;
        }


        // SENHA CURTA

        if (senha.value.length < 6) {

            cadastroMessage.textContent =
                "A senha deve ter pelo menos 6 caracteres.";

            return;
        }


        // SENHAS DIFERENTES

        if (
            senha.value !== confirmarSenha.value
        ) {

            cadastroMessage.textContent =
                "As senhas não coincidem.";

            return;
        }


        // TERMOS

        if (!termos.checked) {

            cadastroMessage.textContent =
                "Você precisa aceitar os termos.";

            return;
        }


// ENVIA OS DADOS PARA O SERVIDOR

try {

    const resposta =
        await fetch("/api/usuarios", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                nome: nome.value.trim(),

                email: email.value.trim(),

                senha: senha.value

            })

        });


    const dados =
        await resposta.json();


    // MOSTRA A MENSAGEM DO SERVIDOR

    cadastroMessage.textContent =
        dados.mensagem;


    // SE O CADASTRO DER CERTO

    if (resposta.ok) {

        alert(
            "Cadastro realizado com sucesso!"
        );

        cadastroForm.reset();

        window.location.href =
            "login.html";

    }


} catch (erro) {

    console.error(
        "Erro ao cadastrar:",
        erro
    );

    cadastroMessage.textContent =
        "Não foi possível conectar ao servidor.";

            }

});