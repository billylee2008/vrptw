DROP DATABASE IF EXISTS vrp_lushan;
DROP USER IF EXISTS vrp_lushan;

CREATE USER vrp_lushan WITH PASSWORD 'test';
CREATE DATABASE vrp_lushan OWNER vrp_lushan;
GRANT ALL PRIVILEGES ON DATABASE vrp_lushan TO vrp_lushan;
