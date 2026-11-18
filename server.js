require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs/promises");
const { randomUUID } = require("crypto");

console.log("SERVER.JS EXECUTADO:");
console.log(__filename);

const app = express();


// ==========================================
// CONFIGURAÇÃO DAS FOTOS DE PERFIL
// ==========================================

// Pasta fora da área pública do site

const pastaFotos = path.resolve(
    __dirname,
    "..",
    "breaktec-uploads",
    "avatars"
);

// Receber uma imagem com limite de 3 MB

const receberFoto = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1
    }
}).single("foto");

// ==========================================
// CONFIGURAÇÃO DAS IMAGENS DOS PROJETOS
// ==========================================

const pastaImagensProjetos = path.resolve(
    __dirname,
    "..",
    "breaktec-uploads",
    "projects"
);

const receberImagemProjeto = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
}).single("imagem");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,

        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

// Permite acessar HTML, CSS, JS e imagens do projeto
app.use(express.static(__dirname));

const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conexao.connect((erro) => {
    if (erro) {
        console.error("Erro ao conectar ao MySQL:");
        console.error(erro);
        return;
    }

    console.log("Conectado ao banco breaktec com sucesso!");
});


// TESTE DO SERVIDOR
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "index.html")
    );
});


// CADASTRO DE USUÁRIO
app.post("/api/usuarios", async (req, res) => {

        const {
            nome,
            email,
            senha
        } = req.body;


        // VERIFICA CAMPOS

        if (!nome || !email || !senha) {

            return res.status(400).json({
                mensagem:
                    "Preencha todos os campos."
            });

        }


        // VERIFICA TAMANHO DA SENHA

        if (senha.length < 6) {

            return res.status(400).json({
                mensagem:
                    "A senha deve ter pelo menos 6 caracteres."
            });

        }


        try {

            // TRANSFORMA A SENHA EM HASH

            const senhaHash =
                await bcrypt.hash(senha, 10);

            const sql = `
            INSERT INTO usuarios
            (nome, email, senha)
            VALUES (?, ?, ?)
            `;

            conexao.query(
                sql,

                [
                    nome,
                    email,
                    senhaHash
                ],

                (erro, resultado) => {

                    if (erro) {

                        // EMAIL DUPLICADO

                        if (
                            erro.code ===
                            "ER_DUP_ENTRY"
                        ) {

                            return res
                                .status(409)
                                .json({

                                    mensagem:
                                        "Este e-mail já está cadastrado."

                                });

                        }


                        console.error(erro);


                        return res
                            .status(500)
                            .json({

                                mensagem:
                                    "Erro ao cadastrar usuário."

                            });

                    }


                    res.status(201).json({

                        mensagem:
                            "Cadastro realizado com sucesso!",

                        id:
                            resultado.insertId

                    });

                }
            );


        } catch (erro) {

            console.error(
                "Erro ao gerar hash:",
                erro
            );


            res.status(500).json({

                mensagem:
                    "Erro interno do servidor."

            });

        }

    }
);

// LOGIN DE USUÁRIO

app.post("/api/login", (req, res) => {

    const {
        email,
        senha
    } = req.body;


    // VERIFICA OS CAMPOS

    if (!email || !senha) {

        return res.status(400).json({
            mensagem:
                "Preencha e-mail e senha."
        });

    }


    // PROCURA O USUÁRIO PELO E-MAIL

    const sql = `
        SELECT id, nome, email, senha
        FROM usuarios
        WHERE email = ?
    `;


    conexao.query(
        sql,
        [email],

        async (erro, resultados) => {

            if (erro) {

                console.error(
                    "Erro ao buscar usuário:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro interno do servidor."
                });

            }


            // USUÁRIO NÃO ENCONTRADO

            if (resultados.length === 0) {

                return res.status(401).json({
                    mensagem:
                        "E-mail ou senha incorretos."
                });

            }


            const usuario =
                resultados[0];


            try {

                // COMPARA A SENHA DIGITADA COM O HASH

                const senhaCorreta =
                    await bcrypt.compare(
                        senha,
                        usuario.senha
                    );


                if (!senhaCorreta) {

                    return res.status(401).json({
                        mensagem:
                            "E-mail ou senha incorretos."
                    });

                }

                req.session.usuario = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email
};


// GARANTE QUE A SESSÃO FOI SALVA
req.session.save((erro) => {

    if (erro) {

        console.error(
            "Erro ao salvar sessão:",
            erro
        );

        return res.status(500).json({
            mensagem:
                "Erro ao iniciar a sessão."
        });
    }


    // LOGIN CORRETO
    res.status(200).json({

        mensagem:
            "Login realizado com sucesso!",

        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }

    });

});


            } catch (erro) {

                console.error(
                    "Erro ao verificar senha:",
                    erro
                );

                res.status(500).json({
                    mensagem:
                        "Erro interno do servidor."
                });

            }

        }
    );

});

// VERIFICAR SESSÃO

app.get("/api/sessao", (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            logado: false
        });
    }

    res.json({
        logado: true,
        usuario: req.session.usuario
    });

});


// LOGOUT

app.post("/api/logout", (req, res) => {

    req.session.destroy((erro) => {

        if (erro) {
            return res.status(500).json({
                mensagem: "Erro ao sair da conta."
            });
        }

        res.json({
            mensagem: "Logout realizado com sucesso."
        });

    });

});

// ==========================
// ESTATÍSTICAS DO PERFIL
// ==========================

app.get("/api/perfil/estatisticas", (req, res) => {

    // Protege a rota
    if (!req.session.usuario) {

        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });

    }


    const usuarioId =
        req.session.usuario.id;


    const sql = `
        SELECT

            (
                SELECT COUNT(*)
                FROM projetos
                WHERE usuario_id = ?
            ) AS projetos,

            (
                SELECT COUNT(*)
                FROM avaliacoes
                WHERE usuario_id = ?
            ) AS avaliacoes,

            (
                SELECT COUNT(*)
                FROM favoritos
                WHERE usuario_id = ?
            ) AS favoritos
    `;


    conexao.query(
        sql,
        [
            usuarioId,
            usuarioId,
            usuarioId
        ],

        (erro, resultados) => {

            if (erro) {

                console.error(
                    "Erro ao carregar estatísticas:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao carregar estatísticas."
                });

            }


            res.json(resultados[0]);

        }
    );

});


// ==========================
// CRIAR PROJETO
// ==========================

app.post("/api/projetos", (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });

    }

    receberImagemProjeto(req, res, async erroUpload => {

        if (erroUpload) {

            return res.status(400).json({
                mensagem:
                    "A imagem deve ser JPG, PNG ou WebP e ter até 5 MB."
            });

        }

        const {
            titulo,
            descricao,
            categoria
        } = req.body;

        if (!titulo || !titulo.trim()) {

            return res.status(400).json({
                mensagem: "Informe o título do projeto."
            });

        }

        let caminhoImagem = null;
        let arquivoCriado = false;

        try {

            let nomeArquivo = null;

            // PROCESSAR IMAGEM, CASO TENHA SIDO ENVIADA

            if (req.file) {

                const metadados = await sharp(
                    req.file.buffer,
                    { limitInputPixels: 16000000 }
                ).metadata();

                if (!["jpeg", "png", "webp"].includes(metadados.format)) {

                    return res.status(400).json({
                        mensagem:
                            "Formato inválido. Envie JPG, PNG ou WebP."
                    });

                }

                const imagemProcessada = await sharp(
                    req.file.buffer,
                    { limitInputPixels: 16000000 }
                )
                    .rotate()
                    .resize(1280, 720, {
                        fit: "inside",
                        withoutEnlargement: true
                    })
                    .webp({ quality: 82 })
                    .toBuffer();

                await fs.mkdir(
                    pastaImagensProjetos,
                    { recursive: true }
                );

                nomeArquivo = `${randomUUID()}.webp`;

                caminhoImagem = path.join(
                    pastaImagensProjetos,
                    nomeArquivo
                );

                await fs.writeFile(
                    caminhoImagem,
                    imagemProcessada,
                    { flag: "wx" }
                );

                arquivoCriado = true;

            }

            // SALVAR PROJETO NO BANCO

            const usuarioId = req.session.usuario.id;

            const [resultado] = await conexao.promise().execute(
                `INSERT INTO projetos
                (
                    titulo,
                    descricao,
                    categoria,
                    imagem,
                    usuario_id
                )
                VALUES (?, ?, ?, ?, ?)`,
                [
                    titulo.trim(),
                    descricao || null,
                    categoria || null,
                    nomeArquivo,
                    usuarioId
                ]
            );

            res.status(201).json({

                mensagem: "Projeto publicado com sucesso!",

                projeto: {
                    id: resultado.insertId,
                    titulo: titulo.trim(),
                    descricao,
                    categoria,
                    imagem: nomeArquivo
                }

            });

        } catch (erro) {

            console.error(
                "Erro ao criar projeto:",
                erro
            );

            // APAGAR ARQUIVO SE O CADASTRO FALHAR

            if (arquivoCriado && caminhoImagem) {

                await fs.unlink(caminhoImagem).catch(() => {});

            }

            res.status(500).json({
                mensagem: "Erro ao publicar projeto."
            });

        }

    });

});

// ==========================
// CARREGAR UM PROJETO
// ==========================

app.get("/api/projetos/:id", (req, res) => {

    const projetoId = req.params.id;

    const sql = `
        SELECT
            p.id,
            p.titulo,
            p.descricao,
            p.categoria,
            p.imagem,
            p.criado_em,
            u.id AS autor_id,
            u.nome AS autor_nome
        FROM projetos p
        LEFT JOIN usuarios u
            ON p.usuario_id = u.id
        WHERE p.id = ?
    `;

    conexao.query(sql, [projetoId], (erro, resultados) => {

        if (erro) {
            console.error("Erro ao buscar projeto:", erro);

            return res.status(500).json({
                mensagem: "Erro ao carregar projeto."
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensagem: "Projeto não encontrado."
            });
        }

        res.json({
            projeto: resultados[0]
        });

    });

});

// ==========================
// ENTREGAR IMAGEM DO PROJETO
// ==========================

app.get("/api/projetos/:id/imagem", async (req, res) => {

    const projetoId = Number(req.params.id);

    if (!Number.isSafeInteger(projetoId) || projetoId <= 0) {
        return res.status(404).end();
    }

    try {

        const [projetos] = await conexao.promise().execute(
            `SELECT imagem
             FROM projetos
             WHERE id = ?
             LIMIT 1`,
            [projetoId]
        );

        if (!projetos.length) {
            return res.status(404).end();
        }

        const arquivo = projetos[0].imagem || "";

        if (!/^[a-f0-9-]{36}\.webp$/.test(arquivo)) { 
            return res.status(404).end();
        }

        res.type("webp");

        res.sendFile(
            path.join(pastaImagensProjetos, arquivo),
            erro => {

                if (erro && !res.headersSent) {
                    res.status(404).end();
                }

            }
        );

    } catch (erro) {

        console.error(
            "Erro ao entregar imagem do projeto:",
            erro
        );

        if (!res.headersSent) {
            res.status(500).end();
        }

    }

});

// ==========================
// LISTAR PROJETOS DO USUÁRIO
// ==========================

app.get("/api/meus-projetos", (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });

    }

    const usuarioId =
        req.session.usuario.id;

    const sql = `
        SELECT
            id,
            titulo,
            descricao,
            categoria,
            imagem,
            criado_em
        FROM projetos
        WHERE usuario_id = ?
        ORDER BY criado_em DESC
    `;

    conexao.query(
        sql,
        [usuarioId],

        (erro, resultados) => {

            if (erro) {

                console.error(
                    "Erro ao carregar projetos:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao carregar projetos."
                });

            }

            res.json(resultados);

        }
    );

});

//==========================
//EDITAR PROJETO
//==========================

app.put("/api/projetos/:id", (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensagem:
                "Usuário não autenticado."
        });
    }

    const projetoId =
        req.params.id;

    const usuarioId =
        req.session.usuario.id;

    const {
        titulo,
        descricao,
        categoria
    } = req.body;

    if (!titulo) {

        return res.status(400).json({
            mensagem:
                "Informe o título do projeto."
        });
    }

    const sql = `
        UPDATE projetos
        SET titulo = ?,
            descricao = ?,
            categoria = ?
        WHERE id = ?
        AND usuario_id = ?
    `;

    conexao.query(
        sql,
        [
            titulo,
            descricao || null,
            categoria || null,
            projetoId,
            usuarioId
        ],

        (erro, resultado) => {

            if (erro) {

                console.error(
                    "Erro ao editar projeto:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao editar projeto."
                });
            }

            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    mensagem:
                        "Projeto não encontrado."
                });
            }

            res.json({
                mensagem:
                    "Projeto atualizado com sucesso!"
            });
        }
    );
});

// ==========================
// EXCLUIR PROJETO
// ==========================

