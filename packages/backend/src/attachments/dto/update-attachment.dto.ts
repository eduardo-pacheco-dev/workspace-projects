import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateAttachmentDto {
  @IsOptional()
  @IsString()
  originalName?: string;

  @IsOptional()
  @IsInt()
  folderId?: number | null;
}
