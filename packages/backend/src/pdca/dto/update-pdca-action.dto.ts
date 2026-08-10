import { PartialType } from '@nestjs/mapped-types';
import { CreatePdcaActionDto } from './create-pdca-action.dto';

export class UpdatePdcaActionDto extends PartialType(CreatePdcaActionDto) {}
