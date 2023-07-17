/* AuthJS Tables */

create extension if not exists "uuid-ossp";

create table "user" (
	/* authjs attributes */
    "id" text not null default uuid_generate_v4() primary key,
    "name" text not null unique default 'anonymous',
    "email" text not null, /* is unique. constraint defined below */
    "emailVerified" timestamp(3),
	  "image" text,
	  "signupComplete" bool default false,
    
    "created_at" timestamp not null default current_timestamp,
    "name_updated_at" timestamp default null,
    "image_updated_at" timestamp default null
);

create table account (
    "id" text default uuid_generate_v4() primary key,
    "userId" text not null,
    "type" text not null,
    "provider" text not null,
    "providerAccountId" text not null,
    "refresh_token" text,
    "access_token" text,
    "expires_in" integer,
    "token_type" text,
    "scope" text,
    "id_token" text,
    "session_state" text,

    constraint "fk_user" foreign key ("userId") references "user"("id") on delete cascade on update cascade
);

create table session (
    "id" text default uuid_generate_v4() primary key,
    "sessionToken" text default uuid_generate_v4() not null,
    "userId" text not null,
    "expires" timestamp(3) not null,
    
    constraint "fk_user" foreign key ("userId") references "user"("id") on delete cascade on update cascade
);

create table "verificationToken" (
    "identifier" text not null,
    "token" text not null,
    "expires" timestamp(3) not null
);


create unique index "account_provider_provideraccountid_key" on account("provider", "providerAccountId");
create unique index "session_sessiontoken_key" on session("sessionToken");
create unique index "user_email_key" on "user"("email");
create unique index "verificationToken_token_key" on "verificationToken"("token");
create unique index "verificationToken_identifier_token_key" on "verificationToken"("identifier", "token");

/* Our Tables */

drop type if exists difficulty;
create type difficulty as enum ('easy', 'medium', 'advanced');

create table topic(
	"id" text not null primary key
);

create table post (
    "id" text not null default uuid_generate_v4() not null primary key,
    
    "title" text not null,
    "description" text default null,
    "difficulty" difficulty default null,
    "author_id" text not null,
    
    "created_at" timestamp not null default current_timestamp,
    
    constraint "fk_author" foreign key ("author_id") references "user"("id") on delete cascade
);

create table feed (
    "id" text not null default uuid_generate_v4() not null primary key,
   
    "owner_id" text not null,
    "position" int not null default 0,
	"name" text not null,
    
    "created_at" timestamp not null default current_timestamp,
    "updated_at" timestamp default null,
    
    constraint "fk_author" foreign key ("owner_id") references "user"("id") on delete cascade
);

/* N to N */
create table feed_author(
	"feed_id" text not null,
	"author_id" text not null,
	
	constraint "fk_feed" foreign key ("feed_id") references "feed"("id") on delete cascade,
	constraint "fk_author" foreign key ("author_id") references "user"("id") on delete cascade,

	constraint "pk_feed_authors" primary key ("feed_id", "author_id")
);

create table feed_topic(
	"feed_id" text not null,
	"topic_id" text not null,
	
	constraint "fk_feed" foreign key ("feed_id") references "feed"("id") on delete cascade,
	constraint "fk_topic" foreign key ("topic_id") references "topic"("id") on delete cascade,

	constraint "pk_feed_topics" primary key ("feed_id", "topic_id")
);

create table topic_follow(
	"topic_id" text not null,
	"follower_id" text not null,
	
	constraint "fk_topic" foreign key ("topic_id") references "topic"("id") on delete cascade,
	constraint "fk_user" foreign key ("follower_id") references "user"("id") on delete cascade,

	constraint "pk_topic_follow" primary key ("topic_id", "follower_id")
);


create table post_topic(
	"topic_id" text not null,
	"post_id" text not null,
	
	constraint "fk_post" foreign key ("post_id") references "post"("id") on delete cascade,
	constraint "fk_topic" foreign key ("topic_id") references "topic"("id") on delete cascade,

	constraint "pk_post_topic" primary key ("topic_id", "post_id")
);

create table post_view(
	"user_id" text not null,
	"post_id" text not null,
	
	constraint "fk_user" foreign key ("user_id") references "user"("id") on delete cascade,
	constraint "fk_post" foreign key ("post_id") references "post"("id") on delete cascade,
	
	constraint "pk_post_view" primary key ("user_id", "post_id")
);

create table saved_post(
	"user_id" text not null,
	"post_id" text not null,
	
	constraint "fk_user" foreign key ("user_id") references "user"("id") on delete cascade,
	constraint "fk_post" foreign key ("post_id") references "post"("id") on delete cascade,
	
	constraint "pk_saved_post" primary key ("user_id", "post_id")
);

create table user_follow (
    "user_id" text not null,
    "follower_id" text not null,
    
    constraint "fk_user" foreign key ("user_id") references "user"("id") on delete cascade,
  	constraint "fk_follower" foreign key ("follower_id") references "user"("id") on delete cascade,

    constraint "pk_user_follow" primary key ("user_id", "follower_id")
);

