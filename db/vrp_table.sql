--PostgreSQL如何为主键创建自增序列(Sequences)
--https://blog.csdn.net/timo1160139211/article/details/78191470

DROP TABLE IF EXISTS vrp_vehicle;
CREATE TABLE vrp_vehicle(
    id integer NOT NULL,
    name varchar(20) NOT NULL,
    available numeric(5, 0),
    volumn numeric(20, 15) NOT NULL,
    load numeric(20, 15) NOT NULL,
    ratio numeric(6, 3) NOT NULL,
    pickup numeric(3, 0),
    runlimit numeric(5, 0),
    unload numeric(3, 0),
    PRIMARY KEY(id)
);
DROP SEQUENCE IF EXISTS vrp_vehicle_seq;
CREATE SEQUENCE vrp_vehicle_seq
    INCREMENT 1
    START 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE vrp_vehicle ALTER COLUMN id SET DEFAULT NEXTVAL('vrp_vehicle_seq');

DROP TABLE IF EXISTS vrp_site;
CREATE TABLE vrp_site(
    id integer NOT NULL,
    code varchar(10) NOT NULL,
    name varchar(40) NOT NULL,
    abbr varchar(20),
    address varchar(200),
    longitude numeric(20, 15),
    latitude numeric(20, 15),
    PRIMARY KEY(id)
);
DROP SEQUENCE IF EXISTS vrp_site_seq;
CREATE SEQUENCE vrp_site_seq
    INCREMENT 1
    START 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE vrp_site ALTER COLUMN id SET DEFAULT NEXTVAL('vrp_site_seq');

DROP TABLE IF EXISTS vrp_cost;
CREATE TABLE vrp_cost(
    id integer NOT NULL,
    site1 integer NOT NULL,
    site2 integer NOT NULL,
    minutes numeric(5, 0) NOT NULL,
    tariff numeric(20, 15) NOT NULL,
    PRIMARY KEY(id)
);
DROP SEQUENCE IF EXISTS vrp_cost_seq;
CREATE SEQUENCE vrp_cost_seq
    INCREMENT 1
    START 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE vrp_cost ALTER COLUMN id SET DEFAULT NEXTVAL('vrp_cost_seq');

DROP TABLE IF EXISTS vrp_order;
CREATE TABLE vrp_order(
    id integer NOT NULL,
    dldate date NOT NULL,
    dc integer NOT NULL,
    site integer NOT NULL,
    volumn numeric(20, 15) NOT NULL,
    load numeric(20, 15) NOT NULL,
    po varchar(15),
    PRIMARY KEY(id)
);
DROP SEQUENCE IF EXISTS vrp_order_seq;
CREATE SEQUENCE vrp_order_seq
    INCREMENT 1
    START 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE vrp_order ALTER COLUMN id SET DEFAULT NEXTVAL('vrp_order_seq');

DROP TABLE IF EXISTS vrp_route;
CREATE TABLE vrp_route(
    id integer NOT NULL,
    dc integer NOT NULL,
    turn integer NOT NULL,
    dldate date,
    name varchar(40),
    PRIMARY KEY(id)
);
DROP SEQUENCE IF EXISTS vrp_route_seq;
CREATE SEQUENCE vrp_route_seq
    INCREMENT 1
    START 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE vrp_route ALTER COLUMN id SET DEFAULT NEXTVAL('vrp_route_seq');

DROP TABLE IF EXISTS vrp_path;
CREATE TABLE vrp_path(
    id integer NOT NULL,
    route integer NOT NULL,
    turn integer NOT NULL,
    site integer NOT NULL,
    PRIMARY KEY(id)
);
DROP SEQUENCE IF EXISTS vrp_path_seq;
CREATE SEQUENCE vrp_path_seq
    INCREMENT 1
    START 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE vrp_path ALTER COLUMN id SET DEFAULT NEXTVAL('vrp_path_seq');
