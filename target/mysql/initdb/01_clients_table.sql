CREATE TABLE IF NOT EXISTS clients (
  user_id int not null auto_increment,
  client_id varchar(255) not null unique,
  first_name varchar(255) not null,
  last_name varchar(255) not null,
  password varchar(255) not null,
  primary key (user_id)
);

# raw password is topSecretSecret
INSERT INTO clients (client_id, first_name, last_name, password) VALUES
 ('yamada-naoko', 'naoko', 'yamada', '$2b$10$Eyy/U3LQ00xrY87FXbJ56.2sn8PfezfmE4a3OtfQcN6E36adHozSG')
,('ueda-jiro', 'jirou', 'ueda', '$2b$10$Q.TaRYy20fMpXmDEXg6KhegNT/sKXF2kqW4SmYTvSOBbNAA9pCAm2')
,('yabe-kenzo', 'kenzo', 'yabe', '$2b$10$az.PAWO9SeUm1s9YUWPFp..LqYjhtdsvP2AZgG.zmNijyzhyFJwcm')
,('ishihara-desuja', 'tatsuya', 'ishihara', '$2b$10$3PFB6/zxIb/ADxxvJ3bgROxK1JQ1vTXBaSybyShDMRyY3vwqlpRdG')
,('moe-', 'harando', 'akiba', '$2b$10$7X24L9CBU3kbMVqQVSPjfuqv/mQpu7.ZbnbHvUQJrSsd1zmz3YMRe')
;

CREATE TABLE IF NOT EXISTS works (
  work_id int not null auto_increment,
  title varchar(255) not null,
  start year(4) not null,
  song varchar(255) not null,
  cast JSON not null,
  primary key (work_id)
);

INSERT INTO works (title, start, song, cast) VALUES
 ('TRICK', 2000, '月光', '["仲間由紀恵", "阿部寛", "生瀬勝久", "野際陽子"]')
,('TRICK2', 2002, '流星群', '["仲間由紀恵", "阿部寛", "生瀬勝久", "野際陽子"]')
,('TRICK3', 2003, '私とワルツを', '["仲間由紀恵", "阿部寛", "生瀬勝久", "野際陽子"]')
;
