import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { shopScheduleSchema, shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import ShopService from '../services/ShopService'
import {
  insertShopQuery,
  updateShopQuery,
  insertStylistQuery,
  updateStylistQuery,
  deleteStylistQuery,
  upsertScheduleQuery,
} from '../request-response-types/ShopService'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { Shop, ShopSchedule } from '../entities/Shop'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import { shopStylistUpsertSchema } from './schemas/stylist'
import { Stylist } from '../entities/Stylist'
import { fetchModelsWithTotalCountResponse } from '../request-response-types/ServiceCommonTypes'
import { ShopDetail } from '.prisma/client'
import { searchSchema } from './schemas/search'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(query: fetchModelsWithTotalCountQuery)
    : Promise<fetchModelsWithTotalCountResponse<Shop>>,
  fetchShop(id: number): Promise<Shop>,
  insertShop(query: insertShopQuery): Promise<Shop>,
  updateShop(query: updateShopQuery): Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  upsertSchedule(query: upsertScheduleQuery)
    : Promise<ShopSchedule>
  insertStylist(query: insertStylistQuery)
    : Promise<Stylist>
  updateStylist(query: updateStylistQuery)
    : Promise<Stylist>
  deleteStylist(query: deleteStylistQuery)
    : Promise<Stylist>
  searchShops(keyword: string): Promise<ShopDetail[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const index = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const shopsWithCount = await ShopService.fetchShopsWithTotalCount(params)
  const { values: shops, totalCount } = shopsWithCount

  const shopIds = shops.map(shop => shop.id)

  const totalReservationsCount = await ShopService.fetchReservationsCountByShopIds(shopIds)
  const totalStylistsCount = await ShopService.fetchStylistsCountByShopIds(shopIds)

  // merge data
  const data: Shop[] = shops.map(shop => ({
    ...shop,
    reservationsCount: totalReservationsCount.find(item => item.id === shop.id)?.count,
    stylistsCount: totalStylistsCount.find(item => item.id === shop.id)?.count,
  }))

  return res.send({ data, totalCount })
})
const showShop = asyncHandler(async (req, res) => {
  const { shopId } = res.locals
  const shop = await ShopService.fetchShop(shopId)
  return res.send(shop)
})

export const searchShops = asyncHandler(async (req, res) => {
  const searchValues = await searchSchema.validateAsync(req.body, joiOptions)
  const shop = await ShopService.searchShops(searchValues.keyword)

  return res.send({ data: shop })
})

const insertShop = asyncHandler(async (req, res) => {
  const shopInsertValues = await shopUpsertSchema.validateAsync(req.body, joiOptions)

  const shop = await ShopService.insertShop(shopInsertValues)
  return res.send(shop)
})

const updateShop = asyncHandler(async (req, res) => {
  const params = await shopUpsertSchema.validateAsync(req.body, joiOptions)
  const { shopId } = res.locals

  const shop = await ShopService.updateShop({ shopId, params })

  return res.send(shop)
})

const deleteShop = asyncHandler(async (req, res) => {
  const { shopId } = res.locals
  await ShopService.deleteShop(shopId)
  return res.send({ message: 'Shop deleted' })
})

const insertBusinessDaysAndHours = asyncHandler(async (req, res) => {
  const params = await shopScheduleSchema.validateAsync(req.body, joiOptions)
  const { shopId } = res.locals
  const schedule = await ShopService.upsertSchedule({ shopId, params })
  return res.send(schedule)
})

const insertStylist = asyncHandler(async (req, res) => {
  const params = await shopStylistUpsertSchema.validateAsync(req.body, joiOptions)
  const { shopId } = res.locals
  const stylist = await ShopService.insertStylist({ shopId, params })
  return res.send(stylist)
})

const updateStylist = asyncHandler(async (req, res) => {
  const params = await shopStylistUpsertSchema.validateAsync(req.body, joiOptions)
  const { shopId, id } = res.locals
  const stylist = await ShopService.updateStylist({ shopId, stylistId: id, params })
  return res.send(stylist)
})

const deleteStylist = asyncHandler(async (req, res) => {
  const { shopId, id } = res.locals
  const stylist = await ShopService.deleteStylist({ shopId, stylistId: id })
  return res.send(stylist)
})

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:shopId', roleCheck(['admin', 'shop staff']), parseIntIdMiddleware, showShop)
routes.post('/', roleCheck(['admin']), insertShop)
routes.post('/search', roleCheck(['admin']), searchShops)
routes.patch('/:shopId', roleCheck(['admin']), parseIntIdMiddleware, updateShop)
routes.delete('/:shopId', roleCheck(['admin']), parseIntIdMiddleware, deleteShop)
routes.post('/:shopId/schedule', roleCheck(['admin', 'shop staff']), parseIntIdMiddleware, insertBusinessDaysAndHours)
routes.post('/:shopId/stylist', roleCheck(['admin', 'shop staff']), parseIntIdMiddleware, insertStylist)
routes.patch('/:shopId/stylist/:stylistId', roleCheck(['admin', 'shop staff']), parseIntIdMiddleware, updateStylist)
routes.delete('/:shopId/stylist/:stylistId', roleCheck(['admin', 'shop staff']), parseIntIdMiddleware, deleteStylist)

export default routes
