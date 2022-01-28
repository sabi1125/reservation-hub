import { OrderBy } from '@entities/Common'
import { Shop } from '@entities/Shop'
import { Tag } from '@entities/Tag'
import ShopRepository from '@client/shop/repositories/ShopRepository'
import Logger from '@lib/Logger'
import { InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import { ShopServiceInterface } from '@client/shop/ShopController'
import LocationRepository from '@client/shop/repositories/LocationRepository'
import TagRepository from '@client/shop/repositories/TagRepository'

export type ShopRepositoryInterface = {
  fetchShops(page: number, order: OrderBy): Promise<Shop[]>
  fetchShopsTotalCount(): Promise<number>
  fetchShop(shopId: number): Promise<Shop | null>
  fetchShopsByArea(page:number, order: OrderBy, areaId: number, prefectureId?: number, cityId?: number): Promise<Shop[]>
  fetchShopsTotalCountByArea(areaId: number, prefectureId?: number, cityId?: number): Promise<number>
  fetchShopsByTags(tagIds: number[], page: number, order: OrderBy): Promise<Shop[]>
  fetchShopsTotalCountByTags(tagIds: number[]): Promise<number>
}

export type LocationRepositoryInterface = {
  isValidLocation(areaId: number, prefectureId?: number, cityId?: number): Promise<boolean>
}

export type TagRepositoryInterface = {
  fetchValidTagsBySlugs(slugs: string[]): Promise<Tag[]>
}

const ShopService: ShopServiceInterface = {
  async fetchShopsWithTotalCount(user, page = 1, order = OrderBy.DESC) {
    const shops = await ShopRepository.fetchShops(page, order)
    const totalCount = await ShopRepository.fetchShopsTotalCount()
    return { shops, totalCount }
  },

  async fetchShop(user, shopId) {
    const shop = await ShopRepository.fetchShop(shopId)
    if (!shop) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
    }
    return shop
  },

  async fetchShopsByAreaWithTotalCount(user, areaId, page = 1, order = OrderBy.DESC, prefectureId,
    cityId) {
    const isValidLocation = await LocationRepository.isValidLocation(areaId, prefectureId, cityId)
    if (!isValidLocation) {
      Logger.debug('Location provided is incorrect')
      throw new InvalidParamsError()
    }

    const shops = await ShopRepository.fetchShopsByArea(page, order, areaId, prefectureId, cityId)
    const totalCount = await ShopRepository.fetchShopsTotalCountByArea(areaId, prefectureId, cityId)
    return { shops, totalCount }
  },

  async fetchShopsByTagsWithTotalCount(user, tags, page = 1, order = OrderBy.DESC) {
    const existingTagIds = (await TagRepository.fetchValidTagsBySlugs(tags)).map(vt => vt.id)
    const shops = await ShopRepository.fetchShopsByTags(existingTagIds, page, order)
    const totalCount = await ShopRepository.fetchShopsTotalCountByTags(existingTagIds)
    return { shops, totalCount }
  },

}

export default ShopService
