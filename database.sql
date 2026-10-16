-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: breaktec
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `avaliacoes`
--

DROP TABLE IF EXISTS `avaliacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nota` int NOT NULL,
  `usuario_id` int NOT NULL,
  `projeto_id` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `jogabilidade` tinyint NOT NULL DEFAULT '1',
  `historia` tinyint NOT NULL DEFAULT '1',
  `visual` tinyint NOT NULL DEFAULT '1',
  `som` tinyint NOT NULL DEFAULT '1',
  `originalidade` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_avaliacao` (`usuario_id`,`projeto_id`),
  KEY `fk_avaliacao_projeto` (`projeto_id`),
  CONSTRAINT `fk_avaliacao_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_avaliacao_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacoes`
--

LOCK TABLES `avaliacoes` WRITE;
/*!40000 ALTER TABLE `avaliacoes` DISABLE KEYS */;
INSERT INTO `avaliacoes` VALUES (1,4,10,1,'2026-10-01 01:24:50',5,5,5,5,2);
/*!40000 ALTER TABLE `avaliacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avaliacoes_oficiais`
--

DROP TABLE IF EXISTS `avaliacoes_oficiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacoes_oficiais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `jogo_oficial_id` int NOT NULL,
  `nota` decimal(3,2) NOT NULL,
  `jogabilidade` tinyint NOT NULL,
  `historia` tinyint NOT NULL,
  `visual` tinyint NOT NULL,
  `som` tinyint NOT NULL,
  `originalidade` tinyint NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_avaliacao_oficial_usuario_jogo` (`usuario_id`,`jogo_oficial_id`),
  KEY `fk_av_oficial_jogo` (`jogo_oficial_id`),
  CONSTRAINT `fk_av_oficial_jogo` FOREIGN KEY (`jogo_oficial_id`) REFERENCES `jogos_oficiais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_av_oficial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacoes_oficiais`
--

LOCK TABLES `avaliacoes_oficiais` WRITE;
/*!40000 ALTER TABLE `avaliacoes_oficiais` DISABLE KEYS */;
INSERT INTO `avaliacoes_oficiais` VALUES (1,10,1,4.60,5,5,5,3,5,'2026-10-10 19:04:52');
/*!40000 ALTER TABLE `avaliacoes_oficiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `texto` text NOT NULL,
  `usuario_id` int NOT NULL,
  `projeto_id` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_comentario_usuario` (`usuario_id`),
  KEY `fk_comentario_projeto` (`projeto_id`),
  CONSTRAINT `fk_comentario_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comentario_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `projeto_id` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`,`projeto_id`),
  KEY `fk_favorito_projeto` (`projeto_id`),
  CONSTRAINT `fk_favorito_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorito_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
INSERT INTO `favoritos` VALUES (3,10,1,'2026-10-04 20:36:38');
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritos_oficiais`
--

DROP TABLE IF EXISTS `favoritos_oficiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritos_oficiais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `jogo_oficial_id` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fav_oficial_usuario_jogo` (`usuario_id`,`jogo_oficial_id`),
  KEY `fk_fav_oficial_jogo` (`jogo_oficial_id`),
  CONSTRAINT `fk_fav_oficial_jogo` FOREIGN KEY (`jogo_oficial_id`) REFERENCES `jogos_oficiais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fav_oficial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos_oficiais`
--

LOCK TABLES `favoritos_oficiais` WRITE;
/*!40000 ALTER TABLE `favoritos_oficiais` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoritos_oficiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `game_vault`
--

DROP TABLE IF EXISTS `game_vault`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_vault` (
  `usuario_id` int NOT NULL,
  `slot` enum('favorito','jogando','quero_jogar') NOT NULL,
  `rawg_id` int NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `imagem` varchar(500) DEFAULT NULL,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`,`slot`),
  CONSTRAINT `fk_game_vault_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_vault`
--

LOCK TABLES `game_vault` WRITE;
/*!40000 ALTER TABLE `game_vault` DISABLE KEYS */;
INSERT INTO `game_vault` VALUES (10,'favorito',654,'Stardew Valley','https://media.rawg.io/media/games/713/713269608dc8f2f40f5a670a14b2de94.jpg','2026-10-14 01:45:18'),(10,'jogando',220453,'Solitaire.','https://media.rawg.io/media/screenshots/be5/be5474d0cd8059a13a1a4cf1280361d4.jpg','2026-10-14 01:45:35'),(10,'quero_jogar',336340,'Tomodachi Collection','https://media.rawg.io/media/screenshots/79d/79de9d263abfd698fc033c5b3855a54f.jpg','2026-10-14 01:47:47');
/*!40000 ALTER TABLE `game_vault` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jogos_oficiais`
--

DROP TABLE IF EXISTS `jogos_oficiais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jogos_oficiais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rawg_id` int NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `imagem` varchar(500) DEFAULT NULL,
  `desenvolvedor` varchar(255) DEFAULT NULL,
  `genero` varchar(255) DEFAULT NULL,
  `fonte_url` varchar(500) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_jogos_oficiais_rawg_id` (`rawg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jogos_oficiais`
--

LOCK TABLES `jogos_oficiais` WRITE;
/*!40000 ALTER TABLE `jogos_oficiais` DISABLE KEYS */;
INSERT INTO `jogos_oficiais` VALUES (1,654,'Stardew Valley','https://media.rawg.io/media/games/713/713269608dc8f2f40f5a670a14b2de94.jpg','Chucklefish, ConcernedApe','RPG, Simulation, Indie','https://rawg.io/games/stardew-valley','2026-10-10 19:04:52'),(6,3498,'Grand Theft Auto V','https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg','Rockstar North, Rockstar Games','Action','https://rawg.io/games/grand-theft-auto-v','2026-10-10 19:57:45'),(13,3328,'The Witcher 3: Wild Hunt','https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg','CD PROJEKT RED','Action, RPG','https://rawg.io/games/the-witcher-3-wild-hunt','2026-10-10 19:58:42');
/*!40000 ALTER TABLE `jogos_oficiais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projetos`
--

DROP TABLE IF EXISTS `projetos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projetos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `descricao` text,
  `categoria` varchar(100) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_projeto_usuario` (`usuario_id`),
  CONSTRAINT `fk_projeto_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projetos`
--

LOCK TABLES `projetos` WRITE;
/*!40000 ALTER TABLE `projetos` DISABLE KEYS */;
INSERT INTO `projetos` VALUES (1,'TESTE 1','Um novo projeto feito por Miyavi000000000000','Indie',NULL,10,'2026-09-07 01:08:21');
/*!40000 ALTER TABLE `projetos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `perfil_publico` tinyint(1) NOT NULL DEFAULT '0',
  `biografia` varchar(280) DEFAULT NULL,
  `passport_arquetipo` varchar(50) DEFAULT NULL,
  `passport_generos` varchar(100) DEFAULT NULL,
  `passport_plataforma` varchar(30) DEFAULT NULL,
  `passport_estilo` varchar(30) DEFAULT NULL,
  `passport_lema` varchar(120) DEFAULT NULL,
  `foto_perfil` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `telefone_verificado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (10,'Miyavi','jhasminevelinpomacallizaya@gmail.com','$2b$10$6/dBCkGOBJ2oDYwckeBlduz3fhcLQ8dk6haFXF0Ydsju7/s5j16RG','2026-09-06 23:47:26',1,'Apaixonado por RPG de terror, ação e mistério.','Young Creator Crew','RPG','Nintendo','Casual','Pronto para o terror.','c889270a-989d-463d-8bb2-1bce8fcf848a.webp','+5511963507297',0);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-16 19:39:07