create table post_rating (
    "user_id" text not null,
    "post_id" text not null,
    
    "rating" integer not null check ("rating" >= 1 and "rating" <= 5) ,

    constraint "fk_user" foreign key ("user_id") references "user"("id") on delete cascade,
  	constraint "fk_post" foreign key ("post_id") references "post"("id") on delete cascade,
    
    constraint "pk_post_rating" primary key ("user_id", "post_id")
);

/* VIEWS */

/* Post Stats - Takes in consideration post ratings + post views + number of post rates */
create or replace view post_stats as
with max_counts as (
  select
    (select count(post_id) as max_views_count from post_view group by post_id order by count(post_id) desc limit 1) as max_views_count,
    (select count(post_id) as max_rates_count from post_rating group by post_id order by count(post_id) desc limit 1) as max_rates_count
)
select row_number() over (order by score desc) as ranking_position, t.* from (
	select
		p.*,
		round(coalesce(avg_rating, 0), 2)::numeric as avg_rating,
		coalesce(views_count, 0) as views_count,
		coalesce(rates_count, 0) as rates_count,
		/* Average rating of user posts */
		coalesce((
			/* Views Count Score - Takes in consideration the post with most views (protected from division by 0) */
			(
			views_count::float / nullif((select max_views_count from max_counts), 0)
			) * .3
			+
			/* Average Rating Score */
			(avg_rating::float / 5) * .4
			*
			/* Number of people that rated (protected from division by 0) */
			(
				rates_count::float / nullif((select max_rates_count from max_counts), 0)
			) * .3
		), 0) as score,
		coalesce (
	        (
	            select array_agg(coalesce(pt.topic_id, '')) as topics
	            from post_topic pt
	            where pt.post_id = p.id
	            group by pt.post_id
	        ),
	        array[]::varchar[]
	    ) AS topics
	from 
	post p
	left join (select pv.post_id, count(pv.post_id) as views_count from post_view pv group by pv.post_id) as pv 
		on pv.post_id = p.id
	left join (select pr.post_id, avg(pr.rating) as avg_rating, count(pr.post_id) as rates_count from post_rating pr group by pr.post_id) as pr
		on pr.post_id = p.id
	left join post_topic pt on pt.post_id = p.id
	group by id, pr.avg_rating, pv.views_count, pr.rates_count
	order by score desc
) t;

create or replace view user_stats as
with max_counts as (
  select count(*) as max_followers_count
  from user_follow
  group by user_id
  order by count(*) desc
  limit 1
)
select
  case
    when topics_user_publishes_on is not null then row_number() over (order by score desc)
  end as ranking_position,
  t.*
from (
  select
    u.*,
    utopics.topics_user_publishes_on,
    count(ps.id) as posts_published,
    coalesce(avg(ps.score), 0)::numeric as avg_post_score,
    coalesce(avg(ps.avg_rating), 0)::numeric as avg_post_rating,
    (select count(*) from user_follow where user_id = u.id) as followers_count,
    coalesce(
      avg(ps.score) * 0.8 +
      (
        /* followers count */
        (select count(*) from user_follow where user_id = u.id)::float /
        /* current max followers count (protected from division by 0) */
        nullif((select max_followers_count from max_counts), 0)
      ) * 0.2,
      0
    ) as score
  from "user" u
    left join post_stats ps on ps.author_id = u.id
    left join (
      select
        u.id as user_id,
        array_agg(distinct alltopics) as topics_user_publishes_on
      from "user" u
        join (
          select author_id, unnest(ps.topics) as alltopics
          from post_stats ps
        ) as uts on uts.author_id = u.id
      group by u.id
    ) as utopics on utopics.user_id = u.id
  group by u.id, topics_user_publishes_on
  order by score desc
) t;

/* Views with no scores */

/* NOTE: Not being used at the moment */
create or replace view post_stats_not_sorted as
select
	p.*,
	round(coalesce(avg_rating, 0), 2)::numeric as avg_rating,
	coalesce(views_count, 0) as views_count,
	coalesce(rates_count, 0) as rates_count,
	coalesce (
        (
            select array_agg(coalesce(pt.topic_id, '')) as topics
            from post_topic pt
            where pt.post_id = p.id
            group by pt.post_id
        ),
        array[]::varchar[]
    ) AS topics
from 
post p
left join (select pv.post_id, count(pv.post_id) as views_count from post_view pv group by pv.post_id) as pv 
	on pv.post_id = p.id
left join (select pr.post_id, avg(pr.rating) as avg_rating, count(pr.post_id) as rates_count from post_rating pr group by pr.post_id) as pr
	on pr.post_id = p.id
left join post_topic pt on pt.post_id = p.id
group by id, pr.avg_rating, pv.views_count, pr.rates_count;

create or replace view topic_stats as
select t.id,
   coalesce(pt.posts_count, 0) AS posts_count,
   coalesce(tf.followers_count, 0) AS followers_count
from topic t
left join  (
    select topic_id, count(*) as posts_count
    from post_topic
    group by topic_id
) pt on pt.topic_id = t.id
left join (
    select topic_id, count(*) as followers_count
    from topic_follow tft
 	 group by topic_id
) tf on tf.topic_id = t.id;

/* Optimizations through indexes */
create index idx_post_view_post_id on post_view (post_id);
create index idx_post_rating_post_id on post_rating (post_id);
create index idx_post_topic_post_id on post_topic (post_id);
