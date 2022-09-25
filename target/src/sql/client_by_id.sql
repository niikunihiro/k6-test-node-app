SELECT
  `first_name`,
  `last_name`,
  `password`,
  `user_id`
FROM `clients`
WHERE `client_id` = ?
