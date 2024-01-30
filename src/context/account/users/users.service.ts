import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, sign } from 'jsonwebtoken';
import { ROLE, TOKEN_TYPE } from '../account.constant';
import { Exception, ExceptionCode } from 'src/app.exception';
import { CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { id, nickname } = createUserDto;
    await this.barrier_userIdMustBeUnique(id);

    const user = await this.prismaService.user.create({
      data: { id, nickname },
    });

    const accessToken = await this.createAccessToken(user);

    return { accessToken };
  }

  async signIn(id: string) {
    let user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new Exception(ExceptionCode.NotFound);
    }
    const accessToken = await this.createAccessToken(user);

    return { accessToken };
  }

  private async barrier_userIdMustBeUnique(id: string) {
    const isUnique = !(await this.prismaService.user.findUnique({
      where: { id },
    }));

    if (!isUnique) throw new Exception(ExceptionCode.AlreadyUsedValue);
  }

  async test(withError?: boolean) {
    if (withError) throw new Exception(ExceptionCode.BadRequest, 'test error');
    return 'success';
  }

  async createAccessToken(user: Pick<User, 'id'>): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      role: ROLE.USER,
      type: TOKEN_TYPE.ACCESS_TOKEN,
    };
    const secret = process.env.JWT_SECRET;
    const expiresIn = '2d';

    if (!secret) throw new Exception(ExceptionCode.NotFound);

    const accessToken: string = sign(payload, secret, { expiresIn });

    return accessToken;
  }
}
