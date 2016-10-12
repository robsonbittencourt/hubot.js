-- Up
CREATE TABLE admins (admin TEXT NOT NULL);
CREATE TABLE first_use (first_use TEXT NOT NULL);
CREATE TABLE gears (name TEXT NOT NULL, description TEXT NOT NULL, active TEXT NOT NULL);

-- Down
DROP TABLE admins;
DROP TABLE first_use;
DROP TABLE gears;
