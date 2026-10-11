
// ==========================================
// BREAK TEC - CENTRAL DE QUIZZES
// ==========================================

// ELEMENTOS PRINCIPAIS

const quizCentral =
    document.getElementById("quizCentral");

const quizJogo =
    document.getElementById("quizJogo");

const quizBotoesIniciar =
    document.querySelectorAll(".quiz-iniciar");

const quizVoltar =
    document.getElementById("quizVoltar");

const quizCategoria =
    document.getElementById("quizCategoria");

const quizTitulo =
    document.getElementById("quizTitulo");

const quizDescricao =
    document.getElementById("quizDescricao");

const quizContador =
    document.getElementById("quizContador");

const quizPorcentagem =
    document.getElementById("quizPorcentagem");

const quizProgresso =
    document.getElementById("quizProgresso");

const quizProgressoPreenchimento =
    document.getElementById("quizProgressoPreenchimento");

const quizProgressoContainer =
    document.getElementById("quizProgressoContainer");

const quizPerguntaArea =
    document.getElementById("quizPerguntaArea");

const quizPergunta =
    document.getElementById("quizPergunta");

const quizAlternativas =
    document.getElementById("quizAlternativas");

const quizFeedback =
    document.getElementById("quizFeedback");

const quizProxima =
    document.getElementById("quizProxima");

const quizResultado =
    document.getElementById("quizResultado");

const quizResultadoTitulo =
    document.getElementById("quizResultadoTitulo");

const quizResultadoDescricao =
    document.getElementById("quizResultadoDescricao");

const quizResultadoDetalhes =
    document.getElementById("quizResultadoDetalhes");

const quizRefazer =
    document.getElementById("quizRefazer");

const quizOutro =
    document.getElementById("quizOutro");


// ==========================================
// QUIZ 1 - ESTILO DE JOGADOR
// ==========================================

const perguntasPersonalidade = [

    {
        pergunta:
            "Quando você começa um jogo novo, o que mais chama sua atenção?",

        alternativas: [
            {
                texto: "Explorar o mapa e descobrir lugares escondidos.",
                perfil: "explorador"
            },
            {
                texto: "Entender as mecânicas e planejar minhas ações.",
                perfil: "estrategista"
            },
            {
                texto: "Melhorar rapidamente e superar desafios.",
                perfil: "competitivo"
            },
            {
                texto: "Personalizar meu personagem e experimentar possibilidades.",
                perfil: "criativo"
            }
        ]
    },

    {
        pergunta:
            "Qual atividade você prefere realizar durante uma partida?",

        alternativas: [
            {
                texto: "Investigar cenários e encontrar segredos.",
                perfil: "explorador"
            },
            {
                texto: "Resolver problemas usando estratégias.",
                perfil: "estrategista"
            },
            {
                texto: "Enfrentar desafios que testem minhas habilidades.",
                perfil: "competitivo"
            },
            {
                texto: "Construir ou modificar elementos do jogo.",
                perfil: "criativo"
            }
        ]
    },

    {
        pergunta:
            "O que faz você continuar jogando por várias horas?",

        alternativas: [
            {
                texto: "Uma história envolvente e um mundo interessante.",
                perfil: "explorador"
            },
            {
                texto: "Sistemas complexos que posso aprender a dominar.",
                perfil: "estrategista"
            },
            {
                texto: "A vontade de conquistar objetivos difíceis.",
                perfil: "competitivo"
            },
            {
                texto: "A liberdade para criar algo diferente.",
                perfil: "criativo"
            }
        ]
    },

    {
        pergunta:
            "Se pudesse escolher uma habilidade especial, qual seria?",

        alternativas: [
            {
                texto: "Descobrir caminhos secretos e novas regiões.",
                perfil: "explorador"
            },
            {
                texto: "Prever situações e planejar a melhor solução.",
                perfil: "estrategista"
            },
            {
                texto: "Ter reflexos excelentes e precisão nas ações.",
                perfil: "competitivo"
            },
            {
                texto: "Transformar o ambiente ao meu redor.",
                perfil: "criativo"
            }
        ]
    },

    {
        pergunta:
            "Qual dessas experiências parece mais interessante?",

        alternativas: [
            {
                texto: "Uma aventura em um mundo cheio de mistérios.",
                perfil: "explorador"
            },
            {
                texto: "Um desafio de lógica que exige planejamento.",
                perfil: "estrategista"
            },
            {
                texto: "Uma competição com objetivos desafiadores.",
                perfil: "competitivo"
            },
            {
                texto: "Um universo onde posso construir livremente.",
                perfil: "criativo"
            }
        ]
    },

    {
        pergunta:
            "Ao terminar um jogo, do que você costuma se lembrar mais?",

        alternativas: [
            {
                texto: "Dos lugares, personagens e descobertas.",
                perfil: "explorador"
            },
            {
                texto: "Das estratégias e soluções que desenvolvi.",
                perfil: "estrategista"
            },
            {
                texto: "Das conquistas e desafios superados.",
                perfil: "competitivo"
            },
            {
                texto: "Das criações e experiências que inventei.",
                perfil: "criativo"
            }
        ]
    }

];


