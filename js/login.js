const loginForm =
    document.getElementById("loginForm");

const email =
    document.getElementById("email");

const password =
    document.getElementById("password");

const errorMessage =
    document.getElementById("errorMessage");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        errorMessage.textContent = "";


        // VERIFICA SE OS CAMPOS FORAM PREENCHIDOS

        if (
            !email.value.trim() ||
            !password.value
        ) {

            errorMessage.textContent =
                "Preencha e-mail e senha.";

            return;
        }


        try {

            // ENVIA OS DADOS PARA O SERVIDOR

            const resposta =
                await fetch("/api/login", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email:
                            email.value.trim(),

                        senha:
                            password.value

                    })

                });


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                errorMessage.textContent =
                    dados.mensagem;

                return;
            }

// Login aprovado pelo servidor.
// A sessão é controlada pelo backend.

window.location.href =
    "../index.html";


        } catch (erro) {

            console.error(
                "Erro ao fazer login:",
                erro
            );

            errorMessage.textContent =
                "Não foi possível conectar ao servidor.";

        }

    }
);