
// ==========================================
// BREAK TEC - EDITOR DE FOTO DE PERFIL
// ==========================================

async function abrirEditorFotoBreakTec(arquivo) {

    const modal = document.getElementById("fotoEditorModal");
    const canvas = document.getElementById("fotoEditorCanvas");
    const zoomInput = document.getElementById("fotoEditorZoom");

    const zoomValor = document.getElementById(
        "fotoEditorZoomValor"
    );

    const aplicar = document.getElementById("fotoEditorAplicar");
    const cancelar = document.getElementById("fotoEditorCancelar");
    const fechar = document.getElementById("fotoEditorFechar");

    const mensagem = document.getElementById(
        "fotoEditorMensagem"
    );

    if (
        !modal || !canvas || !zoomInput ||
        !zoomValor || !aplicar || !cancelar ||
        !fechar || !mensagem
    ) {
        throw new Error("Editor de foto não encontrado.");
    }

    const contexto = canvas.getContext("2d");

    if (!contexto) {
        throw new Error("Seu navegador não suporta o editor.");
    }

    // CARREGAR A FOTO SELECIONADA

    const urlTemporaria = URL.createObjectURL(arquivo);
    const imagem = new Image();

    imagem.src = urlTemporaria;

    try {
        await imagem.decode();
    } catch (erro) {

        URL.revokeObjectURL(urlTemporaria);

        throw new Error(
            "Não foi possível abrir essa imagem."
        );

    }

    const tamanho = 320;

    let zoom = 1;
    let deslocamentoX = 0;
    let deslocamentoY = 0;

    let arrastando = false;
    let ultimoX = 0;
    let ultimoY = 0;

    zoomInput.value = "1";
    zoomValor.textContent = "100%";
    mensagem.textContent = "";


    // ======================================
    // LIMITAR O MOVIMENTO DA IMAGEM
    // ======================================

    function limitarPosicao() {

        const escalaBase = Math.max(
            tamanho / imagem.naturalWidth,
            tamanho / imagem.naturalHeight
        );

        const largura =
            imagem.naturalWidth * escalaBase * zoom;

        const altura =
            imagem.naturalHeight * escalaBase * zoom;

        const limiteX = Math.max(
            0,
            (largura - tamanho) / 2
        );

        const limiteY = Math.max(
            0,
            (altura - tamanho) / 2
        );

        deslocamentoX = Math.max(
            -limiteX,
            Math.min(limiteX, deslocamentoX)
        );

        deslocamentoY = Math.max(
            -limiteY,
            Math.min(limiteY, deslocamentoY)
        );

    }


    // ======================================
    // DESENHAR FOTO COM ZOOM E MOVIMENTO
    // ======================================

    function desenhar(contextoDestino, lado) {

        const escalaBase = Math.max(
            lado / imagem.naturalWidth,
            lado / imagem.naturalHeight
        );

        const escala = escalaBase * zoom;

        const largura =
            imagem.naturalWidth * escala;

        const altura =
            imagem.naturalHeight * escala;

        const proporcao = lado / tamanho;

        const x =
            (lado - largura) / 2 +
            deslocamentoX * proporcao;

        const y =
            (lado - altura) / 2 +
            deslocamentoY * proporcao;

        contextoDestino.clearRect(
            0, 0, lado, lado
        );

        contextoDestino.fillStyle = "#211411";

        contextoDestino.fillRect(
            0, 0, lado, lado
        );

        contextoDestino.drawImage(
            imagem,
            x,
            y,
            largura,
            altura
        );

    }


    function atualizarPrevia() {

        limitarPosicao();
        desenhar(contexto, tamanho);

    }


    // ======================================
    // ARRASTAR A FOTO COM MOUSE OU TOQUE
    // ======================================

    canvas.onpointerdown = evento => {

        if (
            evento.pointerType === "mouse" &&
            evento.button !== 0
        ) {
            return;
        }

        arrastando = true;

        ultimoX = evento.clientX;
        ultimoY = evento.clientY;

        canvas.setPointerCapture(evento.pointerId);

    };


    canvas.onpointermove = evento => {

        if (!arrastando) {
            return;
        }

        const larguraVisual =
            canvas.getBoundingClientRect().width;

        const proporcao =
            tamanho / larguraVisual;

        deslocamentoX +=
            (evento.clientX - ultimoX) * proporcao;

        deslocamentoY +=
            (evento.clientY - ultimoY) * proporcao;

        ultimoX = evento.clientX;
        ultimoY = evento.clientY;

        atualizarPrevia();

    };


    canvas.onpointerup = () => {
        arrastando = false;
    };

    canvas.onpointercancel = () => {
        arrastando = false;
    };


    // ======================================
    // AJUSTE PELO TECLADO
    // ======================================

    canvas.onkeydown = evento => {

        const movimentos = {
            ArrowLeft: [-10, 0],
            ArrowRight: [10, 0],
            ArrowUp: [0, -10],
            ArrowDown: [0, 10]
        };

        const movimento = movimentos[evento.key];

        if (!movimento) {
            return;
        }

        evento.preventDefault();

        deslocamentoX += movimento[0];
        deslocamentoY += movimento[1];

        atualizarPrevia();

    };


    // ======================================
    // ZOOM
    // ======================================

    zoomInput.oninput = () => {

        zoom = Number(zoomInput.value);

        zoomValor.textContent =
            `${Math.round(zoom * 100)}%`;

        atualizarPrevia();

    };


    // ======================================
    // ABRIR JANELA E DEVOLVER FOTO AJUSTADA
    // ======================================

    return new Promise(resolve => {

        let resultadoFinal = null;

        // LIMPEZA AO FECHAR

        modal.addEventListener("close", () => {

            URL.revokeObjectURL(urlTemporaria);

            canvas.onpointerdown = null;
            canvas.onpointermove = null;
            canvas.onpointerup = null;
            canvas.onpointercancel = null;
            canvas.onkeydown = null;

            zoomInput.oninput = null;

            aplicar.onclick = null;
            cancelar.onclick = null;
            fechar.onclick = null;

            resolve(resultadoFinal);

        }, { once: true });


        // CANCELAR

        cancelar.onclick = () => {
            modal.close();
        };

        fechar.onclick = () => {
            modal.close();
        };


        // APLICAR ENQUADRAMENTO

        aplicar.onclick = () => {

            const saida =
                document.createElement("canvas");

            saida.width = 384;
            saida.height = 384;

            const contextoSaida =
                saida.getContext("2d");

            if (!contextoSaida) {

                mensagem.textContent =
                    "Não foi possível gerar a foto.";

                return;
            }

            desenhar(contextoSaida, 384);

            aplicar.disabled = true;

            saida.toBlob(blob => {

                aplicar.disabled = false;

                if (!modal.open) {
                    return;
                }

                if (!blob) {

                    mensagem.textContent =
                        "Não foi possível preparar a foto.";

                    return;
                }

                resultadoFinal = blob;

                modal.close();

            }, "image/jpeg", 0.92);

        };


        // EXIBIR A PRÉVIA INICIAL

        atualizarPrevia();

        modal.showModal();

    });

}
