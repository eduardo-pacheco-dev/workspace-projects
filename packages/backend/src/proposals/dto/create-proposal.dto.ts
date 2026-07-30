import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProposalDto {
  @IsNumber()
  jobId: number;

  @IsNumber()
  freelancerId: number;

  @IsString()
  coverLetter: string;

  @IsNumber()
  @Min(0)
  proposedRate: number;

  @IsString()
  estimatedDuration: string;

  @IsOptional()
  @IsString()
  status?: string;
}
