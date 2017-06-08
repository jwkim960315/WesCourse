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
  term_name varchar(6) not null,
  field_acronym varchar(4),
  created_at timestamp default current_timestamp,
  foreign key (field_acronym) references fields(acronym) on delete cascade
);

create table users (
  id int AUTO_INCREMENT PRIMARY KEY,
  username varchar(255) not null,
  email varchar(255) not null,
  password varchar(80) not null
);

create table ratings (
  id int AUTO_INCREMENT PRIMARY KEY,
  difficulty decimal(2,1) not null,
  organization decimal(2,1) not null,
  effort decimal(2,1) not null,
  professors decimal(2,1) not null,
  recommend BOOL not null,
  field_acronym varchar(4) not null,
  user_id int not null,
  FOREIGN KEY (field_acronym) REFERENCES fields(acronym) on delete cascade,
  FOREIGN KEY (user_id) REFERENCES users(id) on delete cascade
);

create table comments (
  id int AUTO_INCREMENT PRIMARY KEY,
  comment text not null,
  field_acronym varchar(4) not null,
  user_id int not null,
  FOREIGN KEY (field_acronym) REFERENCES fields(acronym) on delete cascade,
  FOREIGN KEY (user_id) REFERENCES users(id) on delete cascade
);




# show tables;
# #
# drop table fields;

select * from fields;

update fields set category='OTHERS' where category='N/A';


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