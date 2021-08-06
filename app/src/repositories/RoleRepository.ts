import { Role } from '../entities/Role'
import { CommonRepositoryInterface } from './CommonRepository'
import { RoleRepositoryInterface as UserServiceSocket } from '../services/UserService'
import { RoleRepositoryInterface as RoleServiceSocket } from '../services/RoleService'

import prisma from '../../prisma'

export const extractValidRoleIds = async (roleIds: number[])
  : Promise<number[]> => {
  const validRoles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
    },
  })
  return validRoles.map(validRole => validRole.id)
}

export const fetchAll = async (page = 0, order: any = 'asc')
  : Promise<Role[]> => {
  const skipIndex = page > 1 ? (page - 1) * 10 : 0
  const limit = 10
  return prisma.role.findMany({
    skip: skipIndex,
    orderBy: { id: order },
    take: limit,
  })
}

export const totalCount = async (): Promise<number> => prisma.role.count()

export const fetch = async (id: number): Promise<Role | null> => prisma.role.findUnique({
  where: { id },
})

export const fetchBySlug = async (slug: string): Promise<Role | null> => prisma.role.findUnique({ where: { slug } })

export const insertRole = async (name: string, description: string, slug: string)
: Promise<Role> => prisma.role.create({ data: { name, description, slug } })

export const updateRole = async (id: number, name: string, description: string, slug: string)
: Promise<Role> => prisma.role.update({
  where: { id },
  data: {
    name, description, slug,
  },
})

export const deleteRole = async (id: number): Promise<Role> => prisma.role.delete({ where: { id } })

const RoleRepository:CommonRepositoryInterface<Role> & UserServiceSocket & RoleServiceSocket = {
  extractValidRoleIds,
  fetchAll,
  totalCount,
  fetch,
  fetchBySlug,
  insertRole,
  updateRole,
  deleteRole,
}

export default RoleRepository
