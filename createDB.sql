DROP DATABASE IF EXISTS GAMEDB;

CREATE DATABASE GAMEDB;

use GAMEDB;

CREATE TABLE GAME(
    GAME_ID int NOT NULL AUTO_INCREMENT,
    GUESS_COUNT int NOT NULL,
    SECRET_NUM int NOT NULL,
    PRIMARY KEY (GAME_ID)
);
