import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import {
  userInsertSchema, userUpdateSchema,
} from './schemas/user'
import indexSchema from './schemas/indexSchema'
import {
  fetchModelsWithTotalCountQuery, fetchModelsWithTotalCountResponse,
} from '../request-response-types/ServiceCommonTypes'
import { insertUserFromAdminQuery, updateUserFromAdminQuery } from '../request-response-types/UserService'
import UserService from '../services/UserService'
import { User } from '../entities/User'

export type UserServiceInterface = {
  fetchUsersWithTotalCount(query: fetchModelsWithTotalCountQuery): Promise<fetchModelsWithTotalCountResponse<User>>,
  fetchUser(id: number): Promise<User>,
  insertUserFromAdmin(query: insertUserFromAdminQuery): Promise<User>,
  updateUserFromAdmin(query: updateUserFromAdminQuery): Promise<User>,
  deleteUserFromAdmin(id: number): Promise<User>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)

  const usersWithCount = await UserService.fetchUsersWithTotalCount(schemaValues)

  return res.send(usersWithCount)
})

export const showUser = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const user = await UserService.fetchUser(id)
  return res.send(user)
})

export const insertUser = asyncHandler(async (req, res) => {
  const params = await userInsertSchema.validateAsync(req.body, joiOptions)

  const user = await UserService.insertUserFromAdmin(params)

  return res.send(user)
})

export const updateUser = asyncHandler(async (req, res) => {
  const params = await userUpdateSchema.validateAsync(req.body, joiOptions)

  const { id } = res.locals

  const user = await UserService.updateUserFromAdmin({ id, params })

  return res.send(user)
})

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = res.locals
  await UserService.deleteUserFromAdmin(id)
  return res.send({ message: 'User deleted' })
})

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showUser)
routes.post('/', roleCheck(['admin']), insertUser)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateUser)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteUser)

export default routes
