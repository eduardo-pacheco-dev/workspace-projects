import { PartialType } from '@nestjs/mapped-types';
import { CreatePdcaDto } from './create-pdca.dto';

export class UpdatePdcaDto extends PartialType(CreatePdcaDto) {}
