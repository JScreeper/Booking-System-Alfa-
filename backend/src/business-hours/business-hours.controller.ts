import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessHoursService } from './business-hours.service';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums';

@ApiTags('Business Hours')
@Controller('business-hours')
export class BusinessHoursController {
  constructor(private readonly businessHoursService: BusinessHoursService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update business hours (Admin only)' })
  @ApiResponse({ status: 201, description: 'Business hours created/updated' })
  create(@Body() createDto: CreateBusinessHoursDto, @CurrentUser() user: any) {
    if (!user?.organizationId) {
      throw new Error('User organization not found');
    }
    return this.businessHoursService.create(createDto, user.organizationId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all business hours' })
  @ApiResponse({ status: 200, description: 'List of business hours' })
  findAll(@CurrentUser() user?: any) {
    const organizationId = user?.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.businessHoursService.findAll(organizationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business hours by ID' })
  @ApiResponse({ status: 200, description: 'Business hours found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    const organizationId = user?.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.businessHoursService.findOne(id, organizationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update business hours (Admin only)' })
  @ApiResponse({ status: 200, description: 'Business hours updated' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBusinessHoursDto, @CurrentUser() user: any) {
    if (!user?.organizationId) {
      throw new Error('User organization not found');
    }
    return this.businessHoursService.update(id, updateDto, user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete business hours (Admin only)' })
  @ApiResponse({ status: 200, description: 'Business hours deleted' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user?.organizationId) {
      throw new Error('User organization not found');
    }
    return this.businessHoursService.remove(id, user.organizationId);
  }
}
