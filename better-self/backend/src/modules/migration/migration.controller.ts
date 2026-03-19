import { Controller, Post, Body } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { MigrateLocalStorageDto } from './dto/migrate-localstorage.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post('import-localStorage')
  async importLocalStorage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() migrateDto: MigrateLocalStorageDto,
  ) {
    return this.migrationService.importLocalStorage(user.id, migrateDto);
  }
}
