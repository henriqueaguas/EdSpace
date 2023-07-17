Filters to be applied to database operation outputs to make sure the returned types are what we expect. Only create schemas for the models which contain sensitive information or data with types we need to convert.

Ex: Table user contains sensitive information like the user email, it should not be sent to clients when they request another user details, for example.
