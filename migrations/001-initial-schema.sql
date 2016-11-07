-- Up
CREATE TABLE admins (admin TEXT NOT NULL);
CREATE TABLE first_use (first_use TEXT NOT NULL);
CREATE TABLE gears (name TEXT NOT NULL, description TEXT NOT NULL, active TEXT NOT NULL);
CREATE TABLE config (token TEXT, name TEXT);
INSERT INTO config values (null, null);

-- Down
DROP TABLE admins;
DROP TABLE first_use;
DROP TABLE gears;
DROP TABLE config;
