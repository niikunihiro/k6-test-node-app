
CREATE TABLE IF NOT EXISTS clients_post (
  user_id int not null,
  post_id int not null,
  primary key (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES clients (user_id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE
);

INSERT INTO clients_post (post_id, user_id)
SELECT post_id, FLOOR(1 + (RAND() * 5)) as user_id FROM posts;