app.delete("/api/projetos/:id", (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });

    }

    const projetoId =
        req.params.id;

    const usuarioId =
        req.session.usuario.id;

    const sql = `
        DELETE FROM projetos
        WHERE id = ?
        AND usuario_id = ?
    `;

    conexao.query(
        sql,
        [
            projetoId,
            usuarioId
        ],

        (erro, resultado) => {

            if (erro) {

                console.error(
                    "Erro ao excluir projeto:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao excluir projeto."
                });

            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensagem:
                        "Projeto não encontrado."
                });

            }

            res.json({
                mensagem:
                    "Projeto excluído com sucesso!"
            });

        }
    );

});

// ==========================
// ADICIONAR FAVORITO
// ==========================

app.post("/api/favoritos/:projetoId", (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const usuarioId =
        req.session.usuario.id;

    const projetoId =
        req.params.projetoId;

    const sql = `
        INSERT INTO favoritos
        (usuario_id, projeto_id)
        VALUES (?, ?)
    `;

    conexao.query(
        sql,
        [usuarioId, projetoId],
        (erro) => {

            if (erro) {

                if (erro.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensagem:
                            "Este projeto já está nos favoritos."
                    });
                }

                console.error(
                    "Erro ao adicionar favorito:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao adicionar favorito."
                });
            }

            res.status(201).json({
                mensagem:
                    "Projeto adicionado aos favoritos!"
            });
        }
    );
});


// ==========================
// REMOVER FAVORITO
// ==========================

app.delete("/api/favoritos/:projetoId", (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const usuarioId =
        req.session.usuario.id;

    const projetoId =
        req.params.projetoId;

    const sql = `
        DELETE FROM favoritos
        WHERE usuario_id = ?
        AND projeto_id = ?
    `;

    conexao.query(
        sql,
        [usuarioId, projetoId],
        (erro, resultado) => {

            if (erro) {

                console.error(
                    "Erro ao remover favorito:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao remover favorito."
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensagem:
                        "Favorito não encontrado."
                });
            }

            res.json({
                mensagem:
                    "Projeto removido dos favoritos."
            });
        }
    );
});

// ==========================
// VERIFICAR SE É FAVORITO
// ==========================

app.get("/api/favoritos/:projetoId/status", (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const usuarioId =
        req.session.usuario.id;

    const projetoId =
        req.params.projetoId;

    const sql = `
        SELECT id
        FROM favoritos
        WHERE usuario_id = ?
        AND projeto_id = ?
        LIMIT 1
    `;

    conexao.query(
        sql,
        [usuarioId, projetoId],
        (erro, resultados) => {

            if (erro) {

                console.error(
                    "Erro ao verificar favorito:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao verificar favorito."
                });
            }

            res.json({
                favoritado:
                    resultados.length > 0
            });
        }
    );
});

// ==========================
// LISTAR FAVORITOS
// ==========================

app.get("/api/meus-favoritos", (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const usuarioId =
        req.session.usuario.id;

    const sql = `
    SELECT
        p.id,
        p.titulo,
        p.descricao,
        p.categoria,
        p.imagem,
        p.criado_em,
        u.nome AS autor_nome

    FROM favoritos f

    INNER JOIN projetos p
        ON f.projeto_id = p.id

    LEFT JOIN usuarios u
        ON p.usuario_id = u.id

    WHERE f.usuario_id = ?

    ORDER BY f.criado_em DESC
`;

    conexao.query(
        sql,
        [usuarioId],
        (erro, resultados) => {

            if (erro) {

                console.error(
                    "Erro ao carregar favoritos:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao carregar favoritos."
                });
            }

            res.json(resultados);
        }
    );
});

// ==========================
// AVALIAR PROJETO
// ==========================

app.post("/api/projetos/:id/avaliacoes", (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Faça login para avaliar este projeto."
        });
    }

    const projetoId = req.params.id;
    const usuarioId = req.session.usuario.id;

    const {
    jogabilidade,
    historia,
    visual,
    som,
    originalidade,
    comentario: comentarioRecebido
} = req.body;

if (
    comentarioRecebido !== undefined &&
    typeof comentarioRecebido !== "string"
) {
    return res.status(400).json({
        mensagem: "Comentário inválido."
    });
}

const comentario =
    typeof comentarioRecebido === "string"
        ? comentarioRecebido.trim()
        : null;

if (comentario && comentario.length > 1000) {
    return res.status(400).json({
        mensagem: "O comentário deve ter até 1000 caracteres."
    });
}

    const notas = [
        jogabilidade,
        historia,
        visual,
        som,
        originalidade
    ].map(Number);

    const notasValidas = notas.every(
        nota =>
            Number.isInteger(nota) &&
            nota >= 1 &&
            nota <= 5
    );

    if (!notasValidas) {
        return res.status(400).json({
            mensagem:
                "Todas as categorias devem receber uma nota de 1 a 5."
        });
    }

    const notaGeral =
        notas.reduce((total, nota) => total + nota, 0)
        / notas.length;

    const sql = `
    INSERT INTO avaliacoes
    (
        nota,
        jogabilidade,
        historia,
        visual,
        som,
        originalidade,
        comentario,
        usuario_id,
        projeto_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON DUPLICATE KEY UPDATE
        nota = VALUES(nota),
        jogabilidade = VALUES(jogabilidade),
        historia = VALUES(historia),
        visual = VALUES(visual),
        som = VALUES(som),
        originalidade = VALUES(originalidade),
        comentario = COALESCE(VALUES(comentario), comentario)
`;

    conexao.query(
        sql,
        [
        notaGeral,
        jogabilidade,
        historia,
        visual,
        som,
        originalidade,
        comentario,
        usuarioId,
        projetoId
    ],
        (erro) => {

            if (erro) {
                console.error(
                    "Erro ao salvar avaliação:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Não foi possível salvar a avaliação."
                });
            }

            res.json({
                mensagem: "Avaliação salva com sucesso!"
            });
        }
    );

});

// ==========================
// MINHA AVALIAÇÃO DO PROJETO
// ==========================

app.get("/api/projetos/:id/minha-avaliacao",
    (req, res) => {

        if (!req.session.usuario) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado."
            });
        }

        const projetoId = req.params.id;
        const usuarioId = req.session.usuario.id;

        const sql = `
            SELECT
                jogabilidade,
                historia,
                visual,
                som,
                originalidade,
                comentario
            FROM avaliacoes
            WHERE usuario_id = ?
            AND projeto_id = ?
        `;

        conexao.query(
            sql,
            [usuarioId, projetoId],
            (erro, resultados) => {

                if (erro) {

                    console.error(
                        "Erro ao buscar avaliação:",
                        erro
                    );

                    return res.status(500).json({
                        mensagem:
                            "Erro ao buscar avaliação."
                    });
                }

                if (resultados.length === 0) {

                    return res.json({
                        avaliou: false
                    });
                }

                res.json({
                    avaliou: true,
                    avaliacao: resultados[0]
                });
            }
        );
    }
);

// ==========================
// DNA DO JOGO / BREAK SCORE
// ==========================

app.get("/api/projetos/:id/dna", (req, res) => {

    const projetoId = req.params.id;

    const sql = `
        SELECT
            COUNT(*) AS total_avaliacoes,

            ROUND(AVG(jogabilidade), 1)
                AS jogabilidade,

            ROUND(AVG(historia), 1)
                AS historia,

            ROUND(AVG(visual), 1)
                AS visual,

            ROUND(AVG(som), 1)
                AS som,

            ROUND(AVG(originalidade), 1)
                AS originalidade,

            ROUND(AVG(nota), 1)
                AS break_score

        FROM avaliacoes

        WHERE projeto_id = ?
    `;

    conexao.query(
        sql,
        [projetoId],

        (erro, resultados) => {

            if (erro) {

                console.error(
                    "Erro ao calcular DNA do jogo:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao carregar avaliações."
                });
            }

            const dna = resultados[0];

            res.json({
                totalAvaliacoes:
                    Number(dna.total_avaliacoes),

                jogabilidade:
                    Number(dna.jogabilidade) || 0,

                historia:
                    Number(dna.historia) || 0,

                visual:
                    Number(dna.visual) || 0,

                som:
                    Number(dna.som) || 0,

                originalidade:
                    Number(dna.originalidade) || 0,

                breakScore:
                    Number(dna.break_score) || 0
            });

        }
    );

});

// ==========================
// LISTAR PROJETOS PÚBLICOS
// ==========================

app.get("/api/projetos", (req, res) => {

    const sql = `
        SELECT
            p.id,
            p.titulo,
            p.descricao,
            p.categoria,
            p.imagem,
            p.criado_em,

            u.nome AS autor_nome,

            COUNT(a.id) AS total_avaliacoes,

            ROUND(
                AVG(a.nota) * 2,
                1
            ) AS break_score

        FROM projetos p

        LEFT JOIN usuarios u
            ON p.usuario_id = u.id

        LEFT JOIN avaliacoes a
            ON a.projeto_id = p.id

        GROUP BY
            p.id,
            p.titulo,
            p.descricao,
            p.categoria,
            p.imagem,
            p.criado_em,
            u.nome

        ORDER BY p.criado_em DESC
    `;

    conexao.query(
        sql,
        (erro, resultados) => {

            if (erro) {

                console.error(
                    "Erro ao carregar projetos:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao carregar projetos."
                });
            }

            res.json(resultados);
        }
    );
});

// ==========================
// RANKING DE PROJETOS
// ==========================

app.get("/api/ranking", (req, res) => {

    const sql = `
        SELECT
            p.id,
            p.titulo,
            p.categoria,
            p.imagem,

            u.nome AS autor,

            COUNT(a.id) AS total_avaliacoes,

            ROUND(
                AVG(a.nota) * 2,
                1
            ) AS break_score

        FROM projetos p

        INNER JOIN avaliacoes a
            ON a.projeto_id = p.id

        LEFT JOIN usuarios u
            ON p.usuario_id = u.id

        GROUP BY
            p.id,
            p.titulo,
            p.categoria,
            p.imagem,
            u.nome

        ORDER BY
            break_score DESC,
            total_avaliacoes DESC

        LIMIT 5
    `;

    conexao.query(
        sql,
        (erro, resultados) => {

            if (erro) {

                console.error(
                    "Erro ao carregar ranking:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao carregar ranking."
                });
            }

            res.json(resultados);
        }
    );
});

// ==========================
// COMUNIDADE
// ==========================

app.get("/api/comunidade", (req, res) => {

    // TOTAIS DA COMUNIDADE
    const sqlTotais = `
        SELECT
            (SELECT COUNT(*) FROM usuarios) AS usuarios,
            (SELECT COUNT(*) FROM projetos) AS projetos,
            (SELECT COUNT(*) FROM avaliacoes) AS avaliacoes
    `;


    conexao.query(
        sqlTotais,
        (erro, resultadosTotais) => {

            if (erro) {

                console.error(
                    "Erro ao carregar totais da comunidade:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao carregar comunidade."
                });
            }


            // ATIVIDADES RECENTES
            const sqlAtividades = `

                SELECT *
                FROM (

                    /* PROJETOS PUBLICADOS */

                    SELECT
                        'projeto' AS tipo,
                        u.nome AS usuario,
                        p.titulo AS projeto,
                        p.id AS projeto_id,
                        p.criado_em AS data

                    FROM projetos p

                    INNER JOIN usuarios u
                        ON p.usuario_id = u.id


                    UNION ALL


                    /* AVALIAÇÕES REALIZADAS */

                    SELECT
                        'avaliacao' AS tipo,
                        u.nome AS usuario,
                        p.titulo AS projeto,
                        p.id AS projeto_id,
                        a.criado_em AS data

                    FROM avaliacoes a

                    INNER JOIN usuarios u
                        ON a.usuario_id = u.id

                    INNER JOIN projetos p
                        ON a.projeto_id = p.id

                ) AS atividades

                ORDER BY data DESC

                LIMIT 6
            `;


            conexao.query(
                sqlAtividades,
                (erro, atividades) => {

                    if (erro) {

                        console.error(
                            "Erro ao carregar atividades:",
                            erro
                        );

                        return res.status(500).json({
                            mensagem:
                                "Erro ao carregar atividades."
                        });
                    }


                    res.json({

                        totais: {
                            usuarios:
                                Number(
                                    resultadosTotais[0].usuarios
                                ),

                            projetos:
                                Number(
                                    resultadosTotais[0].projetos
                                ),

                            avaliacoes:
                                Number(
                                    resultadosTotais[0].avaliacoes
                                )
                        },

                        atividades:
                            atividades
                    });

                }
            );

        }
    );

});


// ==========================
// JOGOS OFICIAIS - API RAWG
// ==========================

// Requer Node.js 18 ou superior.
// A chave da API fica protegida no arquivo .env.

const cacheRawg = new Map();

const TEMPO_CACHE_RAWG = 5 * 60 * 1000;


// ==========================
// CONSULTAR A API
// ==========================

