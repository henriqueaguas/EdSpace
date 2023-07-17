# EdSpace API Documentation

## HTTP Error Format
```typescript
{
  "name": "string",
  "message": "string",
  "fieldErrors?": "FieldErrors"
}
```


## Authentication

### Via the HTTP Cookie Header
`Cookie: next-auth.session-token=<session_token>;`


## Notes
- In the API routes, parts inside square brackets are path variables. (Ex: /users/[id])
- The types used in this document are Typescript types and any non-primitive types are defined inside `src/app.d.ts`

<br>

<hr>
<br>

# **Feeds**
 ## `POST` /feeds
- ### Autentication Required

- ### Body (JSON) 
 ```typescript
{
  "name": "string",
  "topics?": "string[]",
  "authors?": "string[]"
}
```

- ### Response Body
 ```typescript
tfeed.Feed
```

<hr>

<br>

 ## `GET` /feeds
- ### Autentication Required

- ### Response Body
 ```typescript
tfeed.Feed[]
```

<hr>

<br>

 ## `GET` /feeds/home
- ### Autentication Required

- ### Query Parameters
 ```typescript
{
  "topics?": "string[]",
  "authors?": "string[]"
}
```

- ### Response Body
 ```typescript
tpost.PostStats[]
```

<hr>

<br>

 ## `GET` /feeds/[id]
- ### Autentication Required

- ### Response Body
 ```typescript
{
    feed: tfeed.Feed;
    topics: ttopic.TopicStats[];
    authors: tuser.UserPublicStats[];
  }
```

<hr>

<br>

 ## `DELETE` /feeds/[id]
- ### Autentication Required

- ### Response Body
 ```typescript
void
```

<hr>

<br>

 ## `PATCH` /feeds/[id]
- ### Autentication Required

- ### Body (JSON) 
 ```typescript
{
  "name?": "string",
  "topics?": "string[]",
  "authors?": "string[]"
}
```

- ### Response Body
 ```typescript
svct.outputs.feed.Update
```

<hr>

<br>

 ## `GET` /feeds/[id]/posts
- ### Autentication Required

- ### Response Body
 ```typescript
tpost.PostStats[] | null
```

<hr>

<br>

 ## `POST` /feeds/[id]/swap
- ### Autentication Required

- ### Body (JSON) 
 ```typescript
{
  "otherFeedId": "string"
}
```

<hr>

<br>

# **Me**
 ## `GET` /me
- ### Autentication Required

- ### Response Body
 ```typescript
tuser.UserPrivateStats
```

<hr>

<br>

 ## `DELETE` /me
- ### Autentication Required

- ### Response Body
 ```typescript
string
```

<hr>

<br>

 ## `PATCH` /me
- ### Autentication Required

- ### Body (FormData) 
`Files can be uploaded as values of keys with 'file' in their name`

```typescript
{
  "name?": "string"
}
```

<hr>

<br>

 ## `GET` /me/savedPosts
- ### Autentication Required

- ### Response Body
 ```typescript
ResultWithPaging<tpost.PostStats>
```

<hr>

<br>

 ## `POST` /me/savedPosts
- ### Autentication Required

- ### Body (JSON) 
 ```typescript
{
  "post_id": "string"
}
```

- ### Response Body
 ```typescript
void
```

<hr>

<br>

 ## `DELETE` /me/savedPosts
- ### Autentication Required

- ### Body (JSON) 
 ```typescript
{
  "post_id": "string"
}
```

- ### Response Body
 ```typescript
void
```

<hr>

<br>

 ## `GET` /me/signupCompleted
- ### Autentication Required

- ### Response Body
 ```typescript
boolean
```

<hr>

<br>

 ## `POST` /me/signupCompleted
- ### Autentication Required

- ### Response Body
 ```typescript
void
```

<hr>

<br>

# **Posts**
 ## `POST` /posts
- ### Autentication Required

- ### Body (FormData) 
`Files can be uploaded as values of keys with 'file' in their name`

```typescript
{
  "title": "string",
  "description?": "string",
  "difficulty?": "tpost.Difficulty",
  "topics": "string[]"
}
```

- ### Response Body
 ```typescript
string
```

<hr>

<br>

 ## `GET` /posts
- ### Query Parameters
 ```typescript
{
  "q?": "string",
  "skip?": "number",
  "take?": "number",
  "hasTopics?": "string[]",
  "difficulty?": "string"
}
```

- ### Response Body
 ```typescript
ResultWithPaging<tpost.PostStats>
```

<hr>

