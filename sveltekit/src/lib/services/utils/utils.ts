import type { IDataStorageInTransaction } from "$lib/server.data-storage/IDataStorage";
import type { ResultWithPaging } from "$lib/utils/Paging";

export async function AmIFollowingTopic(
  ds: IDataStorageInTransaction,
  topicObj: ttopic.TopicStats,
  myUserId?: string,
): Promise<ttopic.TopicStatsMy> {
  if (!myUserId) {
    (topicObj as ttopic.TopicStatsMy).am_i_following = false;
    return topicObj as ttopic.TopicStatsMy;
  }

  (topicObj as ttopic.TopicStatsMy).am_i_following = await ds.topicStats
    .areFollowedBy(
      [topicObj.id],
      myUserId,
    ).then((ts) => ts.following.includes(topicObj.id));

  return (topicObj as ttopic.TopicStatsMy);
}

export async function AmIFollowingTopics(
  ds: IDataStorageInTransaction,
  topicObjs: ttopic.TopicStats[],
  myUserId?: string,
): Promise<ttopic.TopicStatsMy[]> {
  if (!myUserId) {
    topicObjs.forEach((ts) =>
      (ts as ttopic.TopicStatsMy).am_i_following = false
    );
    return topicObjs as ttopic.TopicStatsMy[];
  }

  const following = await ds.topicStats.areFollowedBy(
    topicObjs.map((t) => t.id),
    myUserId,
  ).then((tss) => tss.following);

  topicObjs.forEach((topicObj) => {
    (topicObj as any).am_i_following = following.includes(topicObj.id);
  });

  return topicObjs as ttopic.TopicStatsMy[];
}

export async function AmIFollowingTopicsPaging(
  ds: IDataStorageInTransaction,
  topicObjs: ResultWithPaging<ttopic.TopicStats>,
  myUserId?: string,
): Promise<ResultWithPaging<ttopic.TopicStatsMy>> {
  if (!myUserId) {
    topicObjs.data.forEach((ts) =>
      (ts as ttopic.TopicStatsMy).am_i_following = false
    );
    return topicObjs as ResultWithPaging<ttopic.TopicStatsMy>;
  }

  const following = await ds.topicStats.areFollowedBy(
    topicObjs.data.map((t) => t.id),
    myUserId,
  ).then((tss) => tss.following);

  topicObjs.data.forEach((topicObj) => {
    (topicObj as any).am_i_following = following.includes(topicObj.id);
  });

  return topicObjs as ResultWithPaging<ttopic.TopicStatsMy>;
}

export async function AmIFollowingUser(
  ds: IDataStorageInTransaction,
  userObj: tuser.UserPublicStats,
  myUserId?: string,
): Promise<tuser.UserPublicStatsMy> {
  if (!myUserId) {
    (userObj as tuser.UserPublicStatsMy).am_i_following = false;
    return userObj as tuser.UserPublicStatsMy;
  }

  (userObj as tuser.UserPublicStatsMy).am_i_following = await ds.userStats
    .areFollowedBy(
      [userObj.id],
      myUserId,
    ).then((res) => res.following.includes(userObj.id));

  return (userObj as tuser.UserPublicStatsMy);
}

export async function AmIFollowingUsers(
  ds: IDataStorageInTransaction,
  userObjs: tuser.UserPublicStats[],
  myUserId?: string,
): Promise<tuser.UserPublicStatsMy[]> {
  if (!myUserId) {
    userObjs.forEach((ts) =>
      (ts as tuser.UserPublicStatsMy).am_i_following = false
    );
    return userObjs as tuser.UserPublicStatsMy[];
  }

  const following = await ds.userStats.areFollowedBy(
    userObjs.map((u) => u.id),
    myUserId,
  ).then((res) => res.following);

  userObjs.forEach((uobj) => {
    (uobj as any).am_i_following = following.includes(uobj.id);
  });

  return userObjs as tuser.UserPublicStatsMy[];
}

export async function AmIFollowingUsersPaging(
  ds: IDataStorageInTransaction,
  userObjs: ResultWithPaging<tuser.UserPublicStats>,
  myUserId?: string,
): Promise<ResultWithPaging<tuser.UserPublicStatsMy>> {
  if (!myUserId) {
    userObjs.data.forEach((ts) =>
      (ts as tuser.UserPublicStatsMy).am_i_following = false
    );
    return userObjs as ResultWithPaging<tuser.UserPublicStatsMy>;
  }

  const following = await ds.userStats.areFollowedBy(
    userObjs.data.map((u) => u.id),
    myUserId,
  ).then((res) => res.following);

  userObjs.data.forEach((uobj) => {
    (uobj as any).am_i_following = following.includes(uobj.id);
  });

  return userObjs as ResultWithPaging<tuser.UserPublicStatsMy>;
}

export async function PostMyInfo(
  ds: IDataStorageInTransaction,
  post: tpost.PostStats,
  myUserId?: string,
): Promise<tpost.PostMyInfo> {
  if (!myUserId) {
    return {
      ...post,
      i_read: null,
      i_saved: null,
      i_rated: null,
    } satisfies tpost.PostMyInfo;
  }

  const myInfo = await ds.postStats.getPostMyInfo(post.id, myUserId)

  return {
    ...post,
    ...myInfo
  }
}
