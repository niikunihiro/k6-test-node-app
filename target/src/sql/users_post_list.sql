SELECT
  p.post_id,
  p.post,
  p.posted_at,
  c.client_id,
  c.first_name,
  c.last_name
FROM posts p 
INNER JOIN clients_post cp ON cp.post_id = p.post_id 
INNER JOIN clients c ON cp.user_id = c.user_id
WHERE c.client_id = ?
ORDER BY p.post_id
DESC LIMIT ? OFFSET ?
