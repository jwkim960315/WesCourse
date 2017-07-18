DROP DATABASE wes_course_test;
CREATE DATABASE wes_course_test;
use wes_course_test;

create table fields (
  acronym varchar(4) primary key not null,
  name varchar(255) not null,
  category varchar(255) not null,
  url varchar(255) not null,
  term int not null,
  created_at timestamp default current_timestamp
);


create table courses (
  id int AUTO_INCREMENT PRIMARY KEY,
  course_name varchar(255) not null,
  section int not null,
  professors varchar(255)  not null,
  course_acronym varchar(15) not NULL,
  class_date varchar(255) not null,
  term int not null,
  term_name varchar(100) not null,
  field_acronym varchar(4),
  cross_list varchar(100) default "",
  created_at timestamp default current_timestamp,
  foreign key (field_acronym) references fields(acronym) on delete cascade
);

create table users (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  username varchar(255) not null,
  email varchar(255) not null UNIQUE,
  first_name varchar(255) not null,
  last_name varchar(255) not null,
  created_at timestamp default current_timestamp
);

create table ratings (
  id int AUTO_INCREMENT PRIMARY KEY,
  difficulty decimal(2,1) not null,
  organization decimal(2,1) not null,
  effort decimal(2,1) not null,
  professors decimal(2,1) not null,
  recommend INT not null,
  course_id int not null,
  user_id VARCHAR(255) not null,
  comment TEXT,
  anonymous BOOLEAN not null,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) on delete cascade,
  FOREIGN KEY (user_id) REFERENCES users(id) on delete cascade
);




# show tables;
# #
# drop table fields;

select * from fields;

update fields set category='OTHERS' where category='N/A';

select * from courses where char_length(field_acronym)=3;

select * from fields where acronym="ISTR";

select course_acronym,field_acronym from courses where field_acronym="ISTR",field_acronym=substring(replace(course_acronym,"&",""),1,3);

-- create table fields (
--   name varchar(255) not null,
--   acronym varchar(4) not null PRIMARY KEY,
--   category varchar(200) not null,
--   url varchar(255) not null,
--   term int not null,
--   created_at timestamp default current_timestamp
-- );

-- create table courses (
--   id int AUTO_INCREMENT PRIMARY KEY,
--   course_name varchar(255) not null,
--   section int not null,
--   professors varchar(100) not null,
--   course_acronym varchar(15) UNIQUE not null,
--   class_date varchar(100) not null,
--   term int not null,
--   term_name varchar(6) not null,
--   field_acronym varchar(4) not null,
--   created_at timestamp default current_timestamp,
--   FOREIGN KEY (field_acronym) REFERENCES fields(acronym) on delete cascade
-- );

drop database wes_course_test;

create database wes_course_test;

use wes_course_test;

select * from fields;

select * from courses where course_acronym = "ARAB101-01";

SELECT acronym FROM fields WHERE name="Arabic";
SELECT id,course_acronym,section,professors,class_date,cross_list FROM courses WHERE cross_list like "%ARAB;%" or cross_list like "%;ARAB%" or cross_list like "ARAB";
# SELECT id,course_acronym,section,professors,class_date,cross_list FROM courses WHERE cross_list like in ("%ARAB;%","%;ARAB%","ARAB");
# SELECT id,course_acronym,section,professors,class_date,cross_list FROM courses WHERE cross_list like "ARAB";

SELECT id,course_acronym,section,professors,class_date,cross_list FROM courses WHERE course_acronym="ARHA299-01";

select * from ratings inner join courses on ratings.course_id = courses.id inner join users on users.id = ratings.user_id having courses.course_name = "ARAB101-01";

SELECT * FROM courses WHERE field_acronym = "ARAB";

INSERT INTO users (username,email,password) values ('Me','fdsaf@fdasfas.com',SHA2('password',256));

select * from ratings;