async function consultarRawgRemota(caminho, parametros = {}) {

    if (!process.env.RAWG_API_KEY) {

        const erro = new Error(
            "RAWG_API_KEY não configurada."
        );

        erro.statusLocal = 503;

        throw erro;
    }

    const url = new URL(
        `https://api.rawg.io/api/${caminho}`
    );

    url.searchParams.set(
        "key",
        process.env.RAWG_API_KEY
    );

    for (const [chave, valor] of Object.entries(parametros)) {

        url.searchParams.set(
            chave,
            String(valor)
        );
    }

    // Cache temporário para reduzir consultas à API.

    const chaveCache =
        `${caminho}:${JSON.stringify(parametros)}`;

    const existente = cacheRawg.get(chaveCache);

    if (existente && existente.expiraEm > Date.now()) {
        return existente.dados;
    }

    const controlador = new AbortController();

    const temporizador = setTimeout(() => {
        controlador.abort();
    }, 15000);

    try {

        const resposta = await fetch(url, {
            signal: controlador.signal
        });

        if (!resposta.ok) {

            const erro = new Error(
                `RAWG respondeu com status ${resposta.status}`
            );

            erro.statusRawg = resposta.status;

            throw erro;
        }

        const dados = await resposta.json();

        if (cacheRawg.size >= 50) {
            cacheRawg.clear();
        }

        cacheRawg.set(chaveCache, {
            dados,
            expiraEm: Date.now() + TEMPO_CACHE_RAWG
        });

        return dados;

    } finally {

        clearTimeout(temporizador);
    }
}


 // ==========================================
 // RAWG - MODO DE EMERGÊNCIA VIA MYSQL
 // ==========================================

 let rawgIndisponivelAte = 0;

 function jogoLocalParaRawg(registro) {
     const listaNomes = valor => String(valor || "")
         .split(",")
         .map(nome => nome.trim())
         .filter(Boolean)
         .map(name => ({ name }));

     return {
         id: Number(registro.rawg_id),
         name: registro.titulo,
         background_image: registro.imagem || null,
         genres: listaNomes(registro.genero),
         developers: listaNomes(registro.desenvolvedor),
         publishers: [],
         released: null,
         description_raw:
             "Informações carregadas do catálogo local da Break Tec. A descrição completa depende da RAWG.",
         fonte_url: registro.fonte_url || null,
         modoLocal: true
     };
 }


 async function consultarRawgLocal(caminho, parametros = {}) {
     const banco = conexao.promise();

     const rotaDetalhe = /^games\/(\d+)$/.exec(caminho);

     // CARREGAR UM JOGO ESPECÍFICO
     if (rotaDetalhe) {
         const rawgId = Number(rotaDetalhe[1]);

         const [registros] = await banco.query(`
             SELECT rawg_id, titulo, imagem, desenvolvedor,
                    genero, fonte_url
             FROM jogos_oficiais
             WHERE rawg_id = ?
             LIMIT 1
         `, [rawgId]);

         if (!registros.length) {
             const erro = new Error(
                 "Jogo não cadastrado no catálogo local."
             );

             erro.statusRawg = 404;
             throw erro;
         }

         return jogoLocalParaRawg(registros[0]);
     }

     if (caminho !== "games") {
         const erro = new Error(
             "Consulta indisponível no modo local."
         );

         erro.statusLocal = 503;
         throw erro;
     }


     // LISTAR E PESQUISAR JOGOS SALVOS
     const filtros = ["j.rawg_id IS NOT NULL"];
     const valores = [];

     const busca = String(parametros.search || "").trim();
     const genero = String(parametros.genres || "").trim();

     if (busca) {
         filtros.push("j.titulo LIKE ?");
         valores.push(`%${busca}%`);
     }

     if (genero) {
         const mapaGeneros = {
             "role-playing-games-rpg": "Role-playing",
             shooter: "Shooter",
             platformer: "Platformer"
         };

         filtros.push("j.genero LIKE ?");
         valores.push(
             `%${mapaGeneros[genero] || genero}%`
         );
     }

     const onde = filtros.length
         ? `WHERE ${filtros.join(" AND ")}`
         : "";

     const pagina = Math.max(
         1,
         Math.min(1000, Number(parametros.page) || 1)
     );

     const limite = Math.max(
         1,
         Math.min(50, Number(parametros.page_size) || 12)
     );

     const deslocamento = (pagina - 1) * limite;

     const ordenacao = parametros.ordering === "name"
         ? "j.titulo ASC"
         : parametros.ordering === "-rating"
             ? "media DESC, j.id DESC"
             : "j.id DESC";


     const [contagem] = await banco.query(`
         SELECT COUNT(*) AS total
         FROM jogos_oficiais j
         ${onde}
     `, valores);


     const [registros] = await banco.query(`
         SELECT
             j.rawg_id,
             j.titulo,
             j.imagem,
             j.desenvolvedor,
             j.genero,
             j.fonte_url,

             (
                 SELECT AVG(a.nota)
                 FROM avaliacoes_oficiais a
                 WHERE a.jogo_oficial_id = j.id
             ) AS media

         FROM jogos_oficiais j

         ${onde}

         ORDER BY ${ordenacao}

         LIMIT ? OFFSET ?
     `, [...valores, limite, deslocamento]);


     const total = Number(contagem[0].total) || 0;

     return {
         count: total,
         results: registros.map(jogoLocalParaRawg),
         next: pagina * limite < total ? true : null,
         previous: pagina > 1 ? true : null,
         modoLocal: true
     };
 }


 // FUNÇÃO PRINCIPAL: RAWG OU MYSQL
 async function consultarRawg(caminho, parametros = {}) {

     // Quando ativado, usa diretamente o MySQL
     if (
         process.env.RAWG_MODO_LOCAL === "1" ||
         !process.env.RAWG_API_KEY ||
         Date.now() < rawgIndisponivelAte
     ) {
         return consultarRawgLocal(caminho, parametros);
     }

     try {
         return await consultarRawgRemota(
             caminho,
             parametros
         );

     } catch (erro) {

         // Um jogo inexistente continua retornando 404
         if (erro.statusRawg === 404) {
             throw erro;
         }

         // Evita repetir requisições com erro a todo momento
         rawgIndisponivelAte =
             Date.now() + 2 * 60 * 1000;

         console.warn(
             "RAWG indisponível; usando MySQL:",
             erro.message
         );

         return consultarRawgLocal(
             caminho,
             parametros
         );
     }
 }


// ==========================
// TRATAMENTO DE ERROS
// ==========================

function tratarErroRawg(res, erro) {

    if (erro.statusLocal === 503) {

        return res.status(503).json({
            mensagem:
                "API de jogos não configurada no servidor."
        });
    }

    if (erro.statusRawg === 404) {

        return res.status(404).json({
            mensagem: "Jogo não encontrado."
        });
    }

    if (erro.statusRawg === 429) {

        return res.status(503).json({
            mensagem:
                "Limite de consultas à API atingido. Tente novamente mais tarde."
        });
    }

    console.error(
        "Erro ao consultar RAWG:",
        erro.message
    );

    return res.status(502).json({
        mensagem:
            "Não foi possível consultar o catálogo de jogos agora."
    });
}


// ==========================
// GERAR LINK DO JOGO NA RAWG
// ==========================

function linkRawg(jogo) {

    return jogo && typeof jogo.slug === "string"

        ? `https://rawg.io/games/${encodeURIComponent(jogo.slug)}`

        : "https://rawg.io/";
}


// ==========================
// PESQUISAR JOGOS OFICIAIS
// ==========================

// Exemplo:
// GET /api/jogos-oficiais?busca=minecraft

app.get("/api/jogos-oficiais", async (req, res) => {

    const busca =
        typeof req.query.busca === "string"
            ? req.query.busca.trim()
            : "";

    if (busca.length < 2 || busca.length > 80) {

        return res.status(400).json({
            mensagem:
                "Digite de 2 a 80 caracteres para pesquisar."
        });
    }

    try {

        const dados = await consultarRawg("games", {
            search: busca,
            page_size: 12,
            page: 1
        });

        const jogos = (
            Array.isArray(dados.results)
                ? dados.results
                : []
        ).map(jogo => ({

            id_externo: jogo.id,

            titulo: jogo.name,

            imagem: jogo.background_image || null,

            genero: (jogo.genres || [])
                .map(g => g.name)
                .join(", "),

            lancamento: jogo.released || null,

            // O desenvolvedor será buscado
            // na rota de detalhes do jogo.

            criador: null,

            origem: "oficial",

            fonte: "RAWG",

            fonte_url: linkRawg(jogo)

        }));

        res.json({ jogos });

    } catch (erro) {

        tratarErroRawg(res, erro);
    }
});


// ==========================
// DETALHES DE UM JOGO OFICIAL
// ==========================

// Exemplo:
// GET /api/jogos-oficiais/3498

app.get("/api/jogos-oficiais/:id", async (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {

        return res.status(400).json({
            mensagem: "ID inválido."
        });
    }

    try {


 // SE O JOGO VIER DA IGDB, RETORNA
 // OS DADOS NO MESMO FORMATO DA PÁGINA OFICIAL

    if (fonteOficialDaRequisicao(req) === "IGDB") {

        const jogo = await obterJogoIGDBPadronizado(id);
        return res.json({ jogo });
 }


    const jogo = await consultarRawg(
            `games/${id}`
        );

        res.json({

            jogo: {

                id_externo: jogo.id,

                titulo: jogo.name,

                descricao: jogo.description_raw || "",

                imagem: jogo.background_image || null,

                genero: (jogo.genres || [])
                    .map(g => g.name)
                    .join(", "),

                desenvolvedores: (jogo.developers || [])
                    .map(d => d.name),

                publicadoras: (jogo.publishers || [])
                    .map(p => p.name),

                lancamento: jogo.released || null,

                origem: "oficial",

                fonte: "RAWG",

                fonte_url: linkRawg(jogo)

            }

        });

    } catch (erro) {

        tratarErroIntegracaoOficial(res, erro);
    }
});

// ==========================================
// BREAK SCORE - JOGOS OFICIAIS
// ==========================================

// VALIDAR ID DO JOGO

function validarIdJogoOficial(valor) {
    const id = Number(valor);

    return Number.isSafeInteger(id) && id > 0
        ? id
        : null;
}


 // ==========================================
 // BREAK TEC > INTEGRAÇÃO RAWG + IGDB
 // ==========================================

 // Identifica a fonte internamente
 // A interface continua mostrando JOGO OFICIAL

 function fonteOficialDaRequisicao(req) {
     return req.query.fonte === "igdb"
         ? "IGDB"
         : "RAWG";
 }

 function colunaIdOficial(req) {
     return fonteOficialDaRequisicao(req) === "IGDB"
         ? "igdb_id"
         : "rawg_id";
 }


 // BUSCAR DETALHES DE UM JOGO NA IGDB

 async function obterJogoIGDBPadronizado(id) {

     const resultados = await consultarIGDB(`
         fields id,name,slug,summary,storyline,
                cover.image_id,artworks.image_id,
                genres.name,first_release_date,
                involved_companies.company.name,
                involved_companies.developer,
                involved_companies.publisher;

         where id = ${id};
         limit 1;
     `);

     const jogo = resultados[0];

     if (!jogo || jogo.id !== id || !jogo.name) {
         const erro = new Error(
             "Jogo não encontrado na IGDB."
         );
         erro.status = 404;
         throw erro;
     }

     const empresas = jogo.involved_companies || [];

     return {
         id_externo: id,
         titulo: jogo.name,

         descricao:
             jogo.summary ||
             jogo.storyline ||
             "Descrição não disponível.",

         imagem:
             imagemIGDB(jogo.cover?.image_id, "cover_big") ||
             imagemIGDB(
                 jogo.artworks?.[0]?.image_id,
                 "screenshot_big"
             ),

         genero: (jogo.genres || [])
             .map(g => g.name)
             .join(", "),

         desenvolvedores: empresas
             .filter(e => e.developer)
             .map(e => e.company?.name)
             .filter(Boolean),

         publicadoras: empresas
             .filter(e => e.publisher)
             .map(e => e.company?.name)
             .filter(Boolean),

         lancamento: jogo.first_release_date
             ? new Date(jogo.first_release_date * 1000)
                 .toISOString()
                 .slice(0, 10)
             : null,

         origem: "oficial",
         fonte: "IGDB",

         fonte_url: jogo.slug
             ? `https://www.igdb.com/games/${encodeURIComponent(jogo.slug)}`
             : "https://www.igdb.com/"
     };
 }


 // SALVAR JOGO OFICIAL NO MYSQL  //
 // FUNCIONA COM RAWG OU IGDB //

 async function registrarJogoOficial(fonte, id) {

     let jogo;

     if (fonte === "IGDB") {

         jogo = await obterJogoIGDBPadronizado(id);

     } else {

         const bruto = await consultarRawg(
             `games/${id}`
         );

         if (!bruto || bruto.id !== id || !bruto.name) {
             const erro = new Error(
                 "Não foi possível validar o jogo."
             );
             erro.status = 502;
             throw erro;
         }

         jogo = {
             titulo: bruto.name,
             imagem: bruto.background_image || null,

             genero: (bruto.genres || [])
                 .map(g => g.name)
                 .join(", "),

             desenvolvedores: (bruto.developers || [])
                 .map(d => d.name),

             fonte_url: linkRawg(bruto)
         };
     }

     const banco = conexao.promise();

     await banco.query(`
         INSERT INTO jogos_oficiais (
             rawg_id,
             igdb_id,
             titulo,
             imagem,
             desenvolvedor,
             genero,
             fonte_url
         )
         VALUES (?, ?, ?, ?, ?, ?, ?)

         ON DUPLICATE KEY UPDATE
             titulo = VALUES(titulo),
             imagem = VALUES(imagem),
             desenvolvedor = VALUES(desenvolvedor),
             genero = VALUES(genero),
             fonte_url = VALUES(fonte_url)
     `, [
         fonte === "RAWG" ? id : null,
         fonte === "IGDB" ? id : null,

         jogo.titulo.slice(0, 200),

         jogo.imagem?.slice(0, 500) || null,

         (jogo.desenvolvedores || [])
             .join(", ")
             .slice(0, 255),

         (jogo.genero || "").slice(0, 255),

         jogo.fonte_url?.slice(0, 500) || null
     ]);

     const coluna = fonte === "IGDB"
         ? "igdb_id"
         : "rawg_id";

     const [registros] = await banco.query(`
         SELECT id
         FROM jogos_oficiais
         WHERE ${coluna} = ?
         LIMIT 1
     `, [id]);

     if (!registros.length) {
         throw new Error(
             "Não foi possível localizar o jogo no banco."
         );
     }

     return registros[0].id;
 }


 // TRATAR ERROS DAS DUAS FONTES

 function tratarErroIntegracaoOficial(res, erro) {

     if (erro.statusRawg || erro.statusLocal) {
         return tratarErroRawg(res, erro);
     }

     if (erro.status || erro.name === "TimeoutError") {
         return erroConsultaIGDB(res, erro);
     }

     console.error(
         "Erro ao processar jogo oficial:",
         erro
     );

     return res.status(500).json({
         mensagem: "Erro ao processar jogo oficial."
     });
 }


