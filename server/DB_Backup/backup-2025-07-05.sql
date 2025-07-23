SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


SET default_tablespace = '';


SET default_table_access_method = heap;


CREATE TABLE public.medications (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    name character varying(255) NOT NULL,
    dosage character varying(100) NOT NULL,
    frequency character varying(100) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.medications OWNER TO neondb_owner;


CREATE SEQUENCE public.medications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medications_id_seq OWNER TO neondb_owner;


ALTER SEQUENCE public.medications_id_seq OWNED BY public.medications.id;


CREATE TABLE public.patient_pulse (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    pulse_value integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.patient_pulse OWNER TO neondb_owner;


CREATE SEQUENCE public.patient_pulse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_pulse_id_seq OWNER TO neondb_owner;


ALTER SEQUENCE public.patient_pulse_id_seq OWNED BY public.patient_pulse.id;


CREATE TABLE public.patients (
    id integer NOT NULL,
    "lastName" character varying(100) NOT NULL,
    "firstName" character varying(100) NOT NULL,
    patr character varying(255) NOT NULL,
    sex character varying(7) NOT NULL,
    "birthDate" character varying(10) NOT NULL,
    phone character varying(16) NOT NULL,
    email character varying(100) NOT NULL,
    address character varying(100) NOT NULL,
    complaint character varying(999) NOT NULL,
    anam text NOT NULL,
    life character varying(999) NOT NULL,
    status text NOT NULL,
    diag text NOT NULL,
    mkb text NOT NULL,
    sop_zab text NOT NULL,
    rec character varying(999) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"state" text NOT NULL
);


ALTER TABLE public.patients OWNER TO neondb_owner;


CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO neondb_owner;


ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;


CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(60) NOT NULL,
    "lastName" character varying(255),
    "firstName" character varying(255),
	patr character varying(255),
    status character varying(255)
);


ALTER TABLE public.users OWNER TO neondb_owner;


CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;


ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


ALTER TABLE ONLY public.medications ALTER COLUMN id SET DEFAULT nextval('public.medications_id_seq'::regclass);


ALTER TABLE ONLY public.patient_pulse ALTER COLUMN id SET DEFAULT nextval('public.patient_pulse_id_seq'::regclass);


ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


INSERT INTO public.medications (id, patient_id, name, dosage, frequency, "createdAt") VALUES
(27, 	88, 'Омепразол',	'25мг', 	'2 р/д', 	'2025-06-15 17:05:39.297835'),
(23,	1,	'Омепразол',	'20мг',		'2 р/д',	'2025-06-14 23:52:51.80712'),
(25,	84,	'Омепразол',	'20мг',		'2 р/д',	'2025-06-15 00:02:19.063288'),
(26,	84,	'Парацетамол',	'500мг',	'6 р/д',	'2025-06-15 00:02:19.39103'),
(24,	2,	'Омепразол',	'20мг',		'2 р/д',	'2025-06-14 23:53:31.143502'),
(22,	35,	'Омепразол',	'20мг',		'2 р/д',	'2025-06-14 23:50:23.797702');


INSERT INTO public.patient_pulse (id, patient_id, pulse_value, created_at) VALUES
(17,	2,	95,	'2025-06-01 14:41:16'),
(18,	2,	86,	'2025-06-01 14:43:27'),
(19,	2,	70,	'2025-06-01 14:58:04'),
(20,	2,	110, '2025-06-01 15:04:34'),
(21,	1,	65,	'2025-06-01 15:37:17'),
(22,	1,	85,	'2025-06-01 16:09:54'),
(23,	1,	60,	'2025-06-01 16:10:11'),
(24,	1,	75,	'2025-06-01 16:10:16'),
(25,	2,	90,	'2025-06-02 14:05:42'),
(26,	84,	97,	'2025-06-11 18:14:08.904182'),
(27,	84,	85,	'2025-06-11 18:14:13.353894'),
(28,	84,	93,	'2025-06-11 18:14:17.753777'),
(29,	84,	87,	'2025-06-11 18:14:28.537605'),
(51,	35,	78,	'2025-06-14 23:42:41.825573'),
(52,	35,	21,	'2025-06-14 23:42:46.469011'),
(53,	35,	80,	'2025-06-15 08:03:33.555923'),
(57,	2,	95,	'2025-06-16 09:19:56.823617'),
(58,	35,	90,	'2025-06-30 12:38:12.364065'),
(59,	35,	85,	'2025-07-01 13:22:30.389594'),
(60,	35,	80,	'2025-07-03 12:18:55.478454');


INSERT INTO public.patients (id, "lastName", "firstName", patr, sex, "birthDate", phone, email, address, complaint, anam, life, status, diag, sop_zab, rec, created_at, "state") VALUES
(1,		'Костина',		'Елизавета',	'Александровна',	'Женский',	'1997-09-04',	'+7(964)769-21-39',	'liza32@gmail.com',		'г. Москва, ул. Бориса Галушкина, д. 17',			'Жалобы',																											'История настоящего заболевания',																																																																											'Анамнез жизни',																																																																																																																																																																																																																																																	'Общее состояние больного: удовлетворительное.',																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																													'Диаг',														'sop',																											'Рекомендации',											'2024-11-09 21:08:54',	'Выписана'),
(2,		'Докучаева',	'Анна',			'Васильевна',		'Женский',	'1975-09-01',	'+7(964)769-24-31',	'anna42@mail.ru',		'ул. Крылатские Холмы, д. 54, кв. 81',				'Пациентка жалуется на наличие грыжевого выпячивания в пупочной области, тянущие боли.',							'Со слов пациентки, страдает повышеным артериальном давлением с 19 лет. Принимает комплексную антигипертензивную терапию (иАПФ, бета-блокатор и тиазидоподобный диуретик). Обратилась в больницу \\"РЖД-Медицина\\" для планового осмотра.\nИзмерение АД в день осмотра, 30 мин после приема препаратов, показывает 140/90 мм.рт.ст.',		'Росла и развивалась без особенностей. \nИмеет высшее образование. \nСемейно-половой анамнез: не замужем. \nТрудовой анамнез: инженер. \nБытовой анамнез: жилищные и санитарно-гигиенические условия: площадь помещения 26 м2. Количество проживающих - 1 человек. Пребывание в зонах экологических бедствий - нет. \nПеренесенные заболевания: травмы - осколочное ранение левой голени 1944г.; туберкулёз, венерические заболевания - отсутствуют. \nПеренесенные операции: аппендэктомия, после ранения левой голени 1944г., холецистэктомия 2019г., полипэктомия прямой кишки 2022г. \nВредные привычки: отрицает. \nНаследственность: у матери - онкология.\nСопутствующие заболевания: гипертоническая болезнь II ст., АГ 3 ст., высокий риск ССО; варикозное расширение вен нижних конечностей. Принимает: валсартан 80 мг 1/р, бисопролол 2,5 мг 1/р\nАллергологический анамнез: непереносимость лекарственных препаратов отрицает. Фоновые аллергии отрицает.\nАнамнез нетрудоспособности: пенсионер.\n',	'Общее состояние больного: удовлетворительное.\nПоложение больного: активное.\nПитание: полноценное. \nТемпература тела - 36,5С. Телосложение: гиперстеническое, рост – 164 см, вес – 86 кг, ИМТ 31 кг/м2.\n \nВидимые слизистые: обычной окраски. Зев: не гиперемирован. Отеки нижних конечностей: нет. Пульсация на артериях стоп в норме.\n\nКожа и слизистая оболочка: окраска бледно-розовая, пигментация или депигментация - отсутствует;\n\nПодкожно-жировая клетчатка: выражена; места наибольшего отложения жира - живот.\n\nЛимфатические узлы: без особенностей.\n\nКостно-мышечная система: степень развития мускулатуры – в норме, сила мышц – в норма, мышечный тонус – в норме, брюшные мышцы не напряжены, деформация и болезненность отсутствует. Изменение формы и размеров концевых фаланг в виде «барабанных палочек» - нет.\n\nСуставы: при пальпации болезненность не обнаружена. Хруст при движении отсутствует.\nДвижения (сгибание, разгибание, пронация, супинация, ротация) в полном объёме (без контрактур и анкилоз), форма суставов не изменена.\nЩитовидная железа: не пальпируется.\n\nСердечно-сосудистая система\nЖалобы: Отсутствуют. Сердцебиение умеренное, ощущение перебоев – нет. Боли в области сердца и за грудиной - отсутствуют.\nОсмотр шеи: пульсация артерий - умеренная, пульсация шейных вен - отсутствует.\nОсмотр груди: сердечный горб - отсутствует, верхушечный толчок - умеренной силы в 5 межреберье на 2 см кнутри от левой срединноключичной линии. «Сердечный толчок» - отсутствует.\nПальпация верхушечного и сердечного толчка - V межреберье на уровне срединной ключичной линии(*смещение влево*), умеренной силы; площадь - 3 см2; резистентность - умеренная. Систолическое и диастолическое дрожание - отсутствует.\nПеркуссия:\nГраницы относительной тупости сердца:\n- правая: в 4 межреберье у правого края грудины\n- левая: в 6 межреберье, на 1 см левее от среднеключичной линии (*ниже и левее*)\n- верхняя: в 3 межреберье слева по окологрудинной линии.\nГраницы абсолютной тупости сердца:\n- правая: Левый край грудины в 4 межреберье\n- левая: На 1,5 см кнутри от среднеключичной линии в 5 межреберье\n- верхняя: У левого края грудины в 4 межреберье\nПоперечник относительной тупости сердца: правый - 4 см, левый - 10 см, общ - 14 см. (*широкий*)\nШирина сосудистого пучка во II межреберье - 6 см;\nАбсолютная тупость сердца:\nправая граница - по левому краю грудины.\nлевая граница - 5 межреберье, 1,5 см кнутри от левой окологрудинной линии.\nверхняя граница - на 4 ребре по левому краю грудины.\nАускультация:\nТоны сердца – ясные, ритмичны; акцент 2 тона нод аортой; шумов нет. \nЧСС - 64 в минуту; АД 139/88 мм.рт.ст. \n\nНейропсихологическое исследование.\nСознание ясное, контактна, настроение спокойное, ориентируется в месте, времени, собственной личности. Реакция зрачков на свет живая D=S. Острой неврологической симптоматики нет.',	'K42.9 - Пупочная грыжа без непроходимости или гангрены;',	'Гипертоническая болезнь II стадии, 3 степени, высокий риск ССО; варикозная болезнь вен нижних конечностей',	'Проведение операции \\"герниотомия пупочной грыжи\\"',	'2024-11-09 21:09:18',	'Стабильно'),
(35,	'Филимонов',	'Сергей',		'Анатольевич',		'Мужской',	'1973-07-15',	'+7(123)456-78-90',	'test@test.com',		'г. Москва',										'Хронический алкоголизм II-III ст. Острая алкогольная интоксикация. Алкогольный абстинентный синдром (делирий?).',	'Поступил в НП \\"Проф-Мед\\" впервые. \nНастоящий запой 4 дня, 1 литр крепкого алкоголя ежедневно. Последнее употребление сегодня в 11:00. \nПоступил в НП \\"Проф-Мед\\" с целью прохождения медико-социальной реабилитации.	Рос и развивался правильно. \nАллергический анамнез - популяция \\"А\\".\nперенесенных операций отрицает.',	'Средней степени тяжести.',																																																																																																																																																																																																																																															'Хронический токсический гепатит.\nХроническая токсическая энцефалопатия.',																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																							'K70.1 - Алкогольный гепатит',								'Кардиомиопатия. Нарушение электролитного обмена.',																'Отказ от алкоголя.',									'2025-01-24 12:06:33',	'Критическое'),
(84,	'Иванов',		'Иван',			'Иванович',			'Мужской',	'1993-08-03',	'+7(123)456-78-90',	'ivan15963@gmail.com',	'г. Раменское, п. Удельная, ул. Солнечная, д. 37',	'Жалоб нет',																										'Не болеет',																																																																																'Аллергологический анамнез не отягощен',																																																																																																																																																																																																																																											'Общее состояние больного: удовлетворительное.',																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																													'E66 - Ожирение;',											'Нет.',																											'Нет рекомендаций',										'2025-05-19 13:57:49',	'Стабильно');


INSERT INTO public.session (sid, sess, expire) VALUES
('EsLAMlFKpKz1cZFVzr1GqNfV-2Pc1F5s',	'{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-06T12:54:27.771Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"isAuth":true,"user":"mark15963","lastName":"Винер","firstName":"Марк","patr":"Ильич","status":"Доктор"}',	'2025-07-06 12:54:29'),
('TFzhwOoakH93-hND_d8EcwsKUoF0FoAs',	'{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-06T13:00:42.879Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"isAuth":true,"user":"mark15963","lastName":"Винер","firstName":"Марк","patr":"Ильич","status":"Доктор"}',	'2025-07-06 13:00:44');


INSERT INTO public.users (id, username, password, "lastName", "firstName", patr, status) VALUES
(32,	'admin',		'$2b$10$QyWMwGHaNOkNhyl1vwipaeMHU1pZWUrVi2op8awUILiqQmAqBxb8e',	'Винер',	'Марк',	NULL,		'Администратор'),
(43,	'test',			'$2b$10$VGr2Onw6qZLWH4bx2OUIreWtn3LPkgbmr8ZhQU8dixUGWuoBalOoK',	'Иванов',	'Иван',	NULL,		'Тестировщик'),
(39,	'mark15963',	'$2b$10$iNHlwMa9nYmgXi8i86jtte2MvnK6PNTXTNWnRllFfWkYXictL.q46',	'Винер',	'Марк',	'Ильич',	'Доктор');


SELECT pg_catalog.setval('public.medications_id_seq', 31, true);


SELECT pg_catalog.setval('public.patient_pulse_id_seq', 60, true);


SELECT pg_catalog.setval('public.patients_id_seq', 94, true);


SELECT pg_catalog.setval('public.users_id_seq', 43, true);


ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.patient_pulse
    ADD CONSTRAINT patient_pulse_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


ALTER TABLE ONLY public.patient_pulse
    ADD CONSTRAINT patient_pulse_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public GRANT SELECT ON TABLES TO neondb_owner;