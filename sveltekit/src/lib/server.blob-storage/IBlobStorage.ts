export interface IBlobStorage {
  getPostPages(postId: string): Promise<tpost.PostPage[] | null>;
  uploadPostPages(postId: string, pages: Blob[]): Promise<tpost.PostPage[]>;
  deletePostPages(postId: string): Promise<void>;

  getProfilePictureUrl(userId: string): string;
  uploadProfilePicture(userId: string, image: Blob): Promise<string>;

  clearAll: () => Promise<void>;
}

export type BucketNames = {
  profilePictures: string;
  postPages: string;
};