// ==========================================
// SALVAR OU ATUALIZAR AVALIAÇÃO
// ==========================================

app.post("/api/jogos-oficiais/:id/avaliacoes", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Faça login para avaliar este jogo."
        });
    }

    const rawgId = validarIdJogoOficial(req.params.id);

    if (!rawgId) {
        return res.status(400).json({
            mensagem: "ID do jogo inválido."
        });
    }

    const comentarioRecebido = req.body?.comentario;

if (
    comentarioRecebido !== undefined &&
    typeof comentarioRecebido !== "string"
) {
    return res.status(400).json({
        mensagem: "Comentário inválido."
    });
}

const comentario =
    typeof comentarioRecebido === "string"
        ? comentarioRecebido.trim()
        : null;

if (comentario && comentario.length > 1000) {
    return res.status(400).json({
        mensagem: "O comentário deve ter até 1000 caracteres."
    });
}

    const categorias = [
        "jogabilidade",
        "historia",
        "visual",
        "som",
        "originalidade"
    ];

    const notas = categorias.map(
        categoria => Number(req.body[categoria])
    );

    const notasValidas = notas.every(
        nota => Number.isInteger(nota) &&
                nota >= 1 &&
                nota <= 5
    );

    if (!notasValidas) {
        return res.status(400).json({
            mensagem: "Avalie todas as categorias de 1 a 5."
        });
    }

    // MÉDIA DAS CINCO CATEGORIAS

    const notaGeral = Number(
        (
            notas.reduce((soma, nota) => soma + nota, 0)
            / notas.length
        ).toFixed(2)
    );


    
 // REGISTRA O JOGO OFICIAL NO MYSQL
 // INDEPENDENTEMENTE DA API UTILIZADA

 try {

     const banco = conexao.promise();

     const jogoOficialId = await registrarJogoOficial(
         fonteOficialDaRequisicao(req),
         rawgId
     );



        // SALVA OU ATUALIZA A AVALIAÇÃO

await banco.query(`
    INSERT INTO avaliacoes_oficiais
    (
        usuario_id,
        jogo_oficial_id,
        nota,
        jogabilidade,
        historia,
        visual,
        som,
        originalidade,
        comentario
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON DUPLICATE KEY UPDATE
        nota = VALUES(nota),
        jogabilidade = VALUES(jogabilidade),
        historia = VALUES(historia),
        visual = VALUES(visual),
        som = VALUES(som),
        originalidade = VALUES(originalidade),
        comentario = COALESCE(VALUES(comentario), comentario)
`, [
    req.session.usuario.id,
    jogoOficialId,
    notaGeral,
    ...notas,
    comentario
]);

        res.json({
            mensagem: "Avaliação salva com sucesso!",
            nota: notaGeral,
            breakScore: Number((notaGeral * 2).toFixed(1))
        });

    } catch (erro) {


        if (erro.statusRawg || erro.statusLocal || erro.status) {
        return tratarErroIntegracaoOficial(res, erro);
    }

        console.error(
            "Erro ao salvar avaliação oficial:",
            erro
        );

        res.status(500).json({
            mensagem: "Não foi possível salvar a avaliação."
        });
    }
});


// ==========================================
// CONSULTAR BREAK SCORE DO JOGO
// ==========================================

app.get("/api/jogos-oficiais/:id/dna", async (req, res) => {

    const rawgId = validarIdJogoOficial(req.params.id);

    if (!rawgId) {
        return res.status(400).json({
            mensagem: "ID inválido."
        });
    }

    try {

        const [resultados] = await conexao.promise().query(`
            SELECT
                COUNT(a.id) AS total_avaliacoes,

                ROUND(AVG(a.jogabilidade), 1) AS jogabilidade,
                ROUND(AVG(a.historia), 1) AS historia,
                ROUND(AVG(a.visual), 1) AS visual,
                ROUND(AVG(a.som), 1) AS som,
                ROUND(AVG(a.originalidade), 1) AS originalidade,

                ROUND(AVG(a.nota) * 2, 1) AS break_score

            FROM jogos_oficiais j

            LEFT JOIN avaliacoes_oficiais a
                ON a.jogo_oficial_id = j.id

            WHERE j.${colunaIdOficial(req)} = ?
        `, [rawgId]);

        const dna = resultados[0];

        res.json({
            totalAvaliacoes: Number(dna.total_avaliacoes),
            jogabilidade: Number(dna.jogabilidade) || 0,
            historia: Number(dna.historia) || 0,
            visual: Number(dna.visual) || 0,
            som: Number(dna.som) || 0,
            originalidade: Number(dna.originalidade) || 0,
            breakScore: Number(dna.break_score) || 0
        });

    } catch (erro) {

        console.error("Erro no Break Score oficial:", erro);

        res.status(500).json({
            mensagem: "Erro ao carregar o Break Score."
        });
    }
});


// ==========================================
// CONSULTAR MINHA AVALIAÇÃO
// ==========================================

app.get(
    "/api/jogos-oficiais/:id/minha-avaliacao",
    async (req, res) => {

        if (!req.session.usuario) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado."
            });
        }

        const rawgId =
            validarIdJogoOficial(req.params.id);

        if (!rawgId) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        try {

            const [resultados] = await conexao.promise().query(`
                SELECT
        a.jogabilidade,
        a.historia,
        a.visual,
        a.som,
        a.originalidade,
        a.comentario

    FROM avaliacoes_oficiais a

    INNER JOIN jogos_oficiais j
    ON j.id = a.jogo_oficial_id

    WHERE j.${colunaIdOficial(req)} = ?
    AND a.usuario_id = ?

    LIMIT 1
            `, [
                rawgId,
                req.session.usuario.id
            ]);

            if (resultados.length === 0) {
                return res.json({
                    avaliou: false
                });
            }

            res.json({
                avaliou: true,
                avaliacao: resultados[0]
            });

        } catch (erro) {

            console.error(
                "Erro ao buscar avaliação do usuário:",
                erro
            );

            res.status(500).json({
                mensagem: "Erro ao consultar sua avaliação."
            });
        }
    }
);


// ==========================================
// JOGOS OFICIAIS EM DESTAQUE - HOME
// ==========================================

app.get("/api/destaques-oficiais", async (req, res) => {

    try {

        // BUSCA OS JOGOS POPULARES NA RAWG

        const dados = await consultarRawg("games", {
            ordering: "-added",
            page_size: 3,
            page: 1
        });

        const lista = (
            Array.isArray(dados.results)
                ? dados.results
                : []
        ).filter(jogo =>
            Number.isSafeInteger(jogo.id) &&
            jogo.id > 0
        ).slice(0, 3);


        // OBTÉM OS DESENVOLVEDORES DE CADA JOGO

        const jogos = await Promise.all(
            lista.map(async jogo => {

                let desenvolvedor =
                    "Desenvolvedor não informado";

                try {

                    const detalhes = await consultarRawg(
                        `games/${jogo.id}`
                    );

                    const nomes = (detalhes.developers || [])
                        .map(dev => dev.name);

                    if (nomes.length > 0) {
                        desenvolvedor = nomes.join(", ");
                    }

                } catch (erro) {

                    console.warn(
                        "Não foi possível obter o desenvolvedor:",
                        jogo.id
                    );

                }

                return {
                    id_externo: jogo.id,
                    titulo: jogo.name,
                    imagem: jogo.background_image || null,

                    genero: (jogo.genres || [])
                        .map(g => g.name)
                        .join(", "),

                    desenvolvedor,

                    origem: "oficial",
                    fonte: "RAWG",

                    total_avaliacoes: 0,
                    break_score: null
                };

            })
        );


        // CONSULTA AS AVALIAÇÕES DA BREAK TEC

        if (jogos.length > 0) {

            const ids = jogos.map(
                jogo => jogo.id_externo
            );

            const marcadores = ids
                .map(() => "?")
                .join(", ");


            try {

                const [resultados] =
                    await conexao.promise().query(`

                        SELECT
                            j.rawg_id,

                            COUNT(a.id) AS total_avaliacoes,

                            ROUND(
                                AVG(a.nota) * 2,
                                1
                            ) AS break_score

                        FROM jogos_oficiais j

                        LEFT JOIN avaliacoes_oficiais a
                            ON a.jogo_oficial_id = j.id

                        WHERE j.rawg_id IN (${marcadores})

                        GROUP BY j.rawg_id

                    `, ids);


                const avaliacoesPorJogo = new Map(
                    resultados.map(resultado => [
                        Number(resultado.rawg_id),
                        resultado
                    ])
                );


                jogos.forEach(jogo => {

                    const avaliacao =
                        avaliacoesPorJogo.get(jogo.id_externo);

                    if (avaliacao) {

                        jogo.total_avaliacoes =
                            Number(avaliacao.total_avaliacoes);

                        jogo.break_score =
                            avaliacao.break_score === null
                                ? null
                                : Number(avaliacao.break_score);

                    }

                });

            } catch (erro) {

                console.error(
                    "Erro ao consultar avaliações dos destaques:",
                    erro
                );

            }

        }


        res.json({ jogos });


    } catch (erro) {

        tratarErroRawg(res, erro);

    }

});


// ==========================================
// FAVORITOS - JOGOS OFICIAIS
// ==========================================


// ==========================================
// ADICIONAR JOGO OFICIAL AOS FAVORITOS
// ==========================================

app.post("/api/jogos-oficiais/:id/favoritos", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Faça login para favoritar este jogo."
        });
    }

    const rawgId = Number(req.params.id);
    const usuarioId = req.session.usuario.id;

    if (!Number.isSafeInteger(rawgId) || rawgId <= 0) {
        return res.status(400).json({
            mensagem: "ID do jogo inválido."
        });
    }

    try {

        const banco = conexao.promise();

        // VERIFICAR SE JÁ ESTÁ NOS FAVORITOS

        const [favoritosExistentes] = await banco.query(`
            SELECT f.id
            FROM favoritos_oficiais f

            INNER JOIN jogos_oficiais j
                ON j.id = f.jogo_oficial_id

            WHERE f.usuario_id = ?
            AND j.${colunaIdOficial(req)} = ?
            LIMIT 1
        `, [usuarioId, rawgId]);

        if (favoritosExistentes.length > 0) {
            return res.json({
                mensagem: "Este jogo já está nos favoritos.",
                favoritado: true
            });
        }


       
 // ==========================================
 // REGISTRAR JOGO OFICIAL - RAWG OU IGDB
 // ==========================================

    const jogoOficialId = await registrarJogoOficial(
         fonteOficialDaRequisicao(req),
         rawgId
    );


 // ==========================================
 // ADICIONAR JOGO AOS FAVORITOS
 // ==========================================

    const [resultado] = await banco.query(`
        INSERT IGNORE INTO favoritos_oficiais
            (usuario_id, jogo_oficial_id)

        VALUES (?, ?)
    `, [
         usuarioId,
        jogoOficialId
    ]);


 // CONFIRMAR SE O FAVORITO FOI SALVO //

 const [confirmacaoFavorito] = await banco.query(`
     SELECT f.id
     FROM favoritos_oficiais f

     INNER JOIN jogos_oficiais j
         ON j.id = f.jogo_oficial_id

     WHERE f.usuario_id = ?
     AND j.${colunaIdOficial(req)} = ?

     LIMIT 1
 `, [
     usuarioId,
     rawgId
 ]);

 if (confirmacaoFavorito.length === 0) {

     console.error(
         "Favorito não encontrado após o salvamento:",
         {
             fonte: fonteOficialDaRequisicao(req),
             idExterno: rawgId,
             usuarioId
         }
     );

     return res.status(500).json({
         mensagem:
             "O favorito não foi registrado corretamente no banco.",
         favoritado: false
     });
 }


        res.status(resultado.affectedRows > 0 ? 201 : 200).json({
            mensagem: resultado.affectedRows > 0
                ? "Jogo adicionado aos favoritos!"
                : "Este jogo já está nos favoritos.",
            favoritado: true
        });

    } catch (erro) {

        if (erro.statusRawg || erro.statusLocal || erro.status) {
            return tratarErroIntegracaoOficial(res, erro);
        }
        console.error(
            "Erro ao favoritar jogo oficial:",
            erro
        );

        res.status(500).json({
            mensagem: "Não foi possível adicionar o favorito."
        });
    }
});


