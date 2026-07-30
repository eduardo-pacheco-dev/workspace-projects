import { PartialType } from '@nestjs/mapped-types';
import { CreateLpuDto } from './create-lpu.dto';

export class UpdateLpuDto extends PartialType(CreateLpuDto) {}
