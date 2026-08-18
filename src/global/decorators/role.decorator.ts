import { SetMetadata } from '@nestjs/common';
import { Role as PrismaRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Role = (...roles: PrismaRole[]) => SetMetadata(ROLES_KEY, roles);