// ==========================================
// VERIFICAR SE O JOGO ESTÁ FAVORITADO
// ==========================================

app.get("/api/jogos-oficiais/:id/favoritos/status", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const rawgId = Number(req.params.id);

    if (!Number.isSafeInteger(rawgId) || rawgId <= 0) {
        return res.status(400).json({
            mensagem: "ID inválido."
        });
    }

    try {

        const [resultados] = await conexao.promise().query(`
            SELECT f.id

            FROM favoritos_oficiais f

            INNER JOIN jogos_oficiais j
                ON j.id = f.jogo_oficial_id

            WHERE f.usuario_id = ?
            AND j.${colunaIdOficial(req)} = ?

            LIMIT 1
        `, [
            req.session.usuario.id,
            rawgId
        ]);

        res.json({
            favoritado: resultados.length > 0
        });

    } catch (erro) {

        console.error(
            "Erro ao verificar favorito oficial:",
            erro
        );

        res.status(500).json({
            mensagem: "Erro ao verificar favorito."
        });
    }
});


// ==========================================
// REMOVER JOGO OFICIAL DOS FAVORITOS
// ==========================================

app.delete("/api/jogos-oficiais/:id/favoritos", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const rawgId = Number(req.params.id);

    if (!Number.isSafeInteger(rawgId) || rawgId <= 0) {
        return res.status(400).json({
            mensagem: "ID inválido."
        });
    }

    try {

        const [resultado] = await conexao.promise().query(`
            DELETE f

            FROM favoritos_oficiais f

            INNER JOIN jogos_oficiais j
                ON j.id = f.jogo_oficial_id

            WHERE f.usuario_id = ?
            AND j.${colunaIdOficial(req)} = ?
        `, [
            req.session.usuario.id,
            rawgId
        ]);

        res.json({
            mensagem: resultado.affectedRows > 0
                ? "Jogo removido dos favoritos."
                : "Este jogo não estava nos favoritos.",

            favoritado: false
        });

    } catch (erro) {

        console.error(
            "Erro ao remover favorito oficial:",
            erro
        );

        res.status(500).json({
            mensagem: "Não foi possível remover o favorito."
        });
    }
});


// ==========================================
// LISTAR FAVORITOS OFICIAIS DO USUÁRIO
// ==========================================

app.get("/api/meus-favoritos-oficiais", async (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });

    }

    const usuarioId = req.session.usuario.id;

    try {

        const [resultados] = await conexao.promise().query(`

            
    SELECT
         j.id,

        COALESCE(j.rawg_id, j.igdb_id) AS id_externo,

        CASE
            WHEN j.igdb_id IS NOT NULL
                AND j.rawg_id IS NULL
            THEN 'IGDB'
            ELSE 'RAWG'
        END AS fonte,

        j.titulo,
        j.imagem,
        j.desenvolvedor,
        j.genero,

        'oficial' AS origem

            FROM favoritos_oficiais f

            INNER JOIN jogos_oficiais j
                ON j.id = f.jogo_oficial_id

            WHERE f.usuario_id = ?

            ORDER BY f.id DESC

        `, [usuarioId]);

        res.json(resultados);

    } catch (erro) {

        console.error(
            "Erro ao carregar favoritos oficiais:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Não foi possível carregar os favoritos oficiais."
        });

    }

});


// ==========================================
// CATÁLOGO DE JOGOS OFICIAIS - BREAK TEC
// ==========================================

app.get("/api/catalogo/oficiais", async (req, res) => {

    // =====================================
    // PARÂMETROS DO CATÁLOGO
    // =====================================

    const pagina = Number(req.query.pagina || 1);

    const genero = String(
        req.query.genero || "todos"
    );

    const ordenacao = String(
        req.query.ordenacao || "popularidade"
    );

    const busca = String(
        req.query.busca || ""
    ).trim();


    // VALIDAR PÁGINA

    if (
        !Number.isSafeInteger(pagina) ||
        pagina < 1 ||
        pagina > 1000
    ) {
        return res.status(400).json({
            mensagem: "Página inválida."
        });
    }


    // VALIDAR PESQUISA

    if (busca.length > 80) {
        return res.status(400).json({
            mensagem: "Pesquisa muito longa."
        });
    }


    // GÊNEROS PERMITIDOS

    const generosPermitidos = [
        "todos",
        "action",
        "adventure",
        "role-playing-games-rpg",
        "shooter",
        "strategy",
        "simulation",
        "puzzle",
        "platformer",
        "racing"
    ];

    if (!generosPermitidos.includes(genero)) {
        return res.status(400).json({
            mensagem: "Gênero inválido."
        });
    }


    // ORDENAÇÃO DA RAWG

    const ordenacoes = {
        popularidade: "-added",
        recentes: "-released",
        avaliacao: "-rating",
        nome: "name"
    };

    if (!Object.hasOwn(ordenacoes, ordenacao)) {
        return res.status(400).json({
            mensagem: "Ordenação inválida."
        });
    }


    // =====================================
    // MONTAR PARÂMETROS DA RAWG
    // =====================================

    const parametros = {
        page: pagina,
        page_size: 12,
        ordering: ordenacoes[ordenacao]
    };

    if (genero !== "todos") {
        parametros.genres = genero;
    }

    if (busca.length > 0) {
        parametros.search = busca;
    }


    try {

        // CONSULTAR A API

        const dados = await consultarRawg(
            "games",
            parametros
        );


        // =====================================
        // ORGANIZAR OS JOGOS
        // =====================================

        const jogos = (
            Array.isArray(dados.results)
                ? dados.results
                : []
        ).map(jogo => ({

            id_externo: jogo.id,

            titulo: jogo.name,

            imagem: jogo.background_image || null,

            genero: (jogo.genres || [])
                .map(g => g.name)
                .join(", "),

            lancamento: jogo.released || null,

            desenvolvedor: null,

            descricao: null,

            origem: "oficial",

            fonte: "RAWG",

            fonte_url: linkRawg(jogo),

            total_avaliacoes: 0,

            break_score: null
        }));


        // =====================================
        // CONSULTAR DADOS DA BREAK TEC
        // =====================================

        const ids = jogos
            .map(jogo => Number(jogo.id_externo))
            .filter(id =>
                Number.isSafeInteger(id) && id > 0
            );

        if (ids.length > 0) {

            const marcadores = ids
                .map(() => "?")
                .join(", ");


            try {

                const [resultados] =
                    await conexao.promise().query(`

                        SELECT
                            j.rawg_id,
                            j.desenvolvedor,

                            COUNT(a.id) AS total_avaliacoes,

                            ROUND(
                                AVG(a.nota) * 2,
                                1
                            ) AS break_score

                        FROM jogos_oficiais j

                        LEFT JOIN avaliacoes_oficiais a
                            ON a.jogo_oficial_id = j.id

                        WHERE j.rawg_id IN (${marcadores})

                        GROUP BY
                            j.rawg_id,
                            j.desenvolvedor

                    `, ids);


                const informacoes = new Map(
                    resultados.map(item => [
                        Number(item.rawg_id),
                        item
                    ])
                );


                // COMPLETAR DADOS DOS JOGOS

                jogos.forEach(jogo => {

                    const registro =
                        informacoes.get(
                            Number(jogo.id_externo)
                        );

                    if (!registro) return;

                    jogo.desenvolvedor =
                        registro.desenvolvedor || null;

                    jogo.total_avaliacoes =
                        Number(
                            registro.total_avaliacoes
                        ) || 0;

                    jogo.break_score =
                        registro.break_score === null
                            ? null
                            : Number(registro.break_score);
                });


            } catch (erro) {

                console.error(
                    "Erro ao consultar notas do catálogo:",
                    erro
                );

                // A lista da RAWG continua disponível.

            }
        }


        // =====================================
        // INFORMAÇÕES DE PAGINAÇÃO
        // =====================================

        const total = Number(dados.count) || 0;

        const totalPaginas = Math.ceil(total / 12);


        res.json({

            jogos,

            pagina,

            total,

            totalPaginas,

            temProxima: Boolean(dados.next),

            temAnterior: Boolean(dados.previous),

            genero,

            ordenacao,

            fonteOrdenacao: "RAWG"

        });


    } catch (erro) {

        console.error("ERRO NO CATÁLOGO DE EMERGÊNCIA:");
        console.error("Código:", erro.code || "Sem código");
        console.error("Mensagem:", erro.message);
        console.error("Detalhes:", erro.stack);

        tratarErroRawg(res, erro);

    }

});



// ==========================================
// BREAK TEC - PERFIS PÚBLICOS
// ==========================================

// LISTAR MEMBROS QUE AUTORIZARAM
// APARECER NA COMUNIDADE

app.get("/api/usuarios/publicos", async (req, res) => {

    const busca =
        typeof req.query.busca === "string"
            ? req.query.busca.trim()
            : "";

    const pagina = Number(req.query.pagina || 1);

    const limite = 12;

    if (busca.length > 60) {
        return res.status(400).json({
            mensagem: "Pesquisa muito longa."
        });
    }

    if (
        !Number.isSafeInteger(pagina) ||
        pagina < 1 ||
        pagina > 1000
    ) {
        return res.status(400).json({
            mensagem: "Página inválida."
        });
    }

    const inicio = (pagina - 1) * limite;

    const termoBusca = `%${busca}%`;

    try {

        const banco = conexao.promise();

        // CONTAR PERFIS PÚBLICOS

        const [totais] = await banco.execute(`
            SELECT COUNT(*) AS total
            FROM usuarios
            WHERE perfil_publico = 1
            AND nome LIKE ?
        `, [termoBusca]);


        // BUSCAR PERFIS E ESTATÍSTICAS

        

const [usuarios] = await banco.query(`

    SELECT
        u.id,
        u.nome,
        u.biografia,

        (
            SELECT COUNT(*)
            FROM projetos p
            WHERE p.usuario_id = u.id
        ) AS total_projetos,

        (
            (
                SELECT COUNT(*)
                FROM avaliacoes a
                WHERE a.usuario_id = u.id
            )
            +
            (
                SELECT COUNT(*)
                FROM avaliacoes_oficiais ao
                WHERE ao.usuario_id = u.id
            )
        ) AS total_avaliacoes

    FROM usuarios u

    WHERE u.perfil_publico = 1
      AND u.nome LIKE ?

    ORDER BY u.nome ASC, u.id ASC

    LIMIT ? OFFSET ?

`, [
    termoBusca,
    limite,
    inicio
]);


        const total = Number(totais[0].total);

        res.json({
            usuarios: usuarios.map(usuario => ({
                id: usuario.id,
                nome: usuario.nome,
                biografia: usuario.biografia,
                total_projetos:
                    Number(usuario.total_projetos),
                total_avaliacoes:
                    Number(usuario.total_avaliacoes)
            })),

            total,
            pagina,
            totalPaginas: Math.ceil(total / limite),
            temProxima: pagina * limite < total
        });

    } catch (erro) {

        console.error(
            "Erro ao buscar perfis públicos:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Não foi possível carregar os perfis."
        });

    }

});


// ==========================================
// CONSULTAR MINHA VISIBILIDADE
// ==========================================

app.get("/api/perfil/visibilidade", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    try {

        const [resultados] =
            await conexao.promise().execute(`
                SELECT perfil_publico
                FROM usuarios
                WHERE id = ?
                LIMIT 1
            `, [req.session.usuario.id]);


        if (resultados.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        res.json({
            publico:
                resultados[0].perfil_publico === 1
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            mensagem:
                "Erro ao consultar visibilidade."
        });

    }

});


