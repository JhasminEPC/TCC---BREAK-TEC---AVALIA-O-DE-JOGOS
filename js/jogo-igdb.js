
 // ==========================================
 // BREAK TEC - DETALHES DE JOGOS IGDB
 // ==========================================

 const parametros = new URLSearchParams(
     window.location.search
 );

 const id = Number(parametros.get("id"));

 const aviso = document.getElementById("igdbAviso");
 const conteudo = document.getElementById("igdbConteudo");


 async function carregarJogoIGDB() {

     if (!Number.isSafeInteger(id) || id <= 0) {
         aviso.textContent = "ID do jogo inválido.";
         return;
     }

     try {

         const resposta = await fetch(
             `/api/igdb/jogos/${id}`
         );

         const dados = await resposta.json();

         if (!resposta.ok) {
             throw new Error(
                 dados.mensagem ||
                 "Não foi possível carregar o jogo."
             );
         }

         const jogo = dados.jogo;

         document.title =
             `${jogo.titulo} | Break Tec`;

         document.getElementById(
             "igdbTitulo"
         ).textContent = jogo.titulo;

         document.getElementById(
             "igdbDescricao"
         ).textContent = jogo.descricao;

         document.getElementById(
             "igdbGenero"
         ).textContent =
             jogo.genero || "Não informado";

         document.getElementById(
             "igdbDev"
         ).textContent =
             jogo.desenvolvedores.join(", ") ||
             "Não informado";

         document.getElementById(
             "igdbPublisher"
         ).textContent =
             jogo.publicadoras.join(", ") ||
             "Não informado";

         document.getElementById(
             "igdbLancamento"
         ).textContent = jogo.lancamento
             ? new Date(
                 `${jogo.lancamento}T12:00:00`
               ).toLocaleDateString("pt-BR")
             : "Não informado";


         // IMAGEM DO JOGO

         const imagem = document.getElementById(
             "igdbImagem"
         );

         const semCapa = document.getElementById(
             "igdbSemCapa"
         );

         if (jogo.imagem) {

             imagem.src = jogo.imagem;
             imagem.hidden = false;

             imagem.onerror = () => {
                 imagem.hidden = true;
                 semCapa.hidden = false;
             };

         } else {

             semCapa.hidden = false;
         }


         // FONTE ORIGINAL

         document.getElementById(
             "igdbFonte"
         ).href = jogo.fonte_url;


         aviso.hidden = true;
         conteudo.hidden = false;

     } catch (erro) {

         console.error(
             "Erro ao carregar jogo IGDB:",
             erro
         );

         aviso.textContent = erro.message;
     }
 }


 carregarJogoIGDB();
