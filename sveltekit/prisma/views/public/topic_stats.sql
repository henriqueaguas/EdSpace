SELECT
  t.id,
  COALESCE(pt.posts_count, (0) :: bigint) AS posts_count,
  COALESCE(tf.followers_count, (0) :: bigint) AS followers_count
FROM
  (
    (
      topic t
      LEFT JOIN (
        SELECT
          post_topic.topic_id,
          count(*) AS posts_count
        FROM
          post_topic
        GROUP BY
          post_topic.topic_id
      ) pt ON ((pt.topic_id = t.id))
    )
    LEFT JOIN (
      SELECT
        tft.topic_id,
        count(*) AS followers_count
      FROM
        topic_follow tft
      GROUP BY
        tft.topic_id
    ) tf ON ((tf.topic_id = t.id))
  );