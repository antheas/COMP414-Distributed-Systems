CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) NOT NULL auto_increment,
    `username` varchar(32) NOT NULL,
    `password` varchar(50) NOT NULL,
    `email` varchar(64) NOT NULL,
    `role` varchar(16) NOT NULL,
    `last_login` int(10) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `access_tokens` (
	`id` int(32) NOT NULL,
    `user_id` int(11) NOT NULL,
    `date_created` DATETIME NOT NULL,
    `valid_until` DATETIME,
    PRIMARY KEY(id),
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;