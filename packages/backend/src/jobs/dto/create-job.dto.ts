import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsIn(['hourly', 'fixed'])
  budgetType: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsIn(['junior', 'mid', 'senior', 'lead'])
  experienceLevel?: string;

  @IsOptional()
  @IsIn(['open', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsString()
  clientId: string;
}
