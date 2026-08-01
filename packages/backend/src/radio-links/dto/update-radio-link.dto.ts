import { PartialType } from '@nestjs/mapped-types';
import { CreateRadioLinkDto } from './create-radio-link.dto';

export class UpdateRadioLinkDto extends PartialType(CreateRadioLinkDto) {}
