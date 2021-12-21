import {
  Request, Response, NextFunction, Router,
} from 'express'
import ShopController from '@shop/ShopController'
import { parseIntIdMiddleware } from '@routes/utils'
import {
  InsertShopQuery, UpdateShopQuery, ShopQuery, ShopListResponse, ShopListQuery, ShopResponse,
  DeleteShopQuery, InsertStylistQuery, UpdateStylistQuery, DeleteStylistQuery,
  ShopSearchQuery, InsertMenuQuery, UpdateMenuQuery, DeleteMenuQuery, ReservationListQuery,
  ReservationListResponse, InsertShopReservationQuery, UpdateShopReservationQuery,
  DeleteShopReservationQuery,
  StylistListQuery,
  StylistListResponse,
  StylistQuery,
  StylistResponse,
  MenuListQuery,
  MenuListResponse,
  MenuQuery,
  MenuResponse,
  ReservationResponse,
  ReservationQuery,
} from '@request-response-types/Shop'
import { UserForAuth } from '@entities/User'
import { ResponseMessage } from '@request-response-types/Common'
import MenuController from '@menu/MenuController'

export type ShopControllerInterface = {
  index(user: UserForAuth, query: ShopListQuery): Promise<ShopListResponse>
  show(user: UserForAuth, query: ShopQuery): Promise<ShopResponse>
  insert(user: UserForAuth, query: InsertShopQuery): Promise<ResponseMessage>
  update(user: UserForAuth, query: UpdateShopQuery): Promise<ResponseMessage>
  delete(user: UserForAuth, query: DeleteShopQuery): Promise<ResponseMessage>
  // showStylists(user: UserForAuth, query: StylistListQuery): Promise<StylistListResponse>
  // showStylist(user: UserForAuth, query: StylistQuery): Promise<StylistResponse>
  insertStylist(user: UserForAuth, query: InsertStylistQuery): Promise<ResponseMessage>
  updateStylist(user: UserForAuth, query: UpdateStylistQuery): Promise<ResponseMessage>
  deleteStylist(user: UserForAuth, query: DeleteStylistQuery): Promise<ResponseMessage>
  searchShops(query: ShopSearchQuery): Promise<ShopListResponse>
  showReservations(user: UserForAuth, query: ReservationListQuery): Promise<ReservationListResponse>
  // showReservation(user: UserForAuth, query: ReservationQuery): Promise<ReservationResponse>
  insertReservation(user: UserForAuth, query: InsertShopReservationQuery): Promise<ResponseMessage>
  updateReservation(user: UserForAuth, query: UpdateShopReservationQuery): Promise<ResponseMessage>
  deleteReservation(user: UserForAuth, query: DeleteShopReservationQuery): Promise<ResponseMessage>
}

export type MenuControllerInterface = {
  index(user: UserForAuth, query: MenuListQuery): Promise<MenuListResponse>
  show(user: UserForAuth, query: MenuQuery): Promise<MenuResponse>
  insert(user: UserForAuth, query: InsertMenuQuery): Promise<ResponseMessage>
  update(user: UserForAuth, query: UpdateMenuQuery): Promise<ResponseMessage>
  delete(user: UserForAuth, query: DeleteMenuQuery): Promise<ResponseMessage>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    const user = req.user as UserForAuth
    return res.send(await ShopController.index(user, { page, order }))
  } catch (e) { return next(e) }
}

const showShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    const user = req.user as UserForAuth
    return res.send(await ShopController.show(user, { id }))
  } catch (e) { return next(e) }
}

const insertShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    const user = req.user as UserForAuth
    return res.send(await ShopController.insert(user, body))
  } catch (e) { return next(e) }
}

const updateShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const user = req.user as UserForAuth
    const { id } = res.locals
    return res.send(await ShopController.update(user, { id, params }))
  } catch (e) { return next(e) }
}

const deleteShop = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const user = req.user as UserForAuth
    const { id } = res.locals
    return res.send(await ShopController.delete(user, { id }))
  } catch (e) { return next(e) }
}

const insertStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId } = res.locals
    const { body: params } = req
    const user = req.user as UserForAuth
    return res.send(await ShopController.insertStylist(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    const { body: params } = req
    const user = req.user as UserForAuth
    return res.send(await ShopController.updateStylist(user, { shopId, stylistId, params }))
  } catch (e) { return next(e) }
}

const deleteStylist = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, stylistId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await ShopController.deleteStylist(user, { shopId, stylistId }))
  } catch (e) { return next(e) }
}

const searchShops = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await ShopController.searchShops(body))
  } catch (e) { return next(e) }
}

const showMenus = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    const { shopId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await MenuController.index(user, { shopId, page, order }))
  } catch (e) { return next(e) }
}

const showMenu = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, menuId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await MenuController.show(user, { shopId, menuId }))
  } catch (e) { return next(e) }
}

const insertMenu = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await MenuController.insert(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateMenu = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId, menuId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await MenuController.update(user, { shopId, menuId, params }))
  } catch (e) { return next(e) }
}

const deleteMenu = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, menuId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await MenuController.delete(user, { shopId, menuId }))
  } catch (e) { return next(e) }
}

const showReservations = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    const { shopId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await ShopController.showReservations(user, { shopId, page, order }))
  } catch (e) { return next(e) }
}

const insertReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await ShopController.insertReservation(user, { shopId, params }))
  } catch (e) { return next(e) }
}

const updateReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { shopId, reservationId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await ShopController.updateReservation(user, { shopId, reservationId, params }))
  } catch (e) { return next(e) }
}

const deleteReservation = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, reservationId } = res.locals
    const user = req.user as UserForAuth
    return res.send(await ShopController.deleteReservation(user, { shopId, reservationId }))
  } catch (e) { return next(e) }
}

const routes = Router()

// shop routes
routes.get('/', index)
routes.get('/:id', parseIntIdMiddleware, showShop)
routes.post('/', insertShop)
routes.patch('/:id', parseIntIdMiddleware, updateShop)
routes.delete('/:id', parseIntIdMiddleware, deleteShop)
routes.post('/search', searchShops)

// stylist routes
routes.post('/:shopId/stylist', parseIntIdMiddleware, insertStylist)
routes.patch('/:shopId/stylist/:stylistId', parseIntIdMiddleware, updateStylist)
routes.delete('/:shopId/stylist/:stylistId', parseIntIdMiddleware, deleteStylist)

// menu routes
routes.get('/:shopId/menu', parseIntIdMiddleware, showMenus)
routes.get('/:shopId/menu/:menuId', parseIntIdMiddleware, showMenu)
routes.post('/:shopId/menu', parseIntIdMiddleware, insertMenu)
routes.patch('/:shopId/menu/:menuId', parseIntIdMiddleware, updateMenu)
routes.delete('/:shopId/menu/:menuId', parseIntIdMiddleware, deleteMenu)

// reservation routes
routes.get('/:shopId/reservation', parseIntIdMiddleware, showReservations)
routes.post('/:shopId/reservation', parseIntIdMiddleware, insertReservation)
routes.patch('/:shopId/reservation/:reservationId', parseIntIdMiddleware, updateReservation)
routes.delete('/:shopId/reservation/:reservationId', parseIntIdMiddleware, deleteReservation)

export default routes
