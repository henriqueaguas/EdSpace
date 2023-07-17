drop view if exists post_stats cascade;
drop view if exists user_stats cascade;
drop view if exists topic_stats cascade;

/* N to N relations */

drop table if exists topic_follow cascade;
drop table if exists post_topic cascade;
drop table if exists post_view cascade;
drop table if exists saved_post cascade;
drop table if exists user_follow cascade; 
drop table if exists post_rating cascade; 
drop table if exists feed_author cascade;
drop table if exists feed_topic cascade;

/* AuthJS tables */
drop table if exists account cascade;
drop table if exists session cascade;
drop table if exists "verificationToken" cascade;

/* Base Entities */
drop table if exists topic cascade;
drop table if exists post cascade;
drop table if exists "user" cascade;
drop table if exists feed cascade;

drop type if exists difficulty cascade;