// ==========================================
// PERFIS E RESULTADOS
// ==========================================

const perfisJogador = {

    explorador: {
        titulo: "Explorador",
        descricao:
            "Você gosta de descobrir mundos, conhecer histórias e encontrar segredos. Para você, jogar é uma oportunidade de viver novas aventuras.",
        sugestao:
            "Experimente jogos de aventura, exploração e mundos abertos."
    },

    estrategista: {
        titulo: "Estrategista",
        descricao:
            "Você gosta de pensar antes de agir, analisar possibilidades e encontrar soluções inteligentes. Seu interesse está em compreender e dominar os desafios.",
        sugestao:
            "Experimente jogos de estratégia, gerenciamento e quebra-cabeças."
    },

    competitivo: {
        titulo: "Competitivo",
        descricao:
            "Você gosta de desafios, acompanha sua própria evolução e sente satisfação ao superar objetivos difíceis.",
        sugestao:
            "Experimente jogos de ação, corrida e desafios de habilidade."
    },

    criativo: {
        titulo: "Criativo",
        descricao:
            "Você gosta de experimentar, personalizar e construir. Para você, a liberdade de criar novas possibilidades é uma das melhores partes de jogar.",
        sugestao:
            "Experimente jogos sandbox, construção e simulação."
    }

};


// ==========================================
// ESTADO DO QUIZ
// ==========================================

let quizAtual = null;

let indicePergunta = 0;

let respostasJogador = [];

let alternativaSelecionada = null;


// ==========================================
// MOSTRAR A CENTRAL
// ==========================================

