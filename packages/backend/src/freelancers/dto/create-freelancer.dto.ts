import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
} from 'class-validator';

export class CreateFreelancerDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsOptional()
  @IsIn(['junior', 'mid', 'senior', 'lead'])
  experienceLevel?: string;

  @IsOptional()
  @IsIn(['available', 'busy', 'unavailable'])
  availability?: string;
}
