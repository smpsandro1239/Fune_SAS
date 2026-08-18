import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { DraftsService } from './drafts.service';

@Controller('drafts')
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.draftsService.findAll(req.user.agencyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.draftsService.findOne(id, req.user.agencyId);
  }

  @Post()
  create(@Body() body: { name: string; layoutStyle: string; data: any }, @Request() req: any) {
    return this.draftsService.create(body, req.user.agencyId, req.user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; layoutStyle?: string; data?: any }, @Request() req: any) {
    return this.draftsService.update(id, body, req.user.agencyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.draftsService.remove(id, req.user.agencyId);
  }
}
