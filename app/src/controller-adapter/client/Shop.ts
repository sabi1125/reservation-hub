import {
  Request, Response, NextFunction, Router,
} from 'express'
import {
  SalonListQuery, SalonListResponse, SalonQuery, SalonResponse,
  SalonMenuListQuery, SalonMenuListResponse, SalonStylistListQuery, SalonStylistListResponse,
  SalonAvailabilityQuery, SalonAvailabilityResponse, SalonSetReservationQuery, SalonStylistListForReservationResponse,
  SalonListByAreaQuery, SalonListByTagsQuery, SalonListByNameQuery, SalonReviewListQuery, SalonReviewListResponse,
  SalonReviewUpdateQuery, SalonReviewInsertQuery, SalonReviewDeleteQuery,
} from '@request-response-types/client/Shop'
import { UserForAuth } from '@entities/User'
import { parseIntIdMiddleware, protectClientRoute } from '@routes/utils'
import ShopController from '@client/shop/ShopController'
import MenuController from '@client/menu/MenuController'
import StylistController from '@client/stylist/StylistController'
import ReservationController from '@client/reservation/ReservationController'
import ReviewController from '@client/review/ReviewController'
import { ResponseMessage } from '@request-response-types/client/Common'
import parseToInt from '@lib/ParseInt'

export type ShopControllerInterface = {
  index(user: UserForAuth | undefined, query: SalonListQuery): Promise<SalonListResponse>
  detail(user: UserForAuth | undefined, query: SalonQuery): Promise<SalonResponse>
  searchByArea(user: UserForAuth | undefined, query: SalonListByAreaQuery): Promise<SalonListResponse>
  searchByTags(user: UserForAuth | undefined, query: SalonListByTagsQuery): Promise<SalonListResponse>
  searchByName(user: UserForAuth | undefined, query: SalonListByNameQuery): Promise<SalonListResponse>
}

export type MenuControllerInterface = {
  list(user: UserForAuth | undefined, query: SalonMenuListQuery): Promise<SalonMenuListResponse>
}

export type StylistControllerInterface = {
  list(user: UserForAuth | undefined, query: SalonStylistListQuery): Promise<SalonStylistListResponse>
  listForReservation(user: UserForAuth | undefined, query: SalonStylistListQuery)
    : Promise<SalonStylistListForReservationResponse>
}

export type ReservationControllerInterface = {
  list(user: UserForAuth | undefined, query: SalonAvailabilityQuery): Promise<SalonAvailabilityResponse>
  create(user: UserForAuth | undefined, query: SalonSetReservationQuery): Promise<ResponseMessage>
}

export type ReviewControllerInterface = {
  list(user: UserForAuth | undefined, query: SalonReviewListQuery): Promise<SalonReviewListResponse>
  update(user: UserForAuth | undefined, query: SalonReviewUpdateQuery): Promise<ResponseMessage>
  create(user: UserForAuth | undefined, query: SalonReviewInsertQuery): Promise<ResponseMessage>
  delete(user: UserForAuth | undefined, query: SalonReviewDeleteQuery): Promise<ResponseMessage>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order, take } = req.query
    const { user } = req
    return res.send(await ShopController.index(user, { page: parseToInt(page), order, take: parseToInt(take) }))
  } catch (e) { return next(e) }
}

const detail = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const { user } = req
    return res.send(await ShopController.detail(user, { shopId }))
  } catch (e) { return next(e) }
}

const shopSearchByArea = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const {
      page, order, areaId, prefectureId, cityId, take,
    } = req.query
    return res.send(await ShopController.searchByArea(user, {
      page: parseToInt(page),
      order,
      areaId: parseInt(areaId, 10),
      prefectureId: parseToInt(prefectureId),
      cityId: parseToInt(cityId),
      take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const shopSearchByTags = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { user } = req
    const {
      page, order, tags, take,
    } = req.query
    return res.send(await ShopController.searchByTags(user, {
      tags, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const shopSearchByName = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { user } = req
    const {
      name, page, order, take,
    } = req.body
    return res.send(await ShopController.searchByName(user, {
      name, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const shopMenus = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { page, order, take } = req.query
    return res.send(await MenuController.list(user, {
      shopId, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const shopStylists = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { page, order, take } = req.query
    return res.send(await StylistController.list(user, {
      shopId, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const shopStylistsForReservation = async (req: Request, res: Response, next: NextFunction)
  : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { page, order } = req.query
    return res.send(await StylistController.listForReservation(user, { shopId, page: parseToInt(page), order }))
  } catch (e) { return next(e) }
}

const shopReservations = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { body: params } = req
    return res.send(await ReservationController.list(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const createReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { body: params } = req
    return res.send(await ReservationController.create(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const shopReviews = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { page, order, take } = req.query
    return res.send(await ReviewController.list(user, {
      shopId, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const updateReviews = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId, reviewId } = res.locals
    const { body: params } = req
    return res.send(await ReviewController.update(user, {
      shopId, reviewId, params,
    }))
  } catch (e) { return next(e) }
}

const createReview = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId } = res.locals
    const { body: params } = req
    return res.send(await ReviewController.create(user, {
      shopId, params,
    }))
  } catch (e) { return next(e) }
}

const deleteReview = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    const { shopId, reviewId } = res.locals
    return res.send(await ReviewController.delete(user, {
      shopId, reviewId,
    }))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', index)
routes.get('/:shopId', parseIntIdMiddleware, detail)

/**
 * Search routes
 */

routes.get('/search/area', shopSearchByArea)
routes.get('/search/tags', shopSearchByTags)
routes.get('/search/name', shopSearchByName)
/**
 * Menu routes
 */

routes.get('/:shopId/menus', parseIntIdMiddleware, shopMenus)

/**
 * Stylist routes
 */

routes.get('/:shopId/stylists', parseIntIdMiddleware, shopStylists)
routes.get('/:shopId/stylists/reservation', parseIntIdMiddleware, shopStylistsForReservation)

/**
 * Reservation routes
 */

routes.get('/:shopId/reservations', parseIntIdMiddleware, shopReservations)
routes.post('/:shopId/reservations', parseIntIdMiddleware, protectClientRoute, createReservation)

/**
 * Review routes
 */

routes.get('/:shopId/reviews', parseIntIdMiddleware, shopReviews)
routes.patch('/:shopId/reviews/:reviewId', parseIntIdMiddleware, updateReviews)
routes.post('/:shopId/reviews', parseIntIdMiddleware, protectClientRoute, createReview)
routes.delete('/:shopId/reviews/:reviewId', parseIntIdMiddleware, protectClientRoute, deleteReview)
export default routes