<br>

 ## `GET` /posts/trending
- ### Query Parameters
 ```typescript
{
  "timing": "string",
  "topics?": "string[]"
}
```

- ### Response Body
 ```typescript
tpost.PostStats[]
```

<hr>

<br>

 ## `GET` /posts/[id]
- ### Query Parameters
 ```typescript
{
  "pages?": "boolean"
}
```

- ### Response Body
 ```typescript
svct.outputs.post.ById<"no-pages">
```

<hr>

<br>

 ## `DELETE` /posts/[id]
- ### Autentication Required

- ### Response Body
 ```typescript
string
```

<hr>

<br>

 ## `POST` /posts/[id]/rate
- ### Autentication Required

- ### Body (JSON) 
 ```typescript
{
  "rating": "number"
}
```

- ### Response Body
 ```typescript
void
```

<hr>

<br>

 ## `POST` /posts/[id]/view
- ### Autentication Required

- ### Response Body
 ```typescript
void
```

<hr>

<br>

# **Topics**
 ## `GET` /topics
- ### Query Parameters
 ```typescript
{
  "q?": "string",
  "skip?": "number",
  "take?": "number"
}
```

- ### Response Body
 ```typescript
ResultWithPaging<ttopic.TopicStatsMy>
```

<hr>

<br>

 ## `GET` /topics/random
- ### Autentication Required

- ### Response Body
 ```typescript
ttopic.TopicStats[]
```

<hr>

<br>

 ## `GET` /topics/[id]
- ### Response Body
 ```typescript
ttopic.TopicStatsMy
```

<hr>

<br>

 ## `POST` /topics/[id]/follow
- ### Autentication Required

- ### Response Body
 ```typescript
void
```

<hr>

<br>

 ## `GET` /topics/[id]/topAuthors
- ### Response Body
 ```typescript
tuser.UserPublicStatsMy[]
```

<hr>

<br>

 ## `POST` /topics/[id]/unfollow
- ### Autentication Required

- ### Response Body
 ```typescript
void
```

<hr>

<br>

# **Users**
 ## `POST` /users
- ### Body (JSON) 
 ```typescript
{
  "name": "string",
  "email": "string"
}
```

- ### Response Body
 ```typescript
string
```

<hr>

<br>

 ## `GET` /users
- ### Query Parameters
 ```typescript
{
  "q": "string",
  "skip?": "number",
  "take?": "number",
  "topics?": "string[]"
}
```

- ### Response Body
 ```typescript
ResultWithPaging<tuser.UserPublicStatsMy>
```

<hr>

<br>

 ## `GET` /users/ranking
- ### Query Parameters
 ```typescript
{
  "topicId?": "string",
  "skip?": "number",
  "take?": "number"
}
```

- ### Response Body
 ```typescript
ResultWithPaging<tuser.UserPublicStatsMy>
```

<hr>

<br>

 ## `GET` /users/topAuthors
- ### Autentication Required

- ### Query Parameters
 ```typescript
{
  "topics": "string[]"
}
```

- ### Response Body
 ```typescript
tuser.UserPublicStats[]
```

<hr>

<br>

 ## `GET` /users/[id]
- ### Response Body
 ```typescript
tuser.UserPublicStatsMy
```

<hr>

<br>

 ## `POST` /users/[id]/follow
- ### Autentication Required

- ### Response Body
 ```typescript
void
```

<hr>

<br>

 ## `GET` /users/[id]/followers
- ### Query Parameters
 ```typescript
{
  "skip?": "number",
  "take?": "number"
}
```

- ### Response Body
 ```typescript
ResultWithPaging<tuser.UserPublicStatsMy>
```

<hr>

<br>

 ## `GET` /users/[id]/follows
- ### Query Parameters
 ```typescript
{
  "skip?": "number",
  "take?": "number"
}
```

- ### Response Body
 ```typescript
ResultWithPaging<tuser.UserPublicStatsMy>
```

<hr>

<br>

 ## `GET` /users/[id]/posts
- ### Query Parameters
 ```typescript
{
  "skip?": "number",
  "take?": "number"
}
```

- ### Response Body
 ```typescript
ResultWithPaging<tpost.PostStats>
```

<hr>

<br>

 ## `GET` /users/[id]/topicsFollowed
- ### Response Body
 ```typescript
ResultWithPaging<ttopic.TopicStatsMy>
```

<hr>

<br>

 ## `POST` /users/[id]/unfollow
- ### Autentication Required

- ### Response Body
 ```typescript
void
```

<hr>

<br>

