import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';
import { User } from 'src/decorators/user.decorator';
import { User as TUser } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from '../account.constant';

@Controller('/account/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('test')
  getTest() {
    return { updateDate: '0311' };
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('sign-in')
  signIn(@Body('id') id: string) {
    return this.usersService.signIn(id);
  }

  @Get('me')
  @Roles(ROLE.USER)
  getMe(@User() user: TUser) {
    return this.usersService.getMe(user);
  }

  @Put()
  @Roles(ROLE.USER)
  updateUser(@User() user: TUser, @Body('nickname') nickname: string) {
    return this.usersService.updateUser(user, nickname);
  }

  @Post('withdraw')
  @Roles(ROLE.USER)
  withdrawApproval(@User() user: TUser) {
    return this.usersService.withdrawApproval(user);
  }
}
