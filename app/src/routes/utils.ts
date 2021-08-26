import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import pt from '../middlewares/passport'
import { User } from '../entities/User'
import { UnauthorizedError } from './errors'

export const protectAdminRoute = pt.authenticate('admin-jwt', { session: false })
export const protectClientRoute = pt.authenticate('client-jwt', { session: false })

export const roleCheck = (roles: string[]) => (req: any, res: any, next: any): void => {
  const { user }: { user: User } = req
  if (!user.roles) return next(new UnauthorizedError())
  const authorized: boolean = user.roles.filter(ur => roles.includes(ur.name)).length > 0
  // const isCorrectShop: boolean = user
  if (!authorized) return next(new UnauthorizedError())
  return next()
}

const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9]+$/),
  shopId: Joi.string().pattern(/^[0-9]+$/),
  menuItemId: Joi.string().pattern(/^[0-9]+$/),
})

const joiOptions = { abortEarly: false, stripUnknown: true }

export const parseIntIdMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ids = await idSchema.validateAsync(req.params, joiOptions)
  res.locals.id = parseInt(ids.id, 10)
  if (ids.shopId) {
    res.locals.shopId = parseInt(ids.shopId, 10)
  }
  if (ids.menuItemId) {
    res.locals.menuItemId = parseInt(ids.menuItemId, 10)
  }
  return next()
}
