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
  pr.rates_count;