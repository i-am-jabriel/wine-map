DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE users (
  id serial primary key,
  name VARCHAR(32),
  email VARCHAR(64),
  last_login timestamp NOT NULL DEFAULT NOW(),
  achievements VARCHAR(64)[],
  score integer DEFAULT 0
);

CREATE TABLE posts(
  id serial primary key,
  postType VARCHAR(32),
  broadcast varchar(32) default 'Public',
  body text[],
  title varchar(80),
  postDate timestamp NOT NULL DEFAULT NOW(),
  userId int NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id serial primary key,
  broadcast varchar(32) default 'Public',
  body text[],
  userId int NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
  postDate timestamp NOT NULL DEFAULT NOW()
);

create table commentsUsers(
    id serial primary key,
    childId int,
    foreign key(childId) references comments(id) on delete cascade,
    parentId int,
    foreign key(parentId) references users(id) on delete CASCADE
);
create table commentsPosts(
    id serial primary key,
    childId int,
    foreign key(childId) references comments(id) on delete cascade,
    parentId int,
    foreign key(parentId) references posts(id) on delete CASCADE
);
create table commentsComments(
    id serial primary key,
    childId int,
    foreign key(childId) references comments(id) on delete cascade,
    parentId int,
    foreign key(parentId) references comments(id) on delete CASCADE
);

CREATE TABLE likes(
    id serial primary key,
    userId int NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    postDate timestamp NOT NULL DEFAULT NOW()
);
create table likesUsers(
    id serial primary key,
    childId int,
    foreign key(childId) references comments(id) on delete cascade,
    parentId int,
    foreign key(parentId) references users(id) on delete CASCADE
);
create table likesPosts(
    id serial primary key,
    childId int,
    foreign key(childId) references comments(id) on delete cascade,
    parentId int,
    foreign key(parentId) references posts(id) on delete CASCADE
);
create table likesComments(
    id serial primary key,
    childId int,
    foreign key(childId) references comments(id) on delete cascade,
    parentId int,
    foreign key(parentId) references comments(id) on delete CASCADE
);


insert into users (email,name) values ('officialjabe@gmail.com','Abe Johnson');
insert into posts(userId,title,body) values(1,'my first post',array['this is my first post','it is filled with content','rejoice']);
insert into posts(userId,title,body) values(1,'my first post',array['2nd post','doesnt have much going for it','[img](https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true)']);
insert into comments(userId, body) values(1,array['your first post is kinda lame ngl']);
insert into commentsPosts(parentId, childId) values(1,currval('comments_id_seq'));
insert into comments(userId, body) values(1,array['be the change you want to see in the universe :D']);
insert into commentsPosts(parentId, childId) values(1,currval('comments_id_seq'));
insert into comments(userId, body) values(1,array['3rd comment holy smokes']);
insert into commentsPosts(parentId, childId) values(1,currval('comments_id_seq'));