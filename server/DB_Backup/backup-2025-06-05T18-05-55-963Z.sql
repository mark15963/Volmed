-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: volmed_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `medications`
--

DROP TABLE IF EXISTS `medications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(100) NOT NULL,
  `frequency` varchar(100) NOT NULL,
  `administered` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`administered`)),
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medications`
--

LOCK TABLES `medications` WRITE;
/*!40000 ALTER TABLE `medications` DISABLE KEYS */;
INSERT INTO `medications` VALUES (7,2,'Омепразол','25мг','2р/д','[\"2025-05-31T18:41:27.605Z\"]','2025-05-31 18:38:01'),(8,84,'Парацетамол','500мг','6р/д','[\"2025-06-01T09:38:15.613Z\"]','2025-06-01 09:38:16'),(9,1,'Омепразол','25мг','2р/д','[]','2025-06-01 16:55:31');
/*!40000 ALTER TABLE `medications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_pulse`
--

DROP TABLE IF EXISTS `patient_pulse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_pulse` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `pulse_value` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `patient_pulse_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_pulse`
--

LOCK TABLES `patient_pulse` WRITE;
/*!40000 ALTER TABLE `patient_pulse` DISABLE KEYS */;
INSERT INTO `patient_pulse` VALUES (17,2,95,'2025-06-01 14:41:16'),(18,2,86,'2025-06-01 14:43:27'),(19,2,70,'2025-06-01 14:58:04'),(20,2,110,'2025-06-01 15:04:34'),(21,1,65,'2025-06-01 15:37:17'),(22,1,85,'2025-06-01 16:09:54'),(23,1,60,'2025-06-01 16:10:11'),(24,1,75,'2025-06-01 16:10:16'),(25,2,90,'2025-06-02 14:05:42');
/*!40000 ALTER TABLE `patient_pulse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lastName` varchar(100) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `patr` varchar(255) NOT NULL,
  `sex` varchar(7) NOT NULL,
  `birthDate` varchar(10) NOT NULL,
  `phone` varchar(16) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` varchar(100) NOT NULL,
  `complaint` varchar(999) NOT NULL,
  `anam` text NOT NULL,
  `life` varchar(999) NOT NULL,
  `status` mediumtext NOT NULL,
  `diag` text NOT NULL,
  `mkb` text NOT NULL,
  `sop_zab` text NOT NULL,
  `rec` varchar(999) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `statusReport` mediumtext NOT NULL,
  `locStat` mediumtext NOT NULL,
  `report` mediumtext NOT NULL,
  `state` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,'Костина','Елизавета','Александровна','Женский','1997-09-04','+79647692139','liza32@gmail.com','г. Москва, ул. Бориса Галушкина, д. 17','Жалобы','История настоящего заболевания','Анамнез жизни','История настоящего заболевания','Диаг','','sop','Рекомендации','2024-11-09 21:08:54','','','',''),(2,'Докучаева','Анна','Васильевна','Женский','1975-09-01','+79647692131','anna42@mail.ru','ул. Крылатские Холмы, д. 54, кв. 81','Пациентка жалуется на наличие грыжевого выпячивания в пупочной области, тянущие боли.','Со слов пациентки, страдает повышеным артериальном давлением с 19 лет. Принимает комплексную антигипертензивную терапию (иАПФ, бета-блокатор и тиазидоподобный диуретик). Обратилась в больницу \"РЖД-Медицина\" для планового осмотра.\r\nИзмерение АД в день осмотра, 30 мин после приема препаратов, показывает 140/90 мм.рт.ст.','Росла и развивалась без особенностей. \r\nИмеет высшее образование. \r\nСемейно-половой анамнез: не замужем. \r\nТрудовой анамнез: инженер. \r\nБытовой анамнез: жилищные и санитарно-гигиенические условия: площадь помещения 26 м2. Количество проживающих - 1 человек. Пребывание в зонах экологических бедствий - нет. \r\nПеренесенные заболевания: травмы - осколочное ранение левой голени 1944г.; туберкулёз, венерические заболевания - отсутствуют. \r\nПеренесенные операции: аппендэктомия, после ранения левой голени 1944г., холецистэктомия 2019г., полипэктомия прямой кишки 2022г. \r\nВредные привычки: отрицает. \r\nНаследственность: у матери - онкология.\r\nСопутствующие заболевания: гипертоническая болезнь II ст., АГ 3 ст., высокий риск ССО; варикозное расширение вен нижних конечностей. Принимает: валсартан 80 мг 1/р, бисопролол 2,5 мг 1/р\r\nАллергологический анамнез: непереносимость лекарственных препаратов отрицает. Фоновые аллергии отрицает.\r\nАнамнез нетрудоспособности: пенсионер.\r\n','Общее состояние больного: удовлетворительное.\r\nПоложение больного: активное.\r\nПитание: полноценное. \r\nТемпература тела - 36,5С. Телосложение: гиперстеническое, рост – 164 см, вес – 86 кг, ИМТ 31 кг/м2.\r\n \r\nВидимые слизистые: обычной окраски. Зев: не гиперемирован. Отеки нижних конечностей: нет. Пульсация на артериях стоп в норме.\r\n\r\nКожа и слизистая оболочка: окраска бледно-розовая, пигментация или депигментация - отсутствует;\r\n\r\nПодкожно-жировая клетчатка: выражена; места наибольшего отложения жира - живот.\r\n\r\nЛимфатические узлы: без особенностей.\r\n\r\nКостно-мышечная система: степень развития мускулатуры – в норме, сила мышц – в норма, мышечный тонус – в норме, брюшные мышцы не напряжены, деформация и болезненность отсутствует. Изменение формы и размеров концевых фаланг в виде «барабанных палочек» - нет.\r\n\r\nСуставы: при пальпации болезненность не обнаружена. Хруст при движении отсутствует.\r\nДвижения (сгибание, разгибание, пронация, супинация, ротация) в полном объёме (без контрактур и анкилоз), форма суставов не изменена.\r\nЩитовидная железа: не пальпируется.\r\n\r\nСердечно-сосудистая система\r\nЖалобы: Отсутствуют. Сердцебиение умеренное, ощущение перебоев – нет. Боли в области сердца и за грудиной - отсутствуют.\r\nОсмотр шеи: пульсация артерий - умеренная, пульсация шейных вен - отсутствует.\r\nОсмотр груди: сердечный горб - отсутствует, верхушечный толчок - умеренной силы в 5 межреберье на 2 см кнутри от левой срединноключичной линии. «Сердечный толчок» - отсутствует.\r\nПальпация верхушечного и сердечного толчка - V межреберье на уровне срединной ключичной линии(*смещение влево*), умеренной силы; площадь - 3 см2; резистентность - умеренная. Систолическое и диастолическое дрожание - отсутствует.\r\nПеркуссия:\r\nГраницы относительной тупости сердца:\r\n- правая: в 4 межреберье у правого края грудины\r\n- левая: в 6 межреберье, на 1 см левее от среднеключичной линии (*ниже и левее*)\r\n- верхняя: в 3 межреберье слева по окологрудинной линии.\r\nГраницы абсолютной тупости сердца:\r\n- правая: Левый край грудины в 4 межреберье\r\n- левая: На 1,5 см кнутри от среднеключичной линии в 5 межреберье\r\n- верхняя: У левого края грудины в 4 межреберье\r\nПоперечник относительной тупости сердца: правый - 4 см, левый - 10 см, общ - 14 см. (*широкий*)\r\nШирина сосудистого пучка во II межреберье - 6 см;\r\nАбсолютная тупость сердца:\r\nправая граница - по левому краю грудины.\r\nлевая граница - 5 межреберье, 1,5 см кнутри от левой окологрудинной линии.\r\nверхняя граница - на 4 ребре по левому краю грудины.\r\nАускультация:\r\nТоны сердца – ясные, ритмичны; акцент 2 тона нод аортой; шумов нет. \r\nЧСС - 64 в минуту; АД 139/88 мм.рт.ст. \r\n\r\nНейропсихологическое исследование.\r\nСознание ясное, контактна, настроение спокойное, ориентируется в месте, времени, собственной личности. Реакция зрачков на свет живая D=S. Острой неврологической симптоматики нет.','K42.9 - Пупочная грыжа без непроходимости или гангрены;','','Гипертоническая болезнь II стадии, 3 степени, высокий риск ССО; варикозная болезнь вен нижних конечностей','Проведение операции \"герниотомия пупочной грыжи\"','2024-11-09 21:09:18','','','',''),(35,'Филимонов','Сергей','Анатольевич','Мужской','1973-07-15','+7(123)456-78-90','test@test.com','г. Москва','Хронический алкоголизм II-III ст. Острая алкогольная интоксикация. Алкогольный абстинентный синдром (делирий?).','Поступил в НП \"Проф-Мед\" впервые. \r\nНастоящий запой 4 дня, 1 литр крепкого алкоголя ежедневно. Последнее употребление сегодня в 11:00. \r\nПоступил в НП \"Проф-Мед\" с целью прохождения медико-социальной реабилитации.','Рос и развивался правильно. \r\nАллергический анамнез - популяция \"А\".\r\nперенесенных операций отрицает.','Средней степени тяжести.','Хронический токсический гепатит.\r\nХроническая токсическая энцефалопатия.','K70.1 - Алкогольный гепатит','Кардиомиопатия. Нарушение электролитного обмена.','Отказ от алкоголя.','2025-01-24 12:06:33','','','',''),(84,'Иванов','Иван','Иванович','Мужской','1993-08-03','+71234567890','mark15963@gmail.com','г. Раменское, п. Удельная, ул. Солнечная, д. 37','Жалоб нет','Не болеет','Аллергологический анамнез не отягощен','Удовлетворительное.','E66 - Ожирение;','','Нет.','Нет рекомендаций','2025-05-19 13:57:49','','','','Стабильно');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(60) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `patr` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `birthDay` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (23,'mark15963','$2b$10$SH2DS1QGJNOlerfFFWXxjuARtTmk3QgTfpnruw43WUWNQwaa0qye6','Винер','Марк','Ильич','mark15963@gmail.com','1998-09-04'),(24,'mark','$2y$12$Anyx6wHQnBo0mNksuKyss.nC5Fu8ZS1/Fnyh2k/tHGbib9HCi2HSm','','','','mark@gmail.com',NULL),(27,'test1','$2b$10$VVASXHjPffPMj.4UCT7IEOZsBaHBZ8atKDqO5GBuQUaDBsN09vHWO','test3','test2','tes4','',NULL),(29,'test','$2b$10$SH2DS1QGJNOlerfFFWXxjuARtTmk3QgTfpnruw43WUWNQwaa0qye6','Пользователь','Пользователь','Пользователь','',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-05 21:05:56