INSERT INTO ratings (difficulty,organization,effort,professors,recommend,course_id,user_id) VALUES (3.9,3.9,3.9,3.9,true,196,20);
INSERT INTO ratings (difficulty,organization,effort,professors,recommend,course_id,user_id) VALUES (4.9,4.9,4.9,4.9,true,196,20);

SELECT avg(difficulty) as Difficulty,
        avg(organization) as Organization,
        avg(effort) as "Effort Required",
        avg(ratings.professors) as "Professors Rating",
        CASE
          WHEN avg(recommend)>=.5 then "Yes"
          ELSE "No"
        END as "Recommend?",
        courses.course_acronym
from ratings
  inner join courses
    on ratings.course_id = courses.id
  inner join users
    on users.id = ratings.user_id
GROUP BY ratings.course_id
HAVING courses.course_acronym="ARAB101-01";

delete from ratings;

select * from ratings;

delete from users;


select * from ratings;

select * from users where email="jkim11@wesleyan.edu";

delete from users;

select * from courses where course_name like "%ARAB%" OR section like "%ARAB%";

select * from courses;

SELECT * FROM courses WHERE course_name like "%COMP%" OR
                                                  professors like "%COMP%" OR
                                                  course_acronym like "%COMP%" OR
                                                  field_acronym like "%COMP%"
                     ORDER BY course_acronym
                     LIMIT 10,10;

SELECT  FROM comments INNER JOIN courses ON comments.course_id = courses.id INNER JOIN users ON comments.user_id = users.id HAVING courses.course_acronym = "ARAB";

SELECT avg(difficulty) as Difficulty,
                                    avg(organization) as Organization,
                                    avg(effort) as EffortRequired,
                                    avg(ratings.professors) as ProfessorsRating,
                                    CASE
                                        WHEN avg(recommend)>=.5 THEN "Yes"
                                        ELSE "No"
                                        END as Recommend,
                                    courses.course_acronym
                            from ratings
                            inner join courses
                                on ratings.course_id = courses.id
                            inner join users
                                on users.id = ratings.user_id
                            GROUP BY ratings.course_id
                            HAVING courses.course_acronym="ARAB101-01";

delete from ratings where user_id=20;

select * from ratings;


SELECT * FROM ratings;

SELECT CASE
                                        WHEN ratings.anonymous=1 THEN "Anonymous"
                                        ELSE username
                                    END as username,
                                    comment,
                                    ratings.created_at,
                                    ratings.difficulty,
                                    ratings.organization,
                                    ratings.effort,
                                    ratings.professors,
                                    CASE
                                        WHEN ratings.recommend=1 THEN "Yes"
                                        ELSE "No"
                                    END as recommend
                             FROM ratings RIGHT JOIN courses ON ratings.course_id = courses.id RIGHT JOIN users ON ratings.user_id = users.id where course_acronym="AMST119-01";
SELECT AVG(recommend) FROM ratings GROUP BY recommend WHERE course_acronym="ARAB101-01";
SELECT recommend FROM ratings WHERE course_acronym="ARAB101-01";
select case when anonymous=1 then "Anonymous" ELSE username END as username FROM ratings INNER JOIN courses ON ratings.course_id = courses.id INNER JOIN users ON ratings.user_id = users.id WHERE courses.course_acronym="ARAB101-01";
SELECT id FROM courses WHERE course_acronym="ARAB101-01";
select * from ratings where course_id=196;

select avg(recommend) FROM ratings GROUP BY recommend WHERE course_id=196;

SELECT CASE WHEN recommend=true THEN 1 ELSE 0 END AS yes,
        CASE WHEN recommend=false THEN 1 ELSE 0 END AS no
        FROM ratings WHERE course_id=196;

SELECT * from courses WHERE course_acronym="AMST119-01";

delete from ratings;

select * from ratings;



select * from users;


delete from users;

DROP DATABASE wes_course_test;
CREATE DATABASE wes_course_test;
INSERT INTO ratings (difficulty,organization,effort,professors,recommend,comment,anonymous,course_id,user_id) VALUES (3.0,1.0,2.0,4.5,1,"fdsafsdafs",1,196,20);