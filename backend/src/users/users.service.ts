import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser) {
    return this.prisma.user.findMany({
      where: { agencyId: user.agencyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const found = await this.prisma.user.findFirst({
      where: { id, agencyId: user.agencyId },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!found) throw new NotFoundException('Utilizador não encontrado.');
    return found;
  }

  async create(user: AuthenticatedUser, dto: CreateUserDto) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas o administrador pode criar utilizadores.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new BadRequestException('Já existe um utilizador com este email.');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        agencyId: user.agencyId,
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateUserDto) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas o administrador pode editar utilizadores.');
    }

    const existing = await this.prisma.user.findFirst({
      where: { id, agencyId: user.agencyId },
    });
    if (!existing) throw new NotFoundException('Utilizador não encontrado.');

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });
  }

  async remove(user: AuthenticatedUser, id: string) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas o administrador pode remover utilizadores.');
    }
    if (user.id === id) {
      throw new BadRequestException('Não pode remover a sua própria conta.');
    }
    const existing = await this.prisma.user.findFirst({
      where: { id, agencyId: user.agencyId },
    });
    if (!existing) throw new NotFoundException('Utilizador não encontrado.');

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
