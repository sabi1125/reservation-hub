import { Prisma } from '@prisma/client'
import prisma from '../../prisma'
import { CommonRepositoryInterface } from './CommonRepository'
import { Female, Gender, User } from '../entities/User'
import { Role } from '../entities/Role'
import { UserRepositoryInterface as UserServiceSocket } from '../services/UserService'
import { UserRepositoryInterface as AuthServiceSocket } from '../services/AuthService'

const userWithProfileAndOAuthIdsAndRoles = Prisma.validator<Prisma.UserArgs>()(
  { include: { profile: true, oAuthIds: true, roles: { include: { role: true } } } },
)

type userWithProfileAndOAuthIdsAndRoles = Prisma.UserGetPayload<typeof userWithProfileAndOAuthIdsAndRoles>

type userRoles = {
  id: number,
  userId: number,
  roleId: number,
  role: Role
}

export const reconstructUser = (user: userWithProfileAndOAuthIdsAndRoles): User => ({
  id: user.id,
  email: user.email,
  username: user.username ?? null,
  password: user.password,
  oAuthIds: user.oAuthIds ? {
    id: user.oAuthIds.id,
    googleId: user.oAuthIds.googleId,
    facebookId: user.oAuthIds.facebookId,
  } : null,
  firstNameKanji: user.profile?.firstNameKanji ?? null,
  lastNameKanji: user.profile?.lastNameKanji ?? null,
  firstNameKana: user.profile?.firstNameKana ?? null,
  lastNameKana: user.profile?.lastNameKana ?? null,
  roles: user.roles.map((role: userRoles) => role.role),
  birthday: user.profile?.birthday ?? null,
  gender: user.profile?.gender ?? null,
})

export const convertEntityGenderToDBGender = (gender: Gender): string => {
  switch (gender) {
    case Female:
      return '1'
    default:
      return '0'
  }
}

export const fetchAll = async (page = 0, order:any = 'asc'): Promise<User[]> => {
  const skipIndex = page > 1 ? (page - 1) * 10 : 0
  const limit = 10
  const users = await prisma.user.findMany({
    skip: skipIndex,
    orderBy: { id: order },
    take: limit,
    include: {
      profile: true,
      oAuthIds: true,
      roles: {
        include: { role: true },
      },
    },
  })

  const cleanUsers = users.map(user => reconstructUser(user))

  return cleanUsers
}
export const totalCount = async (): Promise<number> => prisma.user.count()

export const fetch = async (id: number): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      oAuthIds: true,
      roles: {
        include: { role: true },
      },
    },
  })
  return user ? reconstructUser(user) : null
}

export const insertUserWithProfile = async (
  email: string,
  password: string,
  roleIds: number[],
  lastNameKanji: string,
  firstNameKanji: string,
  lastNameKana: string,
  firstNameKana: string,
  birthday: string,
  gender: string,
): Promise<User> => {
  const user = await prisma.user.create({
    data: {
      email,
      password,
      roles: {
        create: roleIds.map(id => ({
          role: {
            connect: { id },
          },
        })),
      },
      profile: {
        create: {
          lastNameKanji,
          firstNameKanji,
          lastNameKana,
          firstNameKana,
          birthday,
          gender: convertEntityGenderToDBGender(gender),
        },
      },
    },
    include: {
      profile: true,
      oAuthIds: true,
      roles: { include: { role: true } },
    },
  })
  const cleanUser = reconstructUser(user)
  return cleanUser
}

export const updateUserFromAdmin = async (
  id: number,
  email: string,
  password: string,
  lastNameKanji: string,
  firstNameKanji: string,
  lastNameKana: string,
  firstNameKana: string,
  birthday: string,
  gender: string,
  rolesToAdd: number[],
  rolesToRemove: number[],
):Promise<User> => {
  let removeQuery
  if (rolesToRemove.length > 0) {
    removeQuery = `DELETE from "UserRoles" WHERE user_id = ${id} AND role_id IN (${rolesToRemove.toString()});`
  }

  let roleAddQuery
  if (rolesToAdd.length > 0) {
    roleAddQuery = {
      create: rolesToAdd.map(id => ({
        role: {
          connect: { id },
        },
      })),
    }
  }

  const updateQuery = {
    where: { id },
    data: {
      profile: {
        update: {
          firstNameKanji,
          lastNameKanji,
          firstNameKana,
          lastNameKana,
          birthday,
          gender: convertEntityGenderToDBGender(gender),
        },
      },
      roles: roleAddQuery,
      email,
      password,
    },
    include: {
      oAuthIds: true,
      profile: true,
      roles: { include: { role: true } },
    },
  }

  // execute
  if (removeQuery) {
    const transactionResult = await prisma.$transaction([
      prisma.$queryRaw(removeQuery),
      prisma.user.update(updateQuery),
    ])
    const cleanUser = reconstructUser(transactionResult[1])
    return cleanUser
  }

  const user = await prisma.user.update(updateQuery)
  const cleanUser = reconstructUser(user)
  return cleanUser
}

export const deleteUserFromAdmin = async (id: number): Promise<User> => {
  const user = await prisma.user.delete({
    where: { id },
    include: {
      oAuthIds: true,
      profile: true,
      roles: { include: { role: true } },
    },
  })
  return reconstructUser(user)
}
export const fetchByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      oAuthIds: true,
      profile: true,
      roles: { include: { role: true } },
    },
  })
  return user ? reconstructUser(user) : null
}
export const addOAuthId = async (id: number, provider: string, authId: string)
: Promise<boolean> => {
  const updateQuery = {
    where: { id },
    data: {
      oAuthIds: {
        upsert: {
          update: {},
          create: {},
        },
      },
    },
  }

  switch (provider) {
    case 'google':
      Object.assign(updateQuery.data.oAuthIds.upsert.create, { googleId: authId })
      Object.assign(updateQuery.data.oAuthIds.upsert.update, { googleId: authId })
      break
    default:
  }

  const user = await prisma.user.update(updateQuery)
  return !!user
}

const UserRepository: CommonRepositoryInterface<User > & UserServiceSocket & AuthServiceSocket = {
  fetchAll,
  fetch,
  totalCount,
  insertUserWithProfile,
  updateUserFromAdmin,
  deleteUserFromAdmin,
  fetchByEmail,
  addOAuthId,
}

export default UserRepository
