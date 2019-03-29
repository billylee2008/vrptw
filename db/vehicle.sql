--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5
-- Dumped by pg_dump version 10.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: vrp_vehicle; Type: TABLE DATA; Schema: public; Owner: vrp_sly
--

COPY public.vrp_vehicle (id, name, available, volumn, load, ratio, pickup, runlimit, unload) FROM stdin;
1	4.2MREF	100	8.000000000000000	3.000000000000000	1.100	0	480	20
\.


--
-- PostgreSQL database dump complete
--