// ==========================================
// ALTERAR MINHA VISIBILIDADE
// ==========================================

app.put("/api/perfil/visibilidade", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const { publico } = req.body;

    if (typeof publico !== "boolean") {
        return res.status(400).json({
            mensagem:
                "Informe true ou false para a visibilidade."
        });
    }

    try {

        const [resultado] =
            await conexao.promise().execute(`
                UPDATE usuarios
                SET perfil_publico = ?
                WHERE id = ?
            `, [
                publico ? 1 : 0,
                req.session.usuario.id
            ]);


        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }


        res.json({
            mensagem: publico
                ? "Seu perfil agora está público."
                : "Seu perfil agora está privado.",

            publico
        });

    } catch (erro) {

        console.error(
            "Erro ao alterar visibilidade:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Não foi possível alterar a visibilidade."
        });

    }

});



// ==========================================
// BREAK TEC - PERFIL PÚBLICO INDIVIDUAL
// ==========================================

app.get("/api/usuarios/publicos/:id", async (req, res) => {

    const usuarioId = Number(req.params.id);

    // VALIDAR O ID

    if (
        !Number.isSafeInteger(usuarioId) ||
        usuarioId <= 0
    ) {
        return res.status(400).json({
            mensagem: "ID de usuário inválido."
        });
    }

    try {

        const banco = conexao.promise();

        // ==================================
        // BUSCAR SOMENTE PERFIS PÚBLICOS
        // ==================================

        
const [usuarios] = await banco.execute(`

    SELECT
        id,
        nome,
        biografia,
        passport_arquetipo,
        passport_generos,
        passport_plataforma,
        passport_estilo,
        passport_lema

    FROM usuarios

    WHERE id = ?
      AND perfil_publico = 1

    LIMIT 1

`, [usuarioId]);



        // NÃO REVELAR SE UM PERFIL PRIVADO EXISTE

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem:
                    "Perfil não encontrado ou indisponível."
            });
        }


        // ==================================
        // ESTATÍSTICAS COMPLETAS
        // ==================================

        const [estatisticas] = await banco.execute(`
            SELECT

                (
                    SELECT COUNT(*)
                    FROM projetos
                    WHERE usuario_id = ?
                ) AS projetos,

                (
                    SELECT COUNT(*)
                    FROM avaliacoes
                    WHERE usuario_id = ?
                )
                +
                (
                    SELECT COUNT(*)
                    FROM avaliacoes_oficiais
                    WHERE usuario_id = ?
                ) AS avaliacoes

        `, [
            usuarioId,
            usuarioId,
            usuarioId
        ]);


        // ==================================
        // PROJETOS PUBLICADOS
        // ==================================

        const [projetos] = await banco.execute(`
            SELECT
                id,
                titulo,
                descricao,
                categoria,
                imagem,
                criado_em

            FROM projetos

            WHERE usuario_id = ?

            ORDER BY criado_em DESC

            LIMIT 6
        `, [usuarioId]);


        // ==================================
        // AVALIAÇÕES DA COMUNIDADE
        // ==================================

        const [avaliacoesComunidade] =
            await banco.execute(`

                SELECT
                    p.id AS jogo_id,
                    p.titulo,
                    a.nota,
                    a.criado_em

                FROM avaliacoes a

                INNER JOIN projetos p
                    ON p.id = a.projeto_id

                WHERE a.usuario_id = ?

                ORDER BY a.criado_em DESC

                LIMIT 6

            `, [usuarioId]);


        // ==================================
        // AVALIAÇÕES DE JOGOS OFICIAIS
        // ==================================

        const [avaliacoesOficiais] =
            await banco.execute(`

                SELECT
                    COALESCE(j.rawg_id, j.igdb_id) AS jogo_id,
                CASE
                    WHEN j.rawg_id IS NULL THEN 'IGDB'
                    ELSE 'RAWG'
                END AS fonte,
                    j.titulo,
                    a.nota,
                    a.criado_em

                FROM avaliacoes_oficiais a

                INNER JOIN jogos_oficiais j
                    ON j.id = a.jogo_oficial_id

                WHERE a.usuario_id = ?

                ORDER BY a.criado_em DESC

                LIMIT 6

            `, [usuarioId]);


        // ==================================
        // ORGANIZAR AS AVALIAÇÕES
        // ==================================

        const avaliacoes = [

            ...avaliacoesComunidade.map(item => ({

                jogo_id: item.jogo_id,
                titulo: item.titulo,
                origem: "comunidade",
                nota: Number(item.nota),
                criado_em: item.criado_em

            })),

            
            ...avaliacoesOficiais.map(item => ({
                jogo_id: item.jogo_id,
                titulo: item.titulo,
                origem: "oficial",
                fonte: item.fonte,
                nota: Number(item.nota),
                criado_em: item.criado_em
            }))
        ];

        // ORDENAR AS MAIS RECENTES PRIMEIRO

        avaliacoes.sort((a, b) =>
            new Date(b.criado_em) -
            new Date(a.criado_em)
        );

        
// ==========================================
// GAME VAULT DO PERFIL PÚBLICO
// ==========================================

    const [jogosVault] = await banco.execute(`
        SELECT
            slot,
            rawg_id,
            titulo,
            imagem

        FROM game_vault

        WHERE usuario_id = ?

    `, [usuarioId]);


// ORGANIZAR OS TRÊS ESPAÇOS

    const gameVaultPublico = {
        favorito: null,
        jogando: null,
        quero_jogar: null
    };


    jogosVault.forEach(jogo => {

        if (
            Object.prototype.hasOwnProperty.call(
                gameVaultPublico,
                jogo.slot
            )
        ) {

            gameVaultPublico[jogo.slot] = {
                id_externo: jogo.rawg_id,
                titulo: jogo.titulo,
                imagem: jogo.imagem
            };

        }

    });


        // ==================================
        // RESPOSTA PÚBLICA
        // ==================================

        res.json({

            usuario: {
                id: usuarios[0].id,
                nome: usuarios[0].nome,
                biografia: usuarios[0].biografia
            },
            
            
            passport: {
                arquetipo: usuarios[0].passport_arquetipo || "",
                generos: usuarios[0].passport_generos || "",
                plataforma: usuarios[0].passport_plataforma || "",
                estilo: usuarios[0].passport_estilo || "",
                lema: usuarios[0].passport_lema || ""
            },


            estatisticas: {
                projetos:
                    Number(estatisticas[0].projetos),

                avaliacoes:
                    Number(estatisticas[0].avaliacoes)
            },

            projetos,

            avaliacoes: avaliacoes.slice(0, 6),

            gameVault: gameVaultPublico

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar perfil público:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Não foi possível carregar o perfil."
        });

    }

});



// ==========================================
// BREAK TEC - BIOGRAFIA DO USUÁRIO
// ==========================================

// ==========================================
// CONSULTAR MINHA BIOGRAFIA
// ==========================================

app.get("/api/perfil/biografia", async (req, res) => {

    // VERIFICAR SESSÃO

    if (!req.session.usuario) {

        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });

    }

    try {

        const usuarioId = req.session.usuario.id;

        const [usuarios] = await conexao.promise().execute(`

            SELECT biografia

            FROM usuarios

            WHERE id = ?

            LIMIT 1

        `, [usuarioId]);


        if (usuarios.length === 0) {

            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });

        }


        res.json({

            biografia: usuarios[0].biografia || ""

        });


    } catch (erro) {

        console.error(
            "Erro ao consultar biografia:",
            erro
        );

        res.status(500).json({
            mensagem: "Erro ao carregar biografia."
        });

    }

});

// ==========================================
// SALVAR MINHA BIOGRAFIA
// ==========================================

app.put("/api/perfil/biografia", async (req, res) => {

    // VERIFICAR SESSÃO

    if (!req.session.usuario) {

        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });

    }


    // VALIDAR O CONTEÚDO RECEBIDO

    const { biografia } = req.body || {};

    if (typeof biografia !== "string") {

        return res.status(400).json({
            mensagem: "Biografia inválida."
        });

    }


    const texto = biografia.trim();


    // LIMITE DO CAMPO NO MYSQL

    if (texto.length > 280) {

        return res.status(400).json({
            mensagem:
                "A biografia deve ter no máximo 280 caracteres."
        });

    }


    try {

        // O ID VEM DA SESSÃO, NÃO DO FORMULÁRIO

        const usuarioId = req.session.usuario.id;


        const [resultado] = await conexao.promise().execute(`

            UPDATE usuarios

            SET biografia = ?

            WHERE id = ?

        `, [

            texto || null,

            usuarioId

        ]);


        if (resultado.affectedRows === 0) {

            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });

        }


        res.json({

            mensagem: "Biografia atualizada com sucesso!",

            biografia: texto

        });


    } catch (erro) {

        console.error(
            "Erro ao atualizar biografia:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Não foi possível salvar a biografia."
        });

    }

});



// ==========================================
// BREAK TEC - GAMER PASSPORT
// ==========================================

// CONSULTAR MEU GAMER PASSPORT

app.get("/api/perfil/passport", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    try {

        const usuarioId = req.session.usuario.id;

        const [usuarios] = await conexao.promise().execute(`
            SELECT
                passport_arquetipo,
                passport_generos,
                passport_plataforma,
                passport_estilo,
                passport_lema
            FROM usuarios
            WHERE id = ?
            LIMIT 1
        `, [usuarioId]);

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const usuario = usuarios[0];

        res.json({
            arquetipo: usuario.passport_arquetipo || "",
            generos: usuario.passport_generos || "",
            plataforma: usuario.passport_plataforma || "",
            estilo: usuario.passport_estilo || "",
            lema: usuario.passport_lema || ""
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar Gamer Passport:",
            erro
        );

        res.status(500).json({
            mensagem: "Erro ao carregar Gamer Passport."
        });

    }

});


// ==========================================
// SALVAR MEU GAMER PASSPORT
// ==========================================

app.put("/api/perfil/passport", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const campos = [
        "arquetipo",
        "generos",
        "plataforma",
        "estilo",
        "lema"
    ];

    const dados = req.body;

    // VERIFICAR O FORMATO DOS DADOS

    if (
        !dados ||
        typeof dados !== "object" ||
        campos.some(campo => typeof dados[campo] !== "string")
    ) {
        return res.status(400).json({
            mensagem: "Dados do Gamer Passport inválidos."
        });
    }

    const passport = {
        arquetipo: dados.arquetipo.trim(),
        generos: dados.generos.trim(),
        plataforma: dados.plataforma.trim(),
        estilo: dados.estilo.trim(),
        lema: dados.lema.trim()
    };

    // LIMITES DOS CAMPOS

    const limites = {
        arquetipo: 50,
        generos: 100,
        plataforma: 30,
        estilo: 30,
        lema: 120
    };

    for (const campo of campos) {

        if (passport[campo].length > limites[campo]) {
            return res.status(400).json({
                mensagem:
                    `O campo ${campo} ultrapassou o limite permitido.`
            });
        }

    }

    // VALIDAR OPÇÕES DOS SELECTS

    const plataformasPermitidas = [
        "",
        "PC",
        "PlayStation",
        "Xbox",
        "Nintendo",
        "Mobile",
        "Multiplataforma"
    ];

    const estilosPermitidos = [
        "",
        "Solo",
        "Cooperativo",
        "Competitivo",
        "Casual",
        "Variado"
    ];

    if (
        !plataformasPermitidas.includes(passport.plataforma) ||
        !estilosPermitidos.includes(passport.estilo)
    ) {
        return res.status(400).json({
            mensagem: "Plataforma ou estilo de jogo inválido."
        });
    }

    try {

        const usuarioId = req.session.usuario.id;

        const [resultado] = await conexao.promise().execute(`
            UPDATE usuarios

            SET
                passport_arquetipo = ?,
                passport_generos = ?,
                passport_plataforma = ?,
                passport_estilo = ?,
                passport_lema = ?

            WHERE id = ?
        `, [
            passport.arquetipo,
            passport.generos,
            passport.plataforma,
            passport.estilo,
            passport.lema,
            usuarioId
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        res.json({
            mensagem: "Gamer Passport salvo com sucesso!",
            passport
        });

    } catch (erro) {

        console.error(
            "Erro ao salvar Gamer Passport:",
            erro
        );

        res.status(500).json({
            mensagem: "Não foi possível salvar o Gamer Passport."
        });

    }

});


// ==========================================
// BREAK TEC - GAME VAULT
// ==========================================

const slotsGameVault = [
    "favorito",
    "jogando",
    "quero_jogar"
];


// ==========================================
// CONSULTAR MEU GAME VAULT
// ==========================================

app.get("/api/perfil/game-vault", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    try {

        const usuarioId = req.session.usuario.id;

        const [resultados] = await conexao.promise().execute(`
            SELECT
                slot,
                rawg_id,
                titulo,
                imagem
            FROM game_vault
            WHERE usuario_id = ?
        `, [usuarioId]);

        const vault = {
            favorito: null,
            jogando: null,
            quero_jogar: null
        };

        resultados.forEach(jogo => {

            if (slotsGameVault.includes(jogo.slot)) {

                vault[jogo.slot] = {
                    id_externo: jogo.rawg_id,
                    titulo: jogo.titulo,
                    imagem: jogo.imagem
                };

            }

        });

        res.json({ vault });

    } catch (erro) {

        console.error(
            "Erro ao carregar Game Vault:",
            erro
        );

        res.status(500).json({
            mensagem: "Não foi possível carregar o Game Vault."
        });

    }

});


