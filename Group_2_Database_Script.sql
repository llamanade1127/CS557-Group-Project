CREATE DATABASE IF NOT EXISTS animedb;
USE animedb;


-- tables

CREATE TABLE IF NOT EXISTS Role (
    role_id   INTEGER      NOT NULL AUTO_INCREMENT,
    role_name VARCHAR(191) NOT NULL,
    UNIQUE INDEX Role_role_name_key (role_name),
    PRIMARY KEY (role_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Genre (
    genre_id   INTEGER      NOT NULL AUTO_INCREMENT,
    genre_name VARCHAR(100) NOT NULL,
    UNIQUE INDEX Genre_genre_name_key (genre_name),
    PRIMARY KEY (genre_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS User (
    user_id    INTEGER      NOT NULL AUTO_INCREMENT,
    username   VARCHAR(191) NOT NULL,
    email      VARCHAR(191) NOT NULL,
    password   VARCHAR(191) NOT NULL,
    created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    role_id    INTEGER      NOT NULL,
    UNIQUE INDEX User_username_key (username),
    UNIQUE INDEX User_email_key (email),
    PRIMARY KEY (user_id),
    CONSTRAINT User_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES Role (role_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Session (
    id        INTEGER      NOT NULL AUTO_INCREMENT,
    userId    INTEGER      NOT NULL,
    tokenHash VARCHAR(191) NOT NULL,
    expiresAt DATETIME(3)  NOT NULL,
    createdAt DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX Session_tokenHash_key (tokenHash),
    INDEX Session_userId_idx (userId),
    PRIMARY KEY (id),
    CONSTRAINT Session_userId_fkey
        FOREIGN KEY (userId) REFERENCES User (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Anime (
    anime_id     INTEGER      NOT NULL AUTO_INCREMENT,
    title        VARCHAR(191) NOT NULL,
    cover_image  VARCHAR(191)     NULL DEFAULT NULL,
    genre_id     INTEGER      NOT NULL,
    episodes     INTEGER      NOT NULL,
    release_year INTEGER      NOT NULL,
    description  TEXT         NOT NULL,
    CONSTRAINT Anime_episodes_positive CHECK (episodes > 0),
    UNIQUE INDEX Anime_title_key (title),
    UNIQUE INDEX Anime_title_release_year_key (title, release_year),
    PRIMARY KEY (anime_id),
    CONSTRAINT Anime_genre_id_fkey
        FOREIGN KEY (genre_id) REFERENCES Genre (genre_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Watchlist (
    watchlist_id INTEGER NOT NULL AUTO_INCREMENT,
    user_id      INTEGER NOT NULL,
    anime_id     INTEGER NOT NULL,
    status       ENUM('PLAN_TO_WATCH','WATCHING','COMPLETED','DROPPED','ON_HOLD') NOT NULL,
    INDEX Watchlist_user_id_idx (user_id),
    INDEX Watchlist_anime_id_idx (anime_id),
    UNIQUE INDEX Watchlist_user_id_anime_id_key (user_id, anime_id),
    PRIMARY KEY (watchlist_id),
    CONSTRAINT Watchlist_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES User (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT Watchlist_anime_id_fkey
        FOREIGN KEY (anime_id) REFERENCES Anime (anime_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS User_Rating (
    rating_id    INTEGER     NOT NULL AUTO_INCREMENT,
    user_id      INTEGER     NOT NULL,
    anime_id     INTEGER     NOT NULL,
    rating_score INTEGER     NOT NULL,
    rated_at     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT User_Rating_score_range CHECK (rating_score BETWEEN 1 AND 10),
    INDEX User_Rating_user_id_idx (user_id),
    INDEX User_Rating_anime_id_idx (anime_id),
    UNIQUE INDEX User_Rating_user_id_anime_id_key (user_id, anime_id),
    PRIMARY KEY (rating_id),
    CONSTRAINT User_Rating_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES User (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT User_Rating_anime_id_fkey
        FOREIGN KEY (anime_id) REFERENCES Anime (anime_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- reference data

INSERT IGNORE INTO Role (role_id, role_name) VALUES
    (1, 'USER'),
    (2, 'ADMIN');

-- Password for both users: (Password123)
INSERT IGNORE INTO User (username, email, password, role_id) VALUES
    ("user1", "user1@example.com", '$2b$12$/JlKi3dqsFMnD04oAlzMiewHG06K7a2hcyz0/NhsH29nGlJnErr9W', 1),
    ("admin", "admin@example.com", '$2b$12$/JlKi3dqsFMnD04oAlzMiewHG06K7a2hcyz0/NhsH29nGlJnErr9W', 2);

INSERT IGNORE INTO Genre (genre_name) VALUES
    ('Action'),
    ('Adventure'),
    ('Comedy'),
    ('Dark'),
    ('Fantasy'),
    ('Historical'),
    ('Isekai'),
    ('Mecha'),
    ('Sci-Fi'),
    ('Superhero'),
    ('Thriller');

INSERT IGNORE INTO Anime (title, genre_id, episodes, release_year, description)
SELECT v.title, g.genre_id, v.episodes, v.release_year, v.description
FROM (
    SELECT 'Attack on Titan'                  AS title, 'Action'     AS genre, 87   AS episodes, 2013 AS release_year, 'Humanity fights Titans.'     AS description
    UNION ALL SELECT 'Death Note',                       'Thriller',            37,              2006,                 'A notebook that kills.'
    UNION ALL SELECT 'Fullmetal Alchemist: Brotherhood', 'Adventure',           64,              2009,                 'Alchemy and sacrifice.'
    UNION ALL SELECT 'Demon Slayer',                     'Action',              55,              2019,                 'Demon hunting story.'
    UNION ALL SELECT 'Jujutsu Kaisen',                   'Action',              47,              2020,                 'Curses and sorcery.'
    UNION ALL SELECT 'Naruto',                           'Adventure',           220,             2002,                 'A ninja''s journey.'
    UNION ALL SELECT 'Naruto Shippuden',                 'Adventure',           500,             2007,                 'Continuation of Naruto.'
    UNION ALL SELECT 'One Piece',                        'Adventure',           1000,            1999,                 'Pirates seeking treasure.'
    UNION ALL SELECT 'Bleach',                           'Action',              366,             2004,                 'Soul reapers.'
    UNION ALL SELECT 'Tokyo Ghoul',                      'Dark',                48,              2014,                 'Half-ghoul story.'
    UNION ALL SELECT 'Chainsaw Man',                     'Action',              12,              2022,                 'Devils and chaos.'
    UNION ALL SELECT 'Spy x Family',                     'Comedy',              25,              2022,                 'Fake family espionage.'
    UNION ALL SELECT 'My Hero Academia',                 'Superhero',           138,             2016,                 'Heroes in training.'
    UNION ALL SELECT 'Steins;Gate',                      'Sci-Fi',              24,              2011,                 'Time travel thriller.'
    UNION ALL SELECT 'Re:Zero',                          'Fantasy',             50,              2016,                 'Death loop fantasy.'
    UNION ALL SELECT 'Vinland Saga',                     'Historical',          48,              2019,                 'Viking revenge story.'
    UNION ALL SELECT 'Frieren: Beyond Journey''s End',   'Fantasy',             28,              2023,                 'Life after the hero.'
    UNION ALL SELECT 'Mob Psycho 100',                   'Action',              37,              2016,                 'Psychic powers.'
    UNION ALL SELECT 'Code Geass',                       'Mecha',               50,              2006,                 'Rebellion and strategy.'
    UNION ALL SELECT 'Sword Art Online',                 'Isekai',              96,              2012,                 'Trapped in a game.'
) AS v
JOIN Genre g ON g.genre_name = v.genre;


-- views

CREATE OR REPLACE VIEW user_watchlist_info AS
SELECT
    u.user_id,
    u.username,
    a.anime_id,
    a.title,
    g.genre_name AS genre,
    a.release_year,
    a.description,
    w.watchlist_id,
    w.status
FROM      Watchlist w
LEFT JOIN User  u ON w.user_id  = u.user_id
LEFT JOIN Anime a ON w.anime_id = a.anime_id
LEFT JOIN Genre g ON a.genre_id = g.genre_id;

CREATE OR REPLACE VIEW anime_detailed_info AS
SELECT a.anime_id, a.title, a.genre_id, a.description, a.release_year, a.episodes, g.genre_name, COALESCE(ROUND(r.avg_rating, 2), 0) AS avg_rating
FROM Anime a 
LEFT JOIN Genre g ON a.genre_id = g.genre_id
LEFT JOIN (
    SELECT anime_id, AVG(rating_score) AS avg_rating
    FROM User_Rating
    GROUP BY anime_id
) AS r ON r.anime_id = a.anime_id;

-- procedures

DROP PROCEDURE IF EXISTS update_user_profile;
DELIMITER //

CREATE PROCEDURE update_user_profile(
    IN p_user_id INT,
    IN p_username VARCHAR(255),
    IN p_email VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM User
        WHERE user_id = p_user_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User does not exist.';
    END IF;

    UPDATE User
    SET
        username = p_username,
        email = p_email
    WHERE user_id = p_user_id;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS addToWatchlist;
DELIMITER //
CREATE PROCEDURE addToWatchlist (
    IN p_user_id  INT,
    IN p_anime_id INT
)
BEGIN
    INSERT IGNORE INTO Watchlist (user_id, anime_id, status)
    VALUES (p_user_id, p_anime_id, 'PLAN_TO_WATCH');
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS proc_update_user_rating;
DELIMITER //
CREATE PROCEDURE proc_update_user_rating (
    IN new_rating_score INT,
    IN user_id_proc     INT,
    IN anime_id_proc    INT
)
BEGIN
    INSERT INTO User_Rating (user_id, anime_id, rating_score)
    VALUES (user_id_proc, anime_id_proc, new_rating_score)
    ON DUPLICATE KEY UPDATE rating_score = new_rating_score;
END //
DELIMITER ;


DROP PROCEDURE IF EXISTS filter_watchlist_by_episodes;
DELIMITER //
CREATE PROCEDURE filter_watchlist_by_episodes (
    IN user_id_param INT,
    IN min_episodes  INT
)
BEGIN
    DECLARE done           INT DEFAULT 0;
    DECLARE v_watchlist_id INT;
    DECLARE v_anime_id     INT;
    DECLARE v_title        VARCHAR(255);
    DECLARE v_status       VARCHAR(50);
    DECLARE v_genre        VARCHAR(255);
    DECLARE v_episodes     INT;
    DECLARE v_release_year INT;
    DECLARE v_description  TEXT;

    DECLARE watchlist_cursor CURSOR FOR
        SELECT
            w.watchlist_id,
            a.anime_id,
            a.title,
            w.status,
            g.genre_name,
            a.episodes,
            a.release_year,
            a.description
        FROM      Watchlist w
        JOIN      Anime     a ON w.anime_id = a.anime_id
        JOIN      Genre     g ON a.genre_id = g.genre_id
        WHERE     w.user_id = user_id_param;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    CREATE TEMPORARY TABLE IF NOT EXISTS filtered_watchlist (
        id           INT,
        anime_id     INT,
        title        VARCHAR(255),
        status       VARCHAR(50),
        genre        VARCHAR(255),
        episodes     INT,
        release_year INT,
        description  TEXT
    );

    TRUNCATE TABLE filtered_watchlist;

    OPEN watchlist_cursor;

    read_loop: LOOP
        FETCH watchlist_cursor INTO
            v_watchlist_id, v_anime_id, v_title, v_status,
            v_genre, v_episodes, v_release_year, v_description;

        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        IF v_episodes >= min_episodes THEN
            INSERT INTO filtered_watchlist
            VALUES (v_watchlist_id, v_anime_id, v_title, v_status,
                    v_genre, v_episodes, v_release_year, v_description);
        END IF;
    END LOOP;

    CLOSE watchlist_cursor;

    SELECT * FROM filtered_watchlist;
    DROP TEMPORARY TABLE filtered_watchlist;
END //
DELIMITER ;


-- triggers

DROP TRIGGER IF EXISTS trg_anime_release_year_before_insert;
DELIMITER //
CREATE TRIGGER trg_anime_release_year_before_insert
BEFORE INSERT ON Anime
FOR EACH ROW
BEGIN
    IF NEW.release_year > YEAR(CURDATE()) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'release_year cannot be in the future.';
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_anime_release_year_before_update;
DELIMITER //
CREATE TRIGGER trg_anime_release_year_before_update
BEFORE UPDATE ON Anime
FOR EACH ROW
BEGIN
    IF NEW.release_year > YEAR(CURDATE()) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'release_year cannot be in the future.';
    END IF;
END //
DELIMITER ;

