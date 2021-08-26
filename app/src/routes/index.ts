import {
  Request, Response, NextFunction, Router,
} from 'express'

import { protectAdminRoute } from './utils'

import dashboardController from '../controllers/dashboardController'
import { areaController, prefectureController, cityController } from '../controllers/locationController'
import authController from '../controllers/authController'
import userController from '../controllers/userController'
import shopController from '../controllers/shopController'
import menuController from '../controllers/menuController'
import roleController from '../controllers/roleController'
import reservationController from '../controllers/reservationController'

import apiRoutes from './api'
import { InvalidRouteError } from './error'

const router = Router()
export default router

router.use('/auth', authController)
router.use('/dashboard', protectAdminRoute, dashboardController)
router.use('/areas', protectAdminRoute, areaController)
router.use('/prefectures', protectAdminRoute, prefectureController)
router.use('/cities', protectAdminRoute, cityController)
router.use('/users', protectAdminRoute, userController)
router.use('/roles', protectAdminRoute, roleController)
router.use('/shops', protectAdminRoute, menuController, shopController)
router.use('/reservations', protectAdminRoute, reservationController)

// client api
router.use('/api/', apiRoutes)

router.use('/*', (req: Request, res: Response, next: NextFunction) => next(new InvalidRouteError())) // 404s
