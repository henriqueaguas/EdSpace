# Performance gains on database queries

By introducing indexes in the column `post_id` of the tables post_view, post_rating and post_topic we went from ~200 ms p/ 200 results to ~45 ms on queries to the views `post_stats` and `user_stats`.