function mostrarCentralQuizzes() {

    quizAtual = null;

    quizJogo.hidden = true;

    quizCentral.hidden = false;

    quizCentral.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// INICIAR QUIZ DE PERSONALIDADE
// ==========================================

function iniciarQuizPersonalidade() {

    quizAtual = "personalidade";

    indicePergunta = 0;

    respostasJogador = [];

    alternativaSelecionada = null;


    // ESCONDER CENTRAL

    quizCentral.hidden = true;

    quizJogo.hidden = false;


    // INFORMAÇÕES DO QUIZ

    quizCategoria.textContent =
        "PERFIL GAMER";

    quizTitulo.textContent =
        "Qual é o seu estilo de jogador?";

    quizDescricao.textContent =
        "Responda às perguntas de acordo com suas preferências. Não existem respostas certas ou erradas.";


    // REDEFINIR ÁREAS

    quizResultado.hidden = true;

    quizPerguntaArea.hidden = false;

    quizProgressoContainer.hidden = false;


    mostrarPerguntaPersonalidade();


    quizJogo.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// EXIBIR PERGUNTA
// ==========================================

function mostrarPerguntaPersonalidade() {

    const dados =
        perguntasPersonalidade[indicePergunta];

    const total =
        perguntasPersonalidade.length;


    alternativaSelecionada = null;


    // TEXTO DA PERGUNTA

    quizPergunta.textContent =
        dados.pergunta;


    // CONTADOR

    quizContador.textContent =
        `Pergunta ${indicePergunta + 1} de ${total}`;


    // PROGRESSO DAS RESPOSTAS CONCLUÍDAS

    const porcentagem = Math.round(
        (indicePergunta / total) * 100
    );

    quizPorcentagem.textContent =
        `${porcentagem}%`;

    quizProgressoPreenchimento.style.width =
        `${porcentagem}%`;

    quizProgresso.setAttribute(
        "aria-valuenow",
        String(porcentagem)
    );


    // LIMPAR ALTERNATIVAS

    quizAlternativas.replaceChildren();

    quizFeedback.textContent = "";

    quizFeedback.className =
        "quiz-feedback";


    // CRIAR BOTÕES

    dados.alternativas.forEach(
        (alternativa, indice) => {

            const botao =
                document.createElement("button");

            botao.type = "button";

            botao.className =
                "quiz-alternativa";

            botao.textContent =
                alternativa.texto;

            botao.setAttribute(
                "aria-pressed",
                "false"
            );


            botao.addEventListener(
                "click",
                function () {

                    selecionarAlternativa(
                        indice,
                        botao
                    );

                }
            );


            quizAlternativas.appendChild(
                botao
            );

        }
    );


    // BOTÃO PRÓXIMA

    quizProxima.disabled = true;

    quizProxima.textContent =
        indicePergunta === total - 1
            ? "Ver meu resultado →"
            : "Próxima pergunta →";

}


// ==========================================
// SELECIONAR ALTERNATIVA
// ==========================================

function selecionarAlternativa(indice, botao) {

    alternativaSelecionada = indice;


    // REMOVER SELEÇÃO ANTERIOR

    quizAlternativas
        .querySelectorAll(".quiz-alternativa")
        .forEach(elemento => {

            elemento.classList.remove(
                "selecionada"
            );

            elemento.setAttribute(
                "aria-pressed",
                "false"
            );

        });


    // MARCAR RESPOSTA ATUAL

    botao.classList.add("selecionada");

    botao.setAttribute(
        "aria-pressed",
        "true"
    );


    quizProxima.disabled = false;

}


// ==========================================
// CONFIRMAR RESPOSTA E AVANÇAR
// ==========================================

function proximaPerguntaPersonalidade() {

    if (alternativaSelecionada === null) {
        return;
    }


    const pergunta =
        perguntasPersonalidade[indicePergunta];

    const resposta =
        pergunta.alternativas[
            alternativaSelecionada
        ];


    // SALVAR PERFIL ESCOLHIDO

    respostasJogador.push(
        resposta.perfil
    );


    indicePergunta++;


    // VERIFICAR SE TERMINOU

    if (
        indicePergunta >=
        perguntasPersonalidade.length
    ) {

        mostrarResultadoPersonalidade();

        return;

    }


    mostrarPerguntaPersonalidade();

}


// ==========================================
// CALCULAR PERFIL DO JOGADOR
// ==========================================

function calcularPerfilJogador() {

    const pontos = {

        explorador: 0,

        estrategista: 0,

        competitivo: 0,

        criativo: 0

    };


    // CONTAR AS RESPOSTAS

    respostasJogador.forEach(perfil => {

        if (
            Object.prototype.hasOwnProperty.call(
                pontos,
                perfil
            )
        ) {

            pontos[perfil]++;

        }

    });


    // ENCONTRAR MAIOR PONTUAÇÃO

    const maiorPontuacao = Math.max(
        ...Object.values(pontos)
    );


    // EM CASO DE EMPATE, PRIORIZAR O PERFIL
    // QUE APARECEU PRIMEIRO NAS RESPOSTAS

    const perfilVencedor =
        respostasJogador.find(perfil =>

            pontos[perfil] === maiorPontuacao

        );


    return {
        perfil: perfilVencedor,
        pontos
    };

}


// ==========================================
// MOSTRAR RESULTADO
// ==========================================

function mostrarResultadoPersonalidade() {

    const calculo =
        calcularPerfilJogador();

    const resultado =
        perfisJogador[calculo.perfil];


    // ESCONDER PERGUNTAS

    quizPerguntaArea.hidden = true;

    quizProgressoContainer.hidden = true;

    quizResultado.hidden = false;


    // PREENCHER RESULTADO

    quizResultadoTitulo.textContent =
        `Você é um ${resultado.titulo}!`;

    quizResultadoDescricao.textContent =
        resultado.descricao;


    // LIMPAR DETALHES ANTERIORES

    quizResultadoDetalhes.replaceChildren();


    // EXIBIR RECOMENDAÇÃO DE GÊNEROS

    const sugestao =
        document.createElement("p");

    sugestao.textContent =
        resultado.sugestao;


    // EXIBIR DISTRIBUIÇÃO DAS RESPOSTAS

    const resumo =
        document.createElement("p");

    resumo.textContent =
        "Suas respostas: " +
        Object.entries(calculo.pontos)
            .map(([perfil, pontos]) =>

                `${perfisJogador[perfil].titulo}: ${pontos}`

            )
            .join(" • ");


    quizResultadoDetalhes.append(
        sugestao,
        resumo
    );


    quizResultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// QUIZ 2 - DESAFIO GAMER
// ==========================================

const perguntasConhecimento = [

    {
        pergunta: "Qual empresa criou o personagem Sonic?",
        alternativas: [
            "Nintendo",
            "SEGA",
            "Capcom",
            "Ubisoft"
        ],
        correta: 1,
        explicacao:
            "Sonic foi criado pela SEGA e estreou em seu próprio jogo em 1991."
    },

    {
        pergunta: "Qual é o principal objetivo em Tetris?",
        alternativas: [
            "Derrotar inimigos",
            "Coletar moedas",
            "Completar linhas com blocos",
            "Construir uma cidade"
        ],
        correta: 2,
        explicacao:
            "Em Tetris, o jogador organiza blocos para completar linhas horizontais."
    },

    {
        pergunta: "Qual personagem é um dos principais inimigos de Mario?",
        alternativas: [
            "Bowser",
            "Kirby",
            "Crash Bandicoot",
            "Sonic"
        ],
        correta: 0,
        explicacao:
            "Bowser é um dos principais antagonistas da série Super Mario."
    },

    {
        pergunta: "Em Minecraft, qual criatura é conhecida por explodir quando se aproxima do jogador?",
        alternativas: [
            "Enderman",
            "Esqueleto",
            "Zumbi",
            "Creeper"
        ],
        correta: 3,
        explicacao:
            "O Creeper é uma criatura de Minecraft conhecida por sua explosão."
    },

    {
        pergunta: "Qual é uma das principais atividades de Stardew Valley?",
        alternativas: [
            "Pilotar naves espaciais",
            "Administrar uma fazenda",
            "Participar de corridas",
            "Resolver crimes"
        ],
        correta: 1,
        explicacao:
            "Stardew Valley permite cultivar, cuidar de animais e desenvolver uma fazenda."
    },

    {
        pergunta: "Qual mecânica é fundamental na série Portal?",
        alternativas: [
            "Criar passagens conectadas por portais",
            "Capturar criaturas em esferas",
            "Construir veículos de corrida",
            "Controlar exércitos"
        ],
        correta: 0,
        explicacao:
            "Em Portal, o jogador usa portais conectados para resolver desafios."
    }

];


// ==========================================
// ESTADO DO DESAFIO
// ==========================================

let acertosConhecimento = 0;

let respostaConhecimentoRegistrada = false;


// ==========================================
// INICIAR DESAFIO GAMER
// ==========================================

function iniciarQuizConhecimento() {

    quizAtual = "conhecimento";

    indicePergunta = 0;

    acertosConhecimento = 0;

    respostaConhecimentoRegistrada = false;


    // ESCONDER CENTRAL

    quizCentral.hidden = true;

    quizJogo.hidden = false;


    // INFORMAÇÕES DO QUIZ

    quizCategoria.textContent =
        "DESAFIO GAMER";

    quizTitulo.textContent =
        "Quanto você sabe sobre jogos?";

    quizDescricao.textContent =
        "Responda às perguntas, descubra curiosidades e veja quantas consegue acertar.";


    // REDEFINIR ÁREAS

    quizResultado.hidden = true;

    quizPerguntaArea.hidden = false;

    quizProgressoContainer.hidden = false;


    mostrarPerguntaConhecimento();


    quizJogo.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// EXIBIR PERGUNTA DE CONHECIMENTO
// ==========================================

function mostrarPerguntaConhecimento() {

    const dados =
        perguntasConhecimento[indicePergunta];

    const total =
        perguntasConhecimento.length;


    respostaConhecimentoRegistrada = false;


    quizPergunta.textContent =
        dados.pergunta;


    quizContador.textContent =
        `Pergunta ${indicePergunta + 1} de ${total}`;


    // BARRA DE PROGRESSO

    const progresso = Math.round(
        (indicePergunta / total) * 100
    );

    quizPorcentagem.textContent =
        `${progresso}%`;

    quizProgressoPreenchimento.style.width =
        `${progresso}%`;

    quizProgresso.setAttribute(
        "aria-valuenow",
        String(progresso)
    );


    // LIMPAR ALTERNATIVAS E FEEDBACK

    quizAlternativas.replaceChildren();

    quizFeedback.textContent = "";

    quizFeedback.className = "quiz-feedback";


    // CRIAR ALTERNATIVAS

    dados.alternativas.forEach((texto, indice) => {

        const botao =
            document.createElement("button");

        botao.type = "button";

        botao.className = "quiz-alternativa";

        botao.textContent = texto;


        botao.addEventListener("click", () => {

            verificarRespostaConhecimento(
                indice
            );

        });


        quizAlternativas.appendChild(botao);

    });


    // BOTÃO PRÓXIMA

    quizProxima.disabled = true;

    quizProxima.textContent =
        indicePergunta === total - 1
            ? "Ver pontuação final →"
            : "Próxima pergunta →";

}


// ==========================================
// CORRIGIR RESPOSTA
// ==========================================

function verificarRespostaConhecimento(
    indiceEscolhido
) {

    // IMPEDE RESPONDER A MESMA PERGUNTA
    // MAIS DE UMA VEZ

    if (respostaConhecimentoRegistrada) {
        return;
    }

    respostaConhecimentoRegistrada = true;


    const dados =
        perguntasConhecimento[indicePergunta];

    const acertou =
        indiceEscolhido === dados.correta;


    const botoes = Array.from(
        quizAlternativas.querySelectorAll(
            ".quiz-alternativa"
        )
    );


    // BLOQUEAR ALTERNATIVAS

    botoes.forEach((botao, indice) => {

        botao.disabled = true;

        if (indice === dados.correta) {

            botao.classList.add("correta");

        } else if (indice === indiceEscolhido) {

            botao.classList.add("incorreta");

        }

    });


    // ATUALIZAR PONTUAÇÃO

    if (acertou) {

        acertosConhecimento++;

        quizFeedback.className =
            "quiz-feedback acerto";

        quizFeedback.textContent =
            `✓ Resposta correta! ${dados.explicacao}`;

    } else {

        quizFeedback.className =
            "quiz-feedback erro";

        quizFeedback.textContent =
            `Resposta incorreta. ${dados.explicacao}`;

    }


    // ATUALIZAR PROGRESSO

    const total =
        perguntasConhecimento.length;

    const progresso = Math.round(
        ((indicePergunta + 1) / total) * 100
    );

    quizPorcentagem.textContent =
        `${progresso}%`;

    quizProgressoPreenchimento.style.width =
        `${progresso}%`;

    quizProgresso.setAttribute(
        "aria-valuenow",
        String(progresso)
    );


    // LIBERAR PRÓXIMA PERGUNTA

    quizProxima.disabled = false;

}


// ==========================================
// AVANÇAR NO DESAFIO
// ==========================================

function proximaPerguntaConhecimento() {

    if (!respostaConhecimentoRegistrada) {
        return;
    }

    indicePergunta++;


    if (
        indicePergunta >=
        perguntasConhecimento.length
    ) {

        mostrarResultadoConhecimento();

        return;
    }


    mostrarPerguntaConhecimento();

}


// ==========================================
// RESULTADO FINAL DO DESAFIO
// ==========================================

function mostrarResultadoConhecimento() {

    const total =
        perguntasConhecimento.length;

    const porcentagem = Math.round(
        (acertosConhecimento / total) * 100
    );


    // ESCONDER PERGUNTAS

    quizPerguntaArea.hidden = true;

    quizProgressoContainer.hidden = true;

    quizResultado.hidden = false;


    // TÍTULO

    quizResultadoTitulo.textContent =
        `Você acertou ${acertosConhecimento} de ${total}!`;


    // MENSAGEM CONFORME DESEMPENHO

    let mensagem;

    if (porcentagem === 100) {

        mensagem =
            "Pontuação perfeita! Você demonstrou conhecer muito bem os jogos deste desafio.";

    } else if (porcentagem >= 70) {

        mensagem =
            "Ótimo resultado! Você conhece bastante sobre o universo dos jogos.";

    } else if (porcentagem >= 40) {

        mensagem =
            "Bom desafio! Você acertou várias perguntas e descobriu novas curiosidades.";

    } else {

        mensagem =
            "Os jogos estão cheios de curiosidades! Continue explorando e tente novamente.";

    }


    quizResultadoDescricao.textContent =
        mensagem;


    // DETALHES

    quizResultadoDetalhes.replaceChildren();

    const pontuacao =
        document.createElement("p");

    pontuacao.textContent =
        `Pontuação: ${porcentagem}%`;


    const resumo =
        document.createElement("p");

    resumo.textContent =
        `Acertos: ${acertosConhecimento} | Erros: ${total - acertosConhecimento}`;


    quizResultadoDetalhes.append(
        pontuacao,
        resumo
    );


    quizResultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}



// ==========================================
// QUIZ 3 - RECOMENDAÇÃO DE JOGOS
// ==========================================

// CADA RESPOSTA INDICA UM GÊNERO
// DISPONÍVEL NO CATÁLOGO DA RAWG.

const perguntasRecomendacao = [

    {
        pergunta:
            "O que você mais procura em um jogo?",

        alternativas: [
            {
                texto: "Uma história envolvente e personagens interessantes.",
                genero: "role-playing-games-rpg"
            },
            {
                texto: "Explorar lugares e descobrir segredos.",
                genero: "adventure"
            },
            {
                texto: "Desafios que exigem reflexos e habilidade.",
                genero: "action"
            },
            {
                texto: "Liberdade para criar e administrar coisas.",
                genero: "simulation"
            }
        ]
    },

    {
        pergunta:
            "Qual destas atividades parece mais divertida?",

        alternativas: [
            {
                texto: "Montar uma equipe e desenvolver personagens.",
                genero: "role-playing-games-rpg"
            },
            {
                texto: "Planejar cuidadosamente cada decisão.",
                genero: "strategy"
            },
            {
                texto: "Resolver enigmas e descobrir soluções.",
                genero: "puzzle"
            },
            {
                texto: "Participar de corridas e superar recordes.",
                genero: "racing"
            }
        ]
    },

    {
        pergunta:
            "Como você prefere passar seu tempo jogando?",

        alternativas: [
            {
                texto: "Descobrindo novos ambientes e aventuras.",
                genero: "adventure"
            },
            {
                texto: "Criando estruturas ou gerenciando recursos.",
                genero: "simulation"
            },
            {
                texto: "Superando fases com movimentos precisos.",
                genero: "platformer"
            },
            {
                texto: "Pensando em estratégias para vencer.",
                genero: "strategy"
            }
        ]
    },

    {
        pergunta:
            "Que tipo de desafio chama mais sua atenção?",

        alternativas: [
            {
                texto: "Uma batalha intensa e cheia de ação.",
                genero: "action"
            },
            {
                texto: "Um mistério com quebra-cabeças.",
                genero: "puzzle"
            },
            {
                texto: "Uma jornada com decisões importantes.",
                genero: "role-playing-games-rpg"
            },
            {
                texto: "Uma competição de velocidade.",
                genero: "racing"
            }
        ]
    },

    {
        pergunta:
            "Qual experiência você gostaria de experimentar agora?",

        alternativas: [
            {
                texto: "Uma aventura em um mundo desconhecido.",
                genero: "adventure"
            },
            {
                texto: "Construir e cuidar do meu próprio mundo.",
                genero: "simulation"
            },
            {
                texto: "Um jogo que recompense meu planejamento.",
                genero: "strategy"
            },
            {
                texto: "Fases divertidas com obstáculos e plataformas.",
                genero: "platformer"
            }
        ]
    }

];


// ==========================================
// INFORMAÇÕES DOS GÊNEROS
// ==========================================

const generosRecomendacao = {

    "action": "Ação",

    "adventure": "Aventura",

    "role-playing-games-rpg": "RPG",

    "strategy": "Estratégia",

    "simulation": "Simulação",

    "puzzle": "Quebra-cabeças",

    "racing": "Corrida",

    "platformer": "Plataforma"

};


// ==========================================
// ESTADO DO QUIZ
// ==========================================

let respostasRecomendacao = [];

let requisicaoRecomendacaoAtual = 0;


// ==========================================
// INICIAR QUIZ
// ==========================================

function iniciarQuizRecomendacao() {

    // INVALIDA RESULTADOS DE CONSULTAS ANTIGAS

    requisicaoRecomendacaoAtual++;

    quizAtual = "recomendacao";

    indicePergunta = 0;

    respostasRecomendacao = [];

    alternativaSelecionada = null;


    // MOSTRAR ÁREA DO QUIZ

    quizCentral.hidden = true;

    quizJogo.hidden = false;


    // CABEÇALHO DO QUIZ

    quizCategoria.textContent =
        "RECOMENDAÇÕES";

    quizTitulo.textContent =
        "Qual será seu próximo jogo?";

    quizDescricao.textContent =
        "Responda de acordo com suas preferências e descubra jogos que podem combinar com você.";


    // REDEFINIR TELAS

    quizResultado.hidden = true;

    quizPerguntaArea.hidden = false;

    quizProgressoContainer.hidden = false;


    mostrarPerguntaRecomendacao();

    quizJogo.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// MOSTRAR PERGUNTA
// ==========================================

function mostrarPerguntaRecomendacao() {

    const dados =
        perguntasRecomendacao[indicePergunta];

    const total =
        perguntasRecomendacao.length;


    alternativaSelecionada = null;

    quizPergunta.textContent =
        dados.pergunta;


    // PROGRESSO

    quizContador.textContent =
        `Pergunta ${indicePergunta + 1} de ${total}`;

    const porcentagem = Math.round(
        (indicePergunta / total) * 100
    );

    quizPorcentagem.textContent =
        `${porcentagem}%`;

    quizProgressoPreenchimento.style.width =
        `${porcentagem}%`;

    quizProgresso.setAttribute(
        "aria-valuenow",
        String(porcentagem)
    );


    // LIMPAR ALTERNATIVAS

    quizAlternativas.replaceChildren();

    quizFeedback.textContent = "";

    quizFeedback.className =
        "quiz-feedback";


    // CRIAR BOTÕES

    dados.alternativas.forEach(
        (alternativa, indice) => {

            const botao =
                document.createElement("button");

            botao.type = "button";

            botao.className =
                "quiz-alternativa";

            botao.textContent =
                alternativa.texto;

            botao.setAttribute(
                "aria-pressed",
                "false"
            );


            botao.addEventListener("click", () => {

                // REUTILIZA A FUNÇÃO QUE JÁ
                // EXISTE NO QUIZ DE PERSONALIDADE

                selecionarAlternativa(
                    indice,
                    botao
                );

            });


            quizAlternativas.appendChild(botao);

        }
    );


    quizProxima.disabled = true;

    quizProxima.textContent =
        indicePergunta === total - 1
            ? "Encontrar meus jogos →"
            : "Próxima pergunta →";

}


// ==========================================
// AVANÇAR NAS PERGUNTAS
// ==========================================

function proximaPerguntaRecomendacao() {

    if (alternativaSelecionada === null) {
        return;
    }


    const dados =
        perguntasRecomendacao[indicePergunta];

    const resposta =
        dados.alternativas[
            alternativaSelecionada
        ];


    respostasRecomendacao.push(
        resposta.genero
    );


    indicePergunta++;


    if (
        indicePergunta >=
        perguntasRecomendacao.length
    ) {

        mostrarResultadoRecomendacao();

        return;

    }


    mostrarPerguntaRecomendacao();

}


// ==========================================
// DESCOBRIR GÊNERO PREDOMINANTE
// ==========================================

function calcularGeneroRecomendado() {

    const pontuacoes = {};

    respostasRecomendacao.forEach(genero => {

        pontuacoes[genero] =
            (pontuacoes[genero] || 0) + 1;

    });


    const maiorPontuacao = Math.max(
        ...Object.values(pontuacoes)
    );


    // EM CASO DE EMPATE, ESCOLHER O GÊNERO
    // QUE APARECEU PRIMEIRO NAS RESPOSTAS.

    return respostasRecomendacao.find(
        genero =>
            pontuacoes[genero] === maiorPontuacao
    );

}


// ==========================================
// RESULTADO E RECOMENDAÇÕES DA RAWG
// ==========================================

async function mostrarResultadoRecomendacao() {

    const genero =
        calcularGeneroRecomendado();

    const nomeGenero =
        generosRecomendacao[genero] || "Jogos";


    // ESCONDER PERGUNTAS

    quizPerguntaArea.hidden = true;

    quizProgressoContainer.hidden = true;

    quizResultado.hidden = false;


    // TEXTO DO RESULTADO

    quizResultadoTitulo.textContent =
        `Que tal experimentar ${nomeGenero}?`;

    quizResultadoDescricao.textContent =
        `Suas escolhas indicaram interesse em jogos de ${nomeGenero.toLowerCase()}. Veja algumas sugestões do catálogo da Break Tec!`;


    // ESTADO DE CARREGAMENTO

    quizResultadoDetalhes.replaceChildren();

    const carregando =
        document.createElement("p");

    carregando.textContent =
        "Buscando recomendações de jogos...";

    quizResultadoDetalhes.appendChild(
        carregando
    );


    // IDENTIFICADOR PARA EVITAR EXIBIR
    // RESPOSTAS ANTIGAS DE OUTRO QUIZ

    const identificador =
        ++requisicaoRecomendacaoAtual;


    try {

        // UTILIZA A ROTA QUE JÁ CRIAMOS
        // PARA O CATÁLOGO OFICIAL

        const parametros = new URLSearchParams({

            pagina: "1",

            genero: genero,

            ordenacao: "popularidade"

        });


        const resposta = await fetch(
            `/api/catalogo/oficiais?${parametros}`
        );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível consultar as recomendações."
            );

        }


        const dados = await resposta.json();


        // IGNORAR CONSULTAS QUE NÃO PERTENCEM
        // MAIS AO QUIZ ATUAL

        if (
            quizAtual !== "recomendacao" ||
            identificador !== requisicaoRecomendacaoAtual
        ) {
            return;
        }


        const jogos = Array.isArray(dados.jogos)
            ? dados.jogos.slice(0, 3)
            : [];


        quizResultadoDetalhes.replaceChildren();


        if (jogos.length === 0) {

            const vazio = document.createElement("p");

            vazio.textContent =
                "Não encontramos sugestões para esse gênero no momento. Você pode explorar outros títulos no catálogo.";

            quizResultadoDetalhes.appendChild(vazio);

        } else {

            jogos.forEach(jogo => {

                const card =
                    criarCardRecomendacao(jogo);

                if (card) {

                    quizResultadoDetalhes.appendChild(
                        card
                    );

                }

            });

        }


        // LINK PARA EXPLORAR O CATÁLOGO

        const catalogo = document.createElement("a");

        catalogo.href =
            "catalogo.html?tipo=oficial";

        catalogo.className =
            "quiz-recomendacao-catalogo";

        catalogo.textContent =
            "Explorar mais jogos oficiais →";

        quizResultadoDetalhes.appendChild(
            catalogo
        );


    } catch (erro) {

        if (
            quizAtual !== "recomendacao" ||
            identificador !== requisicaoRecomendacaoAtual
        ) {
            return;
        }


        console.error(
            "Erro nas recomendações:",
            erro
        );


        quizResultadoDetalhes.replaceChildren();


        const mensagem =
            document.createElement("p");

        mensagem.textContent =
            "Não foi possível carregar as recomendações agora. Tente novamente mais tarde.";


        const catalogo =
            document.createElement("a");

        catalogo.href =
            "catalogo.html?tipo=oficial";

        catalogo.className =
            "quiz-recomendacao-catalogo";

        catalogo.textContent =
            "Explorar catálogo oficial →";


        quizResultadoDetalhes.append(
            mensagem,
            catalogo
        );

    }

}


// ==========================================
// CRIAR CARD DE RECOMENDAÇÃO
// ==========================================

function criarCardRecomendacao(jogo) {

    const id = Number(
        jogo.id_externo
    );

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        return null;
    }


    const card =
        document.createElement("article");

    card.className =
        "quiz-recomendacao-card";


    // IMAGEM OU ESPAÇO RESERVADO

    const capa =
        document.createElement("div");

    capa.className =
        "quiz-recomendacao-imagem";

    capa.textContent = "BREAKTEC";


    if (jogo.imagem) {

        try {

            const url = new URL(
                jogo.imagem,
                window.location.href
            );

            if (
                url.protocol === "https:" ||
                url.protocol === "http:"
            ) {

                const imagem =
                    document.createElement("img");

                imagem.src = url.href;

                imagem.alt =
                    `Capa de ${jogo.titulo || "jogo"}`;

                imagem.loading = "lazy";

                imagem.addEventListener(
                    "error",
                    () => {

                        imagem.remove();

                        capa.textContent =
                            "BREAKTEC";

                    }
                );

                capa.replaceChildren(imagem);

            }

        } catch (erro) {

            console.warn(
                "Imagem inválida:",
                jogo.titulo
            );

        }

    }


    // CONTEÚDO

    const conteudo =
        document.createElement("div");

    conteudo.className =
        "quiz-recomendacao-conteudo";


    const titulo =
        document.createElement("h4");

    titulo.textContent =
        jogo.titulo || "Jogo oficial";


    const genero =
        document.createElement("p");

    genero.textContent =
        jogo.genero || "Jogo oficial";


    // LINK PARA A PÁGINA DO JOGO

    const link =
        document.createElement("a");

    link.href =
        `jogo-oficial.html?id=${id}`;

    link.textContent =
        "Conhecer jogo →";


    conteudo.append(
        titulo,
        genero,
        link
    );


    card.append(
        capa,
        conteudo
    );


    return card;

}


// ==========================================
// ATIVAR OS TRÊS QUIZZES
// ==========================================

quizBotoesIniciar.forEach(botao => {

    const tipo = botao.dataset.quiz;

    botao.disabled = false;

    if (tipo === "personalidade") {

        botao.addEventListener(
            "click",
            iniciarQuizPersonalidade
        );

    } else if (tipo === "conhecimento") {

        botao.addEventListener(
            "click",
            iniciarQuizConhecimento
        );

    } else if (tipo === "recomendacao") {

        botao.textContent =
            "Encontrar meu jogo →";

        botao.removeAttribute("title");

        botao.addEventListener(
            "click",
            iniciarQuizRecomendacao
        );

    }

});


// BOTÃO PRÓXIMA PERGUNTA

quizProxima.addEventListener("click", () => {

    if (quizAtual === "personalidade") {

        proximaPerguntaPersonalidade();

    } else if (quizAtual === "conhecimento") {

        proximaPerguntaConhecimento();

    } else if (quizAtual === "recomendacao") {

        proximaPerguntaRecomendacao();

    }

});


// VOLTAR PARA A CENTRAL

quizVoltar.addEventListener(
    "click",
    mostrarCentralQuizzes
);


// REFAZER O QUIZ ATUAL

quizRefazer.addEventListener("click", () => {

    if (quizAtual === "personalidade") {

        iniciarQuizPersonalidade();

    } else if (quizAtual === "conhecimento") {

        iniciarQuizConhecimento();

    } else if (quizAtual === "recomendacao") {

        iniciarQuizRecomendacao();

    }

});


// ESCOLHER OUTRO QUIZ

quizOutro.addEventListener(
    "click",
    mostrarCentralQuizzes
);
