import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsInt()
  folderId?: number | null;
}
