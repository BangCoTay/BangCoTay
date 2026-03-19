import { IsObject, IsArray, IsOptional } from 'class-validator';

type GenericRecord = Record<string, unknown>;

export class MigrateLocalStorageDto {
  @IsObject()
  @IsOptional()
  onboardingData?: GenericRecord;

  @IsObject()
  @IsOptional()
  userProgress?: GenericRecord;

  @IsArray()
  @IsOptional()
  plan?: GenericRecord[];

  @IsArray()
  @IsOptional()
  chatMessages?: GenericRecord[];

  @IsArray()
  @IsOptional()
  quotes?: GenericRecord[];
}
