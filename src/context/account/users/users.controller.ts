import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ParseBooleanPipe } from 'src/app.pipe';
import { CreateUserDto } from './users.dto';

@Controller('/account/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('sign-in')
  signIn(@Body('id') id: string) {
    console.log(id);
    return this.usersService.signIn(id);
  }

  @Get('test') test(@Query('withError', ParseBooleanPipe) withError?: boolean) {
    return this.usersService.test(withError);
  }
}