// ==========================================
// SALVAR OU ALTERAR JOGO DO GAME VAULT
// ==========================================

app.put("/api/perfil/game-vault/:slot", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const slot = req.params.slot;

    if (!slotsGameVault.includes(slot)) {
        return res.status(400).json({
            mensagem: "Espaço do Game Vault inválido."
        });
    }

    const rawgId = validarIdJogoOficial(
        req.body?.rawg_id
    );

    if (!rawgId) {
        return res.status(400).json({
            mensagem: "Selecione um jogo válido."
        });
    }

    // CONSULTAR O JOGO REAL NA RAWG

    let jogo;

    try {

        jogo = await consultarRawg(
            `games/${rawgId}`
        );

    } catch (erro) {

        return tratarErroRawg(res, erro);

    }

    if (
        !jogo ||
        jogo.id !== rawgId ||
        typeof jogo.name !== "string" ||
        !jogo.name.trim()
    ) {
        return res.status(502).json({
            mensagem: "Não foi possível validar esse jogo."
        });
    }

    const titulo = jogo.name.trim().slice(0, 200);

    const imagem =
        typeof jogo.background_image === "string"
            ? jogo.background_image.slice(0, 500)
            : null;

    try {

        const usuarioId = req.session.usuario.id;

        await conexao.promise().execute(`
            INSERT INTO game_vault (
                usuario_id,
                slot,
                rawg_id,
                titulo,
                imagem
            )
            VALUES (?, ?, ?, ?, ?)

            ON DUPLICATE KEY UPDATE
                rawg_id = VALUES(rawg_id),
                titulo = VALUES(titulo),
                imagem = VALUES(imagem)
        `, [
            usuarioId,
            slot,
            rawgId,
            titulo,
            imagem
        ]);

        res.json({
            mensagem: "Jogo salvo no Game Vault!",
            slot,
            jogo: {
                id_externo: rawgId,
                titulo,
                imagem
            }
        });

    } catch (erro) {

        console.error(
            "Erro ao salvar Game Vault:",
            erro
        );

        res.status(500).json({
            mensagem: "Não foi possível salvar o jogo."
        });

    }

});


// ==========================================
// REMOVER JOGO DO GAME VAULT
// ==========================================

app.delete("/api/perfil/game-vault/:slot", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const slot = req.params.slot;

    if (!slotsGameVault.includes(slot)) {
        return res.status(400).json({
            mensagem: "Espaço do Game Vault inválido."
        });
    }

    try {

        const usuarioId = req.session.usuario.id;

        await conexao.promise().execute(`
            DELETE FROM game_vault
            WHERE usuario_id = ?
              AND slot = ?
        `, [usuarioId, slot]);

        res.json({
            mensagem: "Jogo removido do Game Vault.",
            slot
        });

    } catch (erro) {

        console.error(
            "Erro ao remover jogo do Game Vault:",
            erro
        );

        res.status(500).json({
            mensagem: "Não foi possível remover o jogo."
        });

    }

});


// ==========================================
// BREAK TEC - FOTO DE PERFIL
// ==========================================

// CONSULTAR MINHA FOTO

app.get("/api/perfil/foto", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    try {

        const id = req.session.usuario.id;

        const [usuarios] =
            await conexao.promise().execute(
                `SELECT foto_perfil
                 FROM usuarios
                 WHERE id = ?
                 LIMIT 1`,
                [id]
            );

        if (!usuarios.length) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        res.json({
            foto_url: usuarios[0].foto_perfil
                ? `/api/usuarios/${id}/foto`
                : null
        });

    } catch (erro) {

        console.error("Erro ao consultar foto:", erro);

        res.status(500).json({
            mensagem: "Não foi possível carregar a foto."
        });

    }

});


// ==========================================
// ENTREGAR FOTO COM CONTROLE DE PRIVACIDADE
// ==========================================

app.get("/api/usuarios/:id/foto", async (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(404).end();
    }

    try {

        const [usuarios] =
            await conexao.promise().execute(
                `SELECT foto_perfil, perfil_publico
                 FROM usuarios
                 WHERE id = ?
                 LIMIT 1`,
                [id]
            );

        const usuario = usuarios[0];

        const proprio =
            Number(req.session.usuario?.id) === id;

        if (
            !usuario ||
            (!proprio && Number(usuario.perfil_publico) !== 1)
        ) {
            return res.status(404).end();
        }

        const arquivo = usuario.foto_perfil || "";

        if (!/^[a-f0-9-]{36}\.webp$/.test(arquivo)) {
            return res.status(404).end();
        }

        res.set("Cache-Control", "private, no-store");
        res.type("webp");

        res.sendFile(
            path.join(pastaFotos, arquivo),
            erro => {
                if (erro && !res.headersSent) {
                    res.status(404).end();
                }
            }
        );

    } catch (erro) {

        console.error("Erro ao entregar foto:", erro);

        if (!res.headersSent) {
            res.status(500).end();
        }

    }

});


// ==========================================
// ENVIAR OU TROCAR FOTO
// ==========================================

app.post("/api/perfil/foto", (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Faça login para enviar sua foto."
        });
    }

    receberFoto(req, res, async erroUpload => {

        if (erroUpload) {
            return res.status(400).json({
                mensagem:
                    "Selecione uma imagem JPG, PNG ou WebP de até 3 MB."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                mensagem: "Selecione uma imagem."
            });
        }

        let novoCaminho = null;
        let arquivoCriado = false;

        try {

            // VERIFICAR O FORMATO REAL DA IMAGEM

            const metadados = await sharp(
                req.file.buffer,
                { limitInputPixels: 16000000 }
            ).metadata();

            if (
                !["jpeg", "png", "webp"].includes(
                    metadados.format
                )
            ) {
                return res.status(400).json({
                    mensagem:
                        "Formato inválido. Envie JPG, PNG ou WebP."
                });
            }

            // REDIMENSIONAR E CONVERTER

            const imagem = await sharp(
                req.file.buffer,
                { limitInputPixels: 16000000 }
            )
                .rotate()
                .resize(384, 384, {
                    fit: "cover",
                    position: "attention"
                })
                .webp({ quality: 82 })
                .toBuffer();

            const id = req.session.usuario.id;
            const banco = conexao.promise();

            const [usuarios] = await banco.execute(
                `SELECT foto_perfil
                 FROM usuarios
                 WHERE id = ?
                 LIMIT 1`,
                [id]
            );

            if (!usuarios.length) {
                return res.status(404).json({
                    mensagem: "Usuário não encontrado."
                });
            }

            await fs.mkdir(pastaFotos, {
                recursive: true
            });

            const nomeArquivo =
                `${randomUUID()}.webp`;

            novoCaminho =
                path.join(pastaFotos, nomeArquivo);

            await fs.writeFile(
                novoCaminho,
                imagem,
                { flag: "wx" }
            );

            arquivoCriado = true;

            // SALVAR REFERÊNCIA NO MYSQL

            await banco.execute(
                `UPDATE usuarios
                 SET foto_perfil = ?
                 WHERE id = ?`,
                [nomeArquivo, id]
            );

            // REMOVER A FOTO ANTERIOR

            const anterior = usuarios[0].foto_perfil;

            if (
                anterior &&
                /^[a-f0-9-]{36}\.webp$/.test(anterior)
            ) {
                await fs.unlink(
                    path.join(pastaFotos, anterior)
                ).catch(() => {});
            }

            res.json({
                mensagem: "Foto atualizada!",
                foto_url: `/api/usuarios/${id}/foto`
            });

        } catch (erro) {

            if (arquivoCriado) {
                await fs.unlink(novoCaminho)
                    .catch(() => {});
            }

            console.error("Erro ao salvar foto:", erro);

            res.status(500).json({
                mensagem:
                    "Não foi possível salvar a foto."
            });

        }

    });

});


// ==========================================
// REMOVER MINHA FOTO
// ==========================================

