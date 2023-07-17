WITH max_counts AS (
  SELECT
    count(*) AS max_followers_count
  FROM
    user_follow
  GROUP BY
    user_follow.user_id
  ORDER BY
    (count(*)) DESC
  LIMIT
    1
)
SELECT
  CASE
    WHEN (t.topics_user_publishes_on IS NOT NULL) THEN row_number() OVER (
      ORDER BY
        t.score DESC
    )
    ELSE NULL :: bigint
  END AS ranking_position,
  t.id,
  t.name,
  t.email,
  t."emailVerified",
  t.image,
  t."signupComplete",
  t.created_at,
  t.name_updated_at,
  t.image_updated_at,
  t.topics_user_publishes_on,
  t.posts_published,
  t.avg_post_score,
  t.avg_post_rating,
  t.followers_count,
  t.score
FROM
  (
    SELECT
      u.id,
      u.name,
      u.email,
      u."emailVerified",
      u.image,
      u."signupComplete",
      u.created_at,
      u.name_updated_at,
      u.image_updated_at,
      utopics.topics_user_publishes_on,
      count(ps.id) AS posts_published,
      (COALESCE(avg(ps.score), (0) :: double precision)) :: numeric AS avg_post_score,
      COALESCE(avg(ps.avg_rating), (0) :: numeric) AS avg_post_rating,
      (
        SELECT
          count(*) AS count
        FROM
          user_follow
        WHERE
          (user_follow.user_id = u.id)
      ) AS followers_count,
      COALESCE(
        (
          (avg(ps.score) * (0.8) :: double precision) + (
            (
              (
                (
                  SELECT
                    count(*) AS count
                  FROM
                    user_follow
                  WHERE
                    (user_follow.user_id = u.id)
                )
              ) :: double precision / (
                NULLIF(
                  (
                    SELECT
                      max_counts.max_followers_count
                    FROM
                      max_counts
                  ),
                  0
                )
              ) :: double precision
            ) * (0.2) :: double precision
          )
        ),
        (0) :: double precision
      ) AS score
    FROM
      (
        (
          "user" u
          LEFT JOIN post_stats ps ON ((ps.author_id = u.id))
        )
        LEFT JOIN (
          SELECT
            u_1.id AS user_id,
            array_agg(DISTINCT uts.alltopics) AS topics_user_publishes_on
          FROM
            (
              "user" u_1
              JOIN (
                SELECT
                  ps_1.author_id,
                  unnest(ps_1.topics) AS alltopics
                FROM
                  post_stats ps_1
              ) uts ON ((uts.author_id = u_1.id))
            )
          GROUP BY
            u_1.id
        ) utopics ON ((utopics.user_id = u.id))
      )
    GROUP BY
      u.id,
      utopics.topics_user_publishes_on
    ORDER BY
      COALESCE(
        (
          (avg(ps.score) * (0.8) :: double precision) + (
            (
              (
                (
                  SELECT
                    count(*) AS count
                  FROM
                    user_follow
                  WHERE
                    (user_follow.user_id = u.id)
                )
              ) :: double precision / (
                NULLIF(
                  (
                    SELECT
                      max_counts.max_followers_count
                    FROM
                      max_counts
                  ),
                  0
                )
              ) :: double precision
            ) * (0.2) :: double precision
          )
        ),
        (0) :: double precision
      ) DESC
  ) t;