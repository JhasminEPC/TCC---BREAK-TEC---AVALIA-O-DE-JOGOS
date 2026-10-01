require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

console.log("SERVER.JS EXECUTADO:");
console.log(__filename);

const app = express();

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


    const {
        titulo,
        descricao,
        categoria
    } = req.body;


    if (!titulo) {

        return res.status(400).json({
            mensagem: "Informe o título do projeto."
        });

    }


    const usuarioId =
        req.session.usuario.id;


    const sql = `
        INSERT INTO projetos
        (
            titulo,
            descricao,
            categoria,
            usuario_id
        )
        VALUES (?, ?, ?, ?)
    `;


    conexao.query(
        sql,
        [
            titulo,
            descricao || null,
            categoria || null,
            usuarioId
        ],

        (erro, resultado) => {

            if (erro) {

                console.error(
                    "Erro ao criar projeto:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao publicar projeto."
                });

            }


            res.status(201).json({

                mensagem:
                    "Projeto publicado com sucesso!",

                projeto: {
                    id: resultado.insertId,
                    titulo,
                    descricao,
                    categoria
                }

            });

        }
    );

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
            p.criado_em
        FROM favoritos f
        INNER JOIN projetos p
            ON f.projeto_id = p.id
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
        originalidade
    } = req.body;

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
            usuario_id,
            projeto_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE
            nota = VALUES(nota),
            jogabilidade = VALUES(jogabilidade),
            historia = VALUES(historia),
            visual = VALUES(visual),
            som = VALUES(som),
            originalidade = VALUES(originalidade)
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

app.get(
    "/api/projetos/:id/minha-avaliacao",
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
                originalidade
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

//========================
//NAO MEXER ESTA PARTE
//========================
app.listen(3000, () => {
    console.log(
        "Servidor rodando em http://localhost:3000"
    );
});