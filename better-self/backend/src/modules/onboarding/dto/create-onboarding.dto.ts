import {
  IsEnum,
  IsString,
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { Niche } from '../../../types/niche.enum';
import { Severity } from '../../../types/severity.enum';
import { PainPoint } from '../../../types/pain-point.enum';
import { HealthyHabit } from '../../../types/healthy-habit.enum';

export class CreateOnboardingDto {
  @IsEnum(Niche)
  @IsNotEmpty()
  niche: Niche;

  @IsString()
  @IsNotEmpty()
  addiction: string;

  @IsEnum(Severity)
  @IsNotEmpty()
  severity: Severity;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(PainPoint, { each: true })
  painPoints: PainPoint[];

  @IsEnum(HealthyHabit)
  @IsNotEmpty()
  healthyHabit: HealthyHabit;
}
