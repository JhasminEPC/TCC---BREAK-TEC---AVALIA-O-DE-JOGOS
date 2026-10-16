
// ==========================================
// BREAK TEC - FOTO DE PERFIL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const imagem = document.getElementById("perfilFoto");
    const inicial = document.getElementById("perfilInicial");

    const arquivo = document.getElementById(
        "perfilFotoArquivo"
    );

    const salvar = document.getElementById(
        "perfilFotoSalvar"
    );

    const remover = document.getElementById(
        "perfilFotoRemover"
    );

    const mensagem = document.getElementById(
        "perfilFotoMensagem"
    );

    if (
        !imagem || !inicial || !arquivo ||
        !salvar || !remover || !mensagem
    ) {
        return;
    }

    let fotoSalva = null;
    let previa = null;
    let ocupado = false;
    let fotoEditada = null;


    // ======================================
    // MOSTRAR OU ESCONDER IMAGEM
    // ======================================

    function mostrarFoto(url) {

        if (!url) {

            imagem.hidden = true;
            imagem.removeAttribute("src");

            inicial.hidden = false;
            return;

        }

        imagem.hidden = false;
        imagem.src = url;

        inicial.hidden = true;

    }


    imagem.addEventListener("error", () => {

        imagem.hidden = true;
        inicial.hidden = false;

    });


    // ======================================
    // LIMPAR PRÉVIA TEMPORÁRIA
    // ======================================

    function limparPrevia() {

        if (previa) {
            URL.revokeObjectURL(previa);
            previa = null;
        }

    }


    // ======================================
    // CONTROLAR BOTÕES
    // ======================================

    function atualizarBotoes() {

        arquivo.disabled = ocupado;

        salvar.disabled =
        ocupado || !fotoEditada;

        remover.disabled = ocupado;
        remover.hidden = !fotoSalva;

    }


    // ======================================
    // CARREGAR FOTO SALVA
    // ======================================

    async function carregarFoto() {

        try {

            const resposta = await fetch(
                "/api/perfil/foto"
            );

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível carregar sua foto."
                );
            }

            const dados = await resposta.json();

            fotoSalva = dados.foto_url;

            

            mostrarFoto(fotoSalva);

        } catch (erro) {

            console.error(
                "Erro ao carregar foto:",
                erro
            );

            mensagem.textContent = erro.message;

        }

        atualizarBotoes();

    }


    // ======================================
    // VISUALIZAR FOTO ESCOLHIDA
    // ======================================

    
arquivo.addEventListener("change", async () => {

    limparPrevia();

    fotoEditada = null;

    const foto = arquivo.files[0];

    if (!foto) {

        mostrarFoto(fotoSalva);
        atualizarBotoes();

        return;
    }

    const formatos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    // VALIDAR ARQUIVO

    if (
        !formatos.includes(foto.type) ||
        foto.size > 3 * 1024 * 1024
    ) {

        mensagem.textContent =
            "Escolha JPG, PNG ou WebP de até 3 MB.";

        arquivo.value = "";

        mostrarFoto(fotoSalva);
        atualizarBotoes();

        return;
    }

    mensagem.textContent =
        "Preparando editor de foto...";

    arquivo.disabled = true;
    salvar.disabled = true;

    try {

        // ABRIR EDITOR E ESPERAR CONFIRMAÇÃO

        const resultado =
            await abrirEditorFotoBreakTec(foto);

        // USUÁRIO CANCELOU

        if (!resultado) {

            arquivo.value = "";

            mostrarFoto(fotoSalva);

            mensagem.textContent =
                "Edição cancelada.";

            return;
        }

        // GUARDAR FOTO AJUSTADA

        fotoEditada = resultado;

        previa = URL.createObjectURL(
            fotoEditada
        );

        mostrarFoto(previa);

        mensagem.textContent =
            "Foto ajustada! Clique em Salvar foto.";

    } catch (erro) {

        console.error(
            "Erro no editor de foto:",
            erro
        );

        arquivo.value = "";

        mostrarFoto(fotoSalva);

        mensagem.textContent =
            "Não foi possível editar essa imagem.";

    } finally {

        atualizarBotoes();

    }

});


    // ======================================
    // SALVAR NO SERVIDOR
    // ======================================

    salvar.addEventListener("click", async () => {

        const foto = fotoEditada;

        if (!foto || ocupado) return;

        ocupado = true;
        atualizarBotoes();

        mensagem.textContent = "Salvando foto...";

        const formulario = new FormData();

        formulario.append("foto", foto, "avatar-ajustado.jpg");

        try {

            const resposta = await fetch(
                "/api/perfil/foto",
                {
                    method: "POST",
                    body: formulario
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    "Não foi possível salvar a foto."
                );
            }

            fotoSalva = dados.foto_url;

            fotoEditada = null;

            limparPrevia();

            arquivo.value = "";

            mostrarFoto(
                `${fotoSalva}?v=${Date.now()}`
            );

            mensagem.textContent =
                "Foto de perfil atualizada com sucesso!";

        } catch (erro) {

            mensagem.textContent = erro.message;

            console.error(
                "Erro ao enviar foto:",
                erro
            );

        } finally {

            ocupado = false;
            atualizarBotoes();

        }

    });


    // ======================================
    // REMOVER FOTO
    // ======================================

    remover.addEventListener("click", async () => {

        if (ocupado || !fotoSalva) return;

        const confirmado = confirm(
            "Deseja remover sua foto de perfil?"
        );

        if (!confirmado) return;

        ocupado = true;
        atualizarBotoes();

        mensagem.textContent = "Removendo foto...";

        try {

            const resposta = await fetch(
                "/api/perfil/foto",
                {
                    method: "DELETE"
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    "Não foi possível remover a foto."
                );
            }

            fotoSalva = null;

            fotoEditada = null;

            limparPrevia();

            arquivo.value = "";

            mostrarFoto(null);

            mensagem.textContent =
                "Foto removida com sucesso.";

        } catch (erro) {

            mensagem.textContent = erro.message;

            console.error(
                "Erro ao remover foto:",
                erro
            );

        } finally {

            ocupado = false;
            atualizarBotoes();

        }

    });


    // ======================================
    // INICIAR
    // ======================================

    carregarFoto();

});
