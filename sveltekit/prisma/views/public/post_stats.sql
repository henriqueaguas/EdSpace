WITH max_counts AS (
  SELECT
    (
      SELECT
        count(post_view.post_id) AS max_views_count
      FROM
        post_view
      GROUP BY
        post_view.post_id
      ORDER BY
        (count(post_view.post_id)) DESC
      LIMIT
        1
    ) AS max_views_count,
    (
      SELECT
        count(post_rating.post_id) AS max_rates_count
      FROM
        post_rating
      GROUP BY
        post_rating.post_id
      ORDER BY
        (count(post_rating.post_id)) DESC
      LIMIT
        1
    ) AS max_rates_count
)
SELECT
  row_number() OVER (
    ORDER BY
      t.score DESC
  ) AS ranking_position,
  t.id,
  t.title,
  t.description,
  t.difficulty,
  t.author_id,
  t.created_at,
  t.avg_rating,
  t.views_count,
  t.rates_count,
  t.score,
  t.topics
FROM
  (
    SELECT
      p.id,
      p.title,
      p.description,
      p.difficulty,
      p.author_id,
      p.created_at,
      round(COALESCE(pr.avg_rating, (0) :: numeric), 2) AS avg_rating,
      COALESCE(pv.views_count, (0) :: bigint) AS views_count,
      COALESCE(pr.rates_count, (0) :: bigint) AS rates_count,
      COALESCE(
        (
          (
            (
              (pv.views_count) :: double precision / (
                NULLIF(
                  (
                    SELECT
                      max_counts.max_views_count
                    FROM
                      max_counts
                  ),
                  0
                )
              ) :: double precision
            ) * (0.3) :: double precision
          ) + (
            (
              (
                (
                  (pr.avg_rating) :: double precision / (5) :: double precision
                ) * (0.4) :: double precision
              ) * (
                (pr.rates_count) :: double precision / (
                  NULLIF(
                    (
                      SELECT
                        max_counts.max_rates_count
                      FROM
                        max_counts
                    ),
                    0
                  )
                ) :: double precision
              )
            ) * (0.3) :: double precision
          )
        ),
        (0) :: double precision
      ) AS score,
      COALESCE(
        (
          SELECT
            array_agg(COALESCE(pt_1.topic_id, '' :: text)) AS topics
          FROM
            post_topic pt_1
          WHERE
            (pt_1.post_id = p.id)
          GROUP BY
            pt_1.post_id
        ),
        (ARRAY [] :: character varying []) :: text []
      ) AS topics
    FROM
      (
        (
          (
            post p
            LEFT JOIN (
              SELECT
                pv_1.post_id,
                count(pv_1.post_id) AS views_count
              FROM
                post_view pv_1
              GROUP BY
                pv_1.post_id
            ) pv ON ((pv.post_id = p.id))
          )
          LEFT JOIN (
            SELECT
              pr_1.post_id,
              avg(pr_1.rating) AS avg_rating,
              count(pr_1.post_id) AS rates_count
            FROM
              post_rating pr_1
            GROUP BY
              pr_1.post_id
          ) pr ON ((pr.post_id = p.id))
        )
        LEFT JOIN post_topic pt ON ((pt.post_id = p.id))
      )
    GROUP BY
      p.id,
      pr.avg_rating,
      pv.views_count,
      pr.rates_count
    ORDER BY
      COALESCE(
        (
          (
            (
              (pv.views_count) :: double precision / (
                NULLIF(
                  (
                    SELECT
                      max_counts.max_views_count
                    FROM
                      max_counts
                  ),
                  0
                )
              ) :: double precision
            ) * (0.3) :: double precision
          ) + (
            (
              (
                (
                  (pr.avg_rating) :: double precision / (5) :: double precision
                ) * (0.4) :: double precision
              ) * (
                (pr.rates_count) :: double precision / (
                  NULLIF(
                    (
                      SELECT
                        max_counts.max_rates_count
                      FROM
                        max_counts
                    ),
                    0
                  )
                ) :: double precision
              )
            ) * (0.3) :: double precision
          )
        ),
        (0) :: double precision
      ) DESC
  ) t;