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

# show tables;
# #
# drop table fields;

select * from fields;

update fields set category='OTHERS' where category='N/A';