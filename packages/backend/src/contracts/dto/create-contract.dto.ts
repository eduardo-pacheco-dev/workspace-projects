import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateContractDto {
  @IsOptional()
  @IsNumber()
  proposalId?: number;

  @IsNumber()
  jobId: number;

  @IsNumber()
  freelancerId: number;

  @IsNumber()
  clientId: number;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsNumber()
  @Min(0)
  totalBudget: number;
}
