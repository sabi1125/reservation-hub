import {
  Request, Response, NextFunction,
} from 'express'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { shopUpsertSchema } from './schemas/shop'
import indexSchema from './schemas/indexSchema'
import ShopService from '../services/ShopService'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { shopStylistUpsertSchema } from './schemas/stylist'
import { fetchModelsWithTotalCountResponse } from '../request-response-types/ServiceCommonTypes'
import { searchSchema } from './schemas/search'
import { ShopControllerInterface } from '../controller-adapter/Shop'

export type ShopServiceInterface = {
  fetchShopsWithTotalCount(query: fetchModelsWithTotalCountQuery)
    : Promise<fetchModelsWithTotalCountResponse<Shop>>,
  fetchShop(id: number): Promise<Shop>,
  insertShop(name: string, areaId: number, prefectureId: number, cityId: number, address: string, phoneNumber: string,
    days: number[], startTime: string, endTime: string, details: string): Promise<Shop>,
  updateShop(id: number, name: string, areaId: number, prefectureId: number, cityId: number, address: string,
    phoneNumber: string, days: number[], startTime: string, endTime: string, details: string): Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  fetchStylistsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
  insertStylist(shopId: number, name: string, price: number)
    : Promise<Stylist>
  updateStylist(shopId: number, stylistId: number, name: string, price: number)
    : Promise<Stylist>
  deleteStylist(shopId: number, stylistId: number)
    : Promise<Stylist>
  searchShops(keyword: string): Promise<Shop[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ShopController: ShopControllerInterface = {
  async index(query) {
    const params = await indexSchema.validateAsync(query, joiOptions)
    const shopsWithCount = await ShopService.fetchShopsWithTotalCount(params)
    const { values: shops, totalCount } = shopsWithCount

    const shopIds = shops.map(shop => shop.id)

    const totalReservationsCount = await ShopService.fetchReservationsCountByShopIds(shopIds)
    const totalStylistsCount = await ShopService.fetchStylistsCountByShopIds(shopIds)

    // merge data
    const values = shops.map(shop => ({
      ...shop,
      reservationsCount: totalReservationsCount.find(item => item.id === shop.id)!.count,
      stylistsCount: totalStylistsCount.find(item => item.id === shop.id)!.count,
    }))

    return { values, totalCount }
  },

  async show(query) {
    const { id } = query
    const shop = await ShopService.fetchShop(id)
    return shop
  },

  async insert(query) {
    const {
      name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details,
    } = await shopUpsertSchema.validateAsync(query, joiOptions)
    const shop = await ShopService.insertShop(
      name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details,
    )
    return shop
  },

  async update(query) {
    const {
      name, areaId, prefectureId, cityId, address, phoneNumber,
      days, startTime, endTime, details,
    } = await shopUpsertSchema.validateAsync(query.params, joiOptions)
    const { id } = query

    const shop = await ShopService.updateShop(id, name, areaId, prefectureId, cityId, address,
      phoneNumber, days, startTime, endTime, details)

    return shop
  },

  async delete(query) {
    const { id } = query
    await ShopService.deleteShop(id)
    return { message: 'Shop deleted' }
  },

  async insertStylist(query) {
    const { name, price } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    const stylist = await ShopService.insertStylist(shopId, name, price)
    return stylist
  },

  async updateStylist(query) {
    const { name, price } = await shopStylistUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, stylistId } = query
    const stylist = await ShopService.updateStylist(shopId, stylistId, name, price)
    return stylist
  },

  async deleteStylist(query) {
    const { shopId, stylistId } = query
    const stylist = await ShopService.deleteStylist(shopId, stylistId)
    return stylist
  },

  async searchShops(query) {
    const searchValues = await searchSchema.validateAsync(query, joiOptions)
    const shops = await ShopService.searchShops(searchValues.keyword)
    return shops
  },
}

export default ShopController

export const searchShops = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const searchValues = await searchSchema.validateAsync(req.body, joiOptions)
    const shop = await ShopService.searchShops(searchValues.keyword)
    return res.send({ data: shop })
  } catch (e) { return next(e) }
}
