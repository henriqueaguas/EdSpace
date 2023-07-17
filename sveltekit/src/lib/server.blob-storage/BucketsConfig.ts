export type IStorageBucketsConfig = Record<
  "postPages" | "profilePictures",
  {
    name: string;
    itemsCacheControl: string;
  }
>;

export const StorageBucketsConfig: IStorageBucketsConfig = {
  postPages: {
    name: "edspace-post-pages",
    itemsCacheControl: "public, max-age=3600",
  },
  profilePictures: {
    name: "edspace-profile-pictures",
    itemsCacheControl: "no-store",
  },
};
