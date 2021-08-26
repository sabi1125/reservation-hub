import { ShopDetail } from '@prisma/client'
import { ShopRepository } from '../repositories/ShopRepository'
import { Shop, ShopSchedule } from '../entities/Shop'
import { Reservation } from '../entities/Reservation'
import { ShopServiceInterface as ShopControllerSocket } from '../controllers/shopController'
import { ShopServiceInterface as MenuControllerSocket } from '../controllers/menuController'
import { ShopServiceInterface as DashboardControllerSocket } from '../controllers/dashboardController'
import StylistRepository from '../repositories/StylistRepository'
import ReservationRepository from '../repositories/ReservationRepository'
import { LocationRepository } from '../repositories/LocationRepository'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'
import { MenuItem } from '../entities/Menu'
import { Stylist } from '../entities/Stylist'

export type ShopRepositoryInterface = {
  insertShop(
    name: string,
    areaId: number,
    prefectureId: number,
    cityId: number,
    address: string,
    phoneNumber: string,
  ): Promise<Shop>,
  updateShop(
    id: number,
    name: string,
    areaId: number,
    prefectureId: number,
    cityId: number,
    address: string,
    phoneNumber: string,
  ): Promise<Shop>,
  deleteShop(id: number): Promise<Shop>,
  upsertSchedule(shopId: number, days: number[], start: string, end: string)
    : Promise<ShopSchedule>
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>,
  updateMenuItem(menuItemId: number, name: string, description: string, price: number): Promise<MenuItem>,
  deleteMenuItem(menuItemId: number): Promise<MenuItem>
  fetchValidShopIds(shopIds: number[]): Promise<number[]>
  searchShops(keyword: string): Promise<ShopDetail[]>,
}

export type LocationRepositoryInterface = {
  isValidLocation(areaId: number, prefectureId: number, cityId: number): Promise<boolean>,
}

export type StylistRepositoryInterface = {
  insertStylist(name: string, price: number, shopId: number): Promise<Stylist>,
  updateStylist(id: number, name: string, price: number, shopId: number)
  :Promise<Stylist>,
  deleteStylist(id: number): Promise<Stylist>,
  fetchStylistsByShopIds(shopIds: number[])
    : Promise<{ id: number, name: string, price: number, shopId:number }[]>,
  fetchStylistsCountByShopIds(shopIds: number[]): Promise<{ id: number, count: number }[]>,
}

export type ReservationRepositoryInterface = {
  fetchReservationsByShopIds(shopIds: number[])
    : Promise<{ id: number, data: Reservation[] }[]>,
  fetchReservationsCountByShopIds(shopIds: number[])
    : Promise<{ id: number, count: number }[]>,
}

export type MenuRepositoryInterface = {
  insertMenuItem(shopId: number, name: string, description: string, price: number): Promise<MenuItem>
}

const convertToUnixTime = (time:string): number => new Date(`January 1, 2020 ${time}`).getTime()

export const ShopService: ShopControllerSocket & MenuControllerSocket & DashboardControllerSocket = {

  async fetchShopsForDashboard() {
    const shops = await ShopRepository.fetchAll({ limit: 5 })
    const shopsCount = await ShopRepository.totalCount()
    return { shops, totalCount: shopsCount }
  },

  async fetchShopsWithTotalCount(params) {
    const shops = await ShopRepository.fetchAll(params)
    const shopsCount = await ShopRepository.totalCount()
    return { values: shops, totalCount: shopsCount }
  },

  async fetchShop(id) {
    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }
    return shop
  },

  async insertShop(params) {
    const isValidLocation = await LocationRepository.isValidLocation(params.areaId, params.prefectureId, params.cityId)
    if (!isValidLocation) {
      throw new InvalidParamsError()
    }

    return ShopRepository.insertShop(
      params.name,
      params.areaId,
      params.prefectureId,
      params.cityId,
      params.address,
      params.phoneNumber,
    )
  },

  async updateShop({ id, params }) {
    const isValidLocation = await LocationRepository.isValidLocation(params.areaId, params.prefectureId, params.cityId)
    if (!isValidLocation) {
      throw new InvalidParamsError()
    }

    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }

    return ShopRepository.updateShop(id, params.name, params.areaId, params.prefectureId,
      params.cityId, params.address, params.phoneNumber)
  },

  async deleteShop(id) {
    const shop = await ShopRepository.fetch(id)
    if (!shop) {
      throw new NotFoundError()
    }
    return ShopRepository.deleteShop(id)
  },
  async searchShops(keyword) {
    const shops = await ShopRepository.searchShops(keyword)
    return shops
  },
  async fetchStylistsCountByShopIds(shopIds) {
    if (shopIds.length === 0) {
      return []
    }
    return StylistRepository.fetchStylistsCountByShopIds(shopIds)
  },

  async fetchReservationsCountByShopIds(shopIds) {
    if (shopIds.length === 0) {
      return []
    }
    return ReservationRepository.fetchReservationsCountByShopIds(shopIds)
  },

  async upsertSchedule({ shopId, params }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      throw new NotFoundError()
    }

    const startHour = convertToUnixTime(params.hours.start)
    const endHour = convertToUnixTime(params.hours.end)
    if (params.days.length === 0 || endHour <= startHour) {
      throw new InvalidParamsError()
    }

    const uniqueDays: number[] = params.days.filter((n, i) => params.days.indexOf(n) === i)

    const schedule = await ShopRepository.upsertSchedule(
      shop.id,
      uniqueDays,
      params.hours.start,
      params.hours.end,
    )
    return schedule
  },

  async insertMenuItem({ shopId, params }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      throw new NotFoundError()
    }
    const menuItem = await ShopRepository.insertMenuItem(shopId, params.name,
      params.description, params.price)
    return menuItem
  },

  async updateMenuItem({ shopId, menuItemId, params }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      throw new NotFoundError()
    }
    const menuItemIdIsValid = shop.menu!.items.findIndex(item => item.id === menuItemId) !== -1
    if (!menuItemIdIsValid) {
      throw new NotFoundError()
    }

    return ShopRepository.updateMenuItem(menuItemId, params.name,
      params.description, params.price)
  },

  async deleteMenuItem({ shopId, menuItemId }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }
    const menuItemIdIsValid = shop.menu!.items.findIndex(item => item.id === menuItemId) !== -1
    if (!menuItemIdIsValid) {
      console.error('menu item not found')
      throw new NotFoundError()
    }

    return ShopRepository.deleteMenuItem(menuItemId)
  },

  async insertStylist({ shopId, params }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.insertStylist(
      params.name,
      params.price,
      shopId,
    )
    return stylist
  },

  async updateStylist({ shopId, stylistId, params }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.fetch(stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return StylistRepository.updateStylist(
      stylistId,
      params.name,
      params.price,
      shopId,
    )
  },

  async deleteStylist({ shopId, stylistId }) {
    const shop = await ShopRepository.fetch(shopId)
    if (!shop) {
      console.error('shop not found')
      throw new NotFoundError()
    }

    const stylist = await StylistRepository.fetch(stylistId)
    if (!stylist) {
      console.error('stylist not found')
      throw new NotFoundError()
    }

    return StylistRepository.deleteStylist(stylistId)
  },
}

export default ShopService
