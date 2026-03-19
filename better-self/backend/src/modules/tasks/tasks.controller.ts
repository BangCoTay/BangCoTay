import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(
    @CurrentUser() user: AuthenticatedUser,
    @Query('dayNumber', new ParseIntPipe({ optional: true }))
    dayNumber?: number,
    @Query('completed', new ParseBoolPipe({ optional: true }))
    completed?: boolean,
  ) {
    return this.tasksService.getTasks(user.id, dayNumber, completed);
  }

  @Post(':taskId/complete')
  async completeTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.completeTask(user.id, taskId);
  }

  @Post(':taskId/uncomplete')
  async uncompleteTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.uncompleteTask(user.id, taskId);
  }
}
