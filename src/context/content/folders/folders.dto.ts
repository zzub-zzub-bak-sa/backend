export interface CreateFolderDto {
  name: string;
  assetType?: number;
}

export type UpdateFolderDto = Partial<CreateFolderDto>;
