import { Prisma } from '@prisma/client'
import { User } from '../../entities/User'
import prisma from '../../../prisma'
import { Role } from '../../entities/Role'
import { UserRepositoryInterface } from '../services/SignUpService'

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

export const insertUser = async (email: string, username: string, password: string): Promise<User> => {
  const reconstructUser = (create: userWithProfileAndOAuthIdsAndRoles): User => ({
    id: create.id,
    email: create.email,
    username: create.username ?? null,
    password: create.password,
    oAuthIds: create.oAuthIds ? {
      id: create.oAuthIds.id,
      googleId: create.oAuthIds.googleId,
      facebookId: create.oAuthIds.facebookId,
    } : null,
    roles: create.roles.map((role: userRoles) => role.role),
  })

  const create = await prisma.user.create({
    data: {
      email,
      username,
      password,
      roles: {
        create: {
          role: {
            connect: { slug: 'client' },
          },
        },
      },
    },

    include: {
      profile: true,
      oAuthIds: true,
      roles: { include: { role: true } },
    },
  })
  const createdUser = reconstructUser(create)
  return createdUser
}

const emailIsAvailable = async (email: string): Promise<boolean> => {
  const emailCount = await prisma.user.count(
    {
      where: {
        email,
      },
    },
  )
  console.error(emailCount === 0)
  return emailCount === 0
}
const UserRepository: UserRepositoryInterface = {
  insertUser,
  emailIsAvailable,
}

export default UserRepository
