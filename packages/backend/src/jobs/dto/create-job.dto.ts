import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsIn,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { CronExpressionParser } from 'cron-parser';

export const JOB_STATUS = ['ativo', 'inativo', 'executando'] as const;

export function IsValidCron(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isValidCron',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          try {
            CronExpressionParser.parse(value);
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} deve ser uma expressão cron válida`;
        },
      },
    });
  };
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O tipo é obrigatório' })
  tipo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsString()
  @IsNotEmpty({ message: 'A expressão cron é obrigatória' })
  @IsValidCron()
  cronExpression: string;

  @IsOptional()
  @IsIn(JOB_STATUS)
  status?: string;
}