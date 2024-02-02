export interface CreatePostDto {
  folderId: number;
  url: string;
  tags: string[];
}

export interface UpdatePostDto {
  tags: string[];
}

export interface DeletePostsDto {
  postIds: number[];
}

export interface RestorePostsDto extends DeletePostsDto {}

export interface MovePostsDto extends DeletePostsDto {
  folderId: number;
}