app.delete("/api/perfil/foto", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    try {

        const id = req.session.usuario.id;
        const banco = conexao.promise();

        const [usuarios] = await banco.execute(
            `SELECT foto_perfil
             FROM usuarios
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        if (!usuarios.length) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        await banco.execute(
            `UPDATE usuarios
             SET foto_perfil = NULL
             WHERE id = ?`,
            [id]
        );

        const anterior = usuarios[0].foto_perfil;

        if (
            anterior &&
            /^[a-f0-9-]{36}\.webp$/.test(anterior)
        ) {
            await fs.unlink(
                path.join(pastaFotos, anterior)
            ).catch(() => {});
        }

        res.json({
            mensagem: "Foto removida.",
            foto_url: null
        });

    } catch (erro) {

        console.error("Erro ao remover foto:", erro);

        res.status(500).json({
            mensagem: "Não foi possível remover a foto."
        });

    }

});


// ==========================================
// BREAK TEC - CONFIGURAÇÕES PRIVADAS
// ==========================================

// CONSULTAR OS DADOS DA CONTA

app.get("/api/configuracoes", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Faça login para continuar."
        });
    }

    res.set("Cache-Control", "no-store");

    try {

        const [usuarios] =
            await conexao.promise().execute(`
                SELECT
                    nome,
                    email,
                    telefone,
                    telefone_verificado,
                    criado_em
                FROM usuarios
                WHERE id = ?
                LIMIT 1
            `, [req.session.usuario.id]);

        if (!usuarios.length) {
            return res.status(404).json({
                mensagem: "Conta não encontrada."
            });
        }

        const usuario = usuarios[0];

        res.json({
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            telefone_verificado:
                Boolean(usuario.telefone_verificado),
            criado_em: usuario.criado_em
        });

    } catch (erro) {

        console.error(
            "Erro em configurações:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Não foi possível carregar seus dados."
        });

    }

});


// ==========================================
// CADASTRAR OU REMOVER TELEFONE
// ==========================================

app.put("/api/configuracoes/telefone", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Faça login para continuar."
        });
    }

    const { telefone, senhaAtual } =
        req.body || {};

    if (
        typeof telefone !== "string" ||
        typeof senhaAtual !== "string" ||
        !senhaAtual
    ) {
        return res.status(400).json({
            mensagem:
                "Informe o telefone e sua senha atual."
        });
    }

    // ACEITA CELULAR BRASILEIRO COM DDD

    let numeros = telefone.replace(/\D/g, "");

    // REMOVE O CÓDIGO DO BRASIL, SE INFORMADO

    if (
        numeros.startsWith("55") &&
        numeros.length === 13
    ) {
        numeros = numeros.slice(2);
    }

    if (
        numeros &&
        !/^[1-9]{2}9\d{8}$/.test(numeros)
    ) {
        return res.status(400).json({
            mensagem:
                "Informe um celular brasileiro válido com DDD."
        });
    }

    const normalizado =
        numeros ? `+55${numeros}` : null;

    try {

        const banco = conexao.promise();

        const [usuarios] = await banco.execute(
            `SELECT senha
             FROM usuarios
             WHERE id = ?
             LIMIT 1`,
            [req.session.usuario.id]
        );

        if (!usuarios.length) {
            return res.status(404).json({
                mensagem: "Conta não encontrada."
            });
        }

        // CONFIRMAR A IDENTIDADE COM A SENHA

        const senhaCorreta = await bcrypt.compare(
            senhaAtual,
            usuarios[0].senha
        );

        if (!senhaCorreta) {
            return res.status(403).json({
                mensagem: "Senha atual incorreta."
            });
        }

        await banco.execute(`
            UPDATE usuarios
            SET
                telefone = ?,
                telefone_verificado = 0
            WHERE id = ?
        `, [
            normalizado,
            req.session.usuario.id
        ]);

        res.json({
            mensagem: normalizado
                ? "Telefone salvo. Verificação por SMS ainda não disponível."
                : "Telefone removido.",
            telefone: normalizado,
            telefone_verificado: false
        });

    } catch (erro) {

        console.error(
            "Erro ao atualizar telefone:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Não foi possível salvar o telefone."
        });

    }

});


// ==========================================
// ALTERAR SENHA DA CONTA
// ==========================================

app.put("/api/configuracoes/senha", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Faça login para continuar."
        });
    }

    const { senhaAtual, novaSenha } =
        req.body || {};

    if (
        typeof senhaAtual !== "string" ||
        typeof novaSenha !== "string" ||
        novaSenha.length < 10 ||
        Buffer.byteLength(novaSenha, "utf8") > 72
    ) {
        return res.status(400).json({
            mensagem:
                "A nova senha deve ter pelo menos 10 caracteres e no máximo 72 bytes."
        });
    }

    try {

        const banco = conexao.promise();

        const [usuarios] = await banco.execute(
            `SELECT senha
             FROM usuarios
             WHERE id = ?
             LIMIT 1`,
            [req.session.usuario.id]
        );

        if (!usuarios.length) {
            return res.status(404).json({
                mensagem: "Conta não encontrada."
            });
        }

        // VERIFICAR A SENHA ANTIGA

        const senhaCorreta = await bcrypt.compare(
            senhaAtual,
            usuarios[0].senha
        );

        if (!senhaCorreta) {
            return res.status(403).json({
                mensagem: "Senha atual incorreta."
            });
        }

        // IMPEDIR REPETIR A SENHA ANTERIOR

        const mesmaSenha = await bcrypt.compare(
            novaSenha,
            usuarios[0].senha
        );

        if (mesmaSenha) {
            return res.status(400).json({
                mensagem:
                    "Escolha uma senha diferente da atual."
            });
        }

        // GERAR NOVO HASH

        const novoHash =
            await bcrypt.hash(novaSenha, 12);

        await banco.execute(
            `UPDATE usuarios
             SET senha = ?
             WHERE id = ?`,
            [novoHash, req.session.usuario.id]
        );

        // ENCERRAR A SESSÃO ATUAL

        req.session.destroy(erroSessao => {

            if (erroSessao) {

                console.error(
                    "Senha trocada; falha ao encerrar sessão:",
                    erroSessao
                );

                return res.status(500).json({
                    mensagem:
                        "Senha alterada, mas houve erro ao encerrar a sessão. Faça login novamente."
                });
            }

            res.clearCookie("connect.sid", {
                path: "/"
            });

            res.json({
                mensagem:
                    "Senha alterada. Entre novamente com a nova senha.",
                entrarNovamente: true
            });

        });

    } catch (erro) {

        console.error(
            "Erro ao alterar senha:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Não foi possível alterar a senha."
        });

    }

});

// ==========================================
// COMENTÁRIOS DAS AVALIAÇÕES - BREAK TEC
// ==========================================

// Validar o ID recebido pela URL
function validarIdComentario(valor) {
    const id = Number(valor);

    return Number.isSafeInteger(id) && id > 0
        ? id
        : null;
}


// LISTAR COMENTÁRIOS
async function listarComentarios(req, res, tipo) {

    const id = validarIdComentario(req.params.id);

    if (!id) {
        return res.status(400).json({
            mensagem: "ID inválido."
        });
    }

    const sql = tipo === "oficial" ? `
        SELECT
            a.usuario_id AS autor_id,
            u.nome,
            u.perfil_publico,
            a.nota,
            a.comentario,
            a.criado_em
        FROM avaliacoes_oficiais a
        INNER JOIN jogos_oficiais j
            ON j.id = a.jogo_oficial_id
        INNER JOIN usuarios u
            ON u.id = a.usuario_id
        WHERE j.${colunaIdOficial(req)} = ?
          AND a.comentario IS NOT NULL
          AND a.comentario <> ''
        ORDER BY a.criado_em DESC, a.id DESC
        LIMIT 30
    ` : `
        SELECT
            a.usuario_id AS autor_id,
            u.nome,
            u.perfil_publico,
            a.nota,
            a.comentario,
            a.criado_em
        FROM avaliacoes a
        INNER JOIN usuarios u
            ON u.id = a.usuario_id
        WHERE a.projeto_id = ?
          AND a.comentario IS NOT NULL
          AND a.comentario <> ''
        ORDER BY a.criado_em DESC, a.id DESC
        LIMIT 30
    `;

    try {

        const [registros] =
            await conexao.promise().query(sql, [id]);

        const meuId = Number(req.session.usuario?.id);

        const comentarios = registros.map(item => ({
            autor_id: item.autor_id,
            nome: item.nome,
            perfil_publico:
                Number(item.perfil_publico) === 1,
            nota: Number(item.nota),
            comentario: item.comentario,
            criado_em: item.criado_em,
            meu: meuId === Number(item.autor_id)
        }));

        res.set("Cache-Control", "no-store");

        res.json({ comentarios });

    } catch (erro) {

        console.error(
            "Erro ao listar comentários:",
            erro
        );

        res.status(500).json({
            mensagem: "Erro ao carregar comentários."
        });
    }
}


// LISTAR COMENTÁRIOS DE PROJETOS
app.get("/api/projetos/:id/comentarios", (req, res) => {
    listarComentarios(req, res, "projeto");
});


// LISTAR COMENTÁRIOS DE JOGOS OFICIAIS
app.get("/api/jogos-oficiais/:id/comentarios", (req, res) => {
    listarComentarios(req, res, "oficial");
});


// EXCLUIR SOMENTE O PRÓPRIO COMENTÁRIO
async function excluirComentario(req, res, tipo) {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Faça login para continuar."
        });
    }

    const id = validarIdComentario(req.params.id);

    if (!id) {
        return res.status(400).json({
            mensagem: "ID inválido."
        });
    }

    const usuarioId = req.session.usuario.id;

    const sql = tipo === "oficial" ? `
        UPDATE avaliacoes_oficiais a
        INNER JOIN jogos_oficiais j
            ON j.id = a.jogo_oficial_id
        SET a.comentario = NULL
        WHERE j.${colunaIdOficial(req)} = ?
        AND a.usuario_id = ?
        AND a.comentario IS NOT NULL
    ` : `
        UPDATE avaliacoes
        SET comentario = NULL
        WHERE projeto_id = ?
        AND usuario_id = ?
        AND comentario IS NOT NULL
    `;

    try {

        const [resultado] =
            await conexao.promise().query(
                sql,
                [id, usuarioId]
            );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Comentário não encontrado."
            });
        }

        res.json({
            mensagem:
                "Comentário excluído. Sua avaliação foi mantida."
        });

    } catch (erro) {

        console.error(
            "Erro ao excluir comentário:",
            erro
        );

        res.status(500).json({
            mensagem: "Erro ao excluir comentário."
        });
    }
}


// EXCLUIR COMENTÁRIO DE UM PROJETO
app.delete("/api/projetos/:id/comentario", (req, res) => {
    excluirComentario(req, res, "projeto");
});


// EXCLUIR COMENTÁRIO DE UM JOGO OFICIAL
app.delete("/api/jogos-oficiais/:id/comentario", (req, res) => {
    excluirComentario(req, res, "oficial");
});


 // ==========================================
 // BREAK TEC - INTEGRAÇÃO COM IGDB
 // ==========================================

 let tokenIGDB = null;
 let tokenIGDBExpira = 0;


 // OBTER TOKEN AUTOMATICAMENTE PELA TWITCH
 async function obterTokenIGDB() {

     if (tokenIGDB && Date.now() < tokenIGDBExpira) {
         return tokenIGDB;
     }

     const id = process.env.IGDB_CLIENT_ID;
     const segredo = process.env.IGDB_CLIENT_SECRET;

     if (!id || !segredo) {
         const erro = new Error(
             "IGDB_CLIENT_ID ou IGDB_CLIENT_SECRET ausente no .env"
         );
         erro.status = 503;
         throw erro;
     }

     const resposta = await fetch(
         "https://id.twitch.tv/oauth2/token",
         {
             method: "POST",

             headers: {
                 "Content-Type":
                     "application/x-www-form-urlencoded"
             },

             body: new URLSearchParams({
                 client_id: id,
                 client_secret: segredo,
                 grant_type: "client_credentials"
             }),

             signal: AbortSignal.timeout(12000)
         }
     );

     if (!resposta.ok) {
         const erro = new Error(
             `Falha na autenticação Twitch (${resposta.status})`
         );
         erro.status = 502;
         throw erro;
     }

     const dados = await resposta.json();

     tokenIGDB = dados.access_token;

     tokenIGDBExpira = Date.now() +
         Math.max(60, dados.expires_in - 120) * 1000;

     return tokenIGDB;
 }


 // ENVIAR REQUISIÇÕES À IGDB
 async function consultarIGDB(consulta, repeticao = false) {

     const token = await obterTokenIGDB();

     const resposta = await fetch(
         "https://api.igdb.com/v4/games",
         {
             method: "POST",

             headers: {
                 "Client-ID": process.env.IGDB_CLIENT_ID,
                 Authorization: `Bearer ${token}`,
                 "Content-Type": "text/plain",
                 Accept: "application/json"
             },

             body: consulta,

             signal: AbortSignal.timeout(12000)
         }
     );

     // TOKEN EXPIRADO: SOLICITAR OUTRO
     if (resposta.status === 401 && !repeticao) {
         tokenIGDB = null;
         tokenIGDBExpira = 0;
         return consultarIGDB(consulta, true);
     }

     if (!resposta.ok) {
         const erro = new Error(
             `IGDB respondeu com HTTP ${resposta.status}`
         );

         erro.status = resposta.status === 429 ? 503 : 502;
         throw erro;
     }

     return resposta.json();
 }


 // CONSTRUIR URL DA CAPA
 function imagemIGDB(imageId, tamanho = "cover_big") {

     return imageId
         ? `https://images.igdb.com/igdb/image/upload/t_${tamanho}/${imageId}.jpg`
         : null;
 }


 // PADRONIZAR INFORMAÇÕES DO JOGO
 function resumirJogoIGDB(jogo) {

     return {
         id_externo: jogo.id,
         titulo: jogo.name,

         imagem: imagemIGDB(
             jogo.cover?.image_id
         ),

         genero: (jogo.genres || [])
             .map(g => g.name)
             .join(", "),

         lancamento: jogo.first_release_date
             ? new Date(
                 jogo.first_release_date * 1000
               ).toISOString().slice(0, 10)
             : null,

         origem: "oficial",
         fonte: "IGDB",

         fonte_url: jogo.slug
             ? `https://www.igdb.com/games/${encodeURIComponent(jogo.slug)}`
             : "https://www.igdb.com/",

         total_avaliacoes: 0,
         break_score: null
     };
 }


 // TRATAMENTO DE ERROS
 function erroConsultaIGDB(res, erro) {

     console.error("Erro na IGDB:", erro.message);

     res.status(
         erro.status ||
         (erro.name === "TimeoutError" ? 504 : 502)
     ).json({
         mensagem:
             "Não foi possível consultar a IGDB agora."
     });
 }


 // ==========================================
 // PESQUISAR JOGOS NA IGDB
 // ==========================================

 app.get("/api/igdb/buscar", async (req, res) => {

     const busca = typeof req.query.busca === "string"
         ? req.query.busca.trim()
         : "";

     if (busca.length < 2 || busca.length > 80) {
         return res.status(400).json({
             mensagem: "Pesquise de 2 a 80 caracteres."
         });
     }

     const termo = busca
         .replace(/[;{}]/g, " ")
         .replace(/[\\"]/g, "\\$&");

     try {

         const resultados = await consultarIGDB(`
             search "${termo}";
             fields id,name,slug,cover.image_id,
                    genres.name,first_release_date;
             where version_parent = null;
             limit 12;
         `);

         res.json({
             jogos: resultados.map(resumirJogoIGDB),
             fonte: "IGDB"
         });

     } catch (erro) {
         erroConsultaIGDB(res, erro);
     }
 });



// CONSULTAR DETALHES DE UM JOGO DA IGDB
// =======================================

 app.get("/api/igdb/jogos/:id", async (req, res) => {

     const id = Number(req.params.id);

     if (!Number.isSafeInteger(id) || id <= 0) {
         return res.status(400).json({
             mensagem: "ID de jogo inválido."
         });
     }

     try {

         const resultados = await consultarIGDB(`
             fields id,name,slug,summary,storyline,
                    cover.image_id,artworks.image_id,
                    genres.name,
                    involved_companies.company.name,
                    involved_companies.developer,
                    involved_companies.publisher,
                    first_release_date;

             where id = ${id};
             limit 1;
         `);

         if (!resultados.length) {
             return res.status(404).json({
                 mensagem: "Jogo não encontrado na IGDB."
             });
         }

         const jogo = resultados[0];

         const empresas = jogo.involved_companies || [];

         res.json({
             jogo: {
                 ...resumirJogoIGDB(jogo),

                 descricao:
                     jogo.summary ||
                     jogo.storyline ||
                     "Descrição não disponível.",

                 imagem: imagemIGDB(
                     jogo.artworks?.[0]?.image_id,
                     "screenshot_big"
                 ) || imagemIGDB(jogo.cover?.image_id),

                 desenvolvedores: empresas
                     .filter(e => e.developer)
                     .map(e => e.company?.name)
                     .filter(Boolean),

                 publicadoras: empresas
                     .filter(e => e.publisher)
                     .map(e => e.company?.name)
                     .filter(Boolean)
             }
         });

     } catch (erro) {
         erroConsultaIGDB(res, erro);
     }
 });


//========================
//NAO MEXER ESTA PARTE
//========================
app.listen(3000, () => {
    console.log(
        "Servidor rodando em http://localhost:3000"
    );
});