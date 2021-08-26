import { Prisma } from '@prisma/client'
import prisma from './prisma'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'
import { StylistRepositoryInterface as ShopServiceSocket } from '../services/ShopService'
import { Stylist } from '../entities/Stylist'

const stylistWithShops = Prisma.validator<Prisma.StylistArgs>()(
  { include: { shop: { include: { shopDetail: true } } } },
)
type stylistWithShops = Prisma.StylistGetPayload<typeof stylistWithShops>

export const reconstructStylist = (stylist: stylistWithShops): Stylist => ({
  id: stylist.id,
  name: stylist.name,
  price: stylist.price,
  shop: {
    id: stylist.shopId,
    name: stylist.shop.shopDetail?.name,
  },
})

export const StylistRepository: CommonRepositoryInterface<Stylist> & ShopServiceSocket = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const stylists = await prisma.stylist.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylists = stylists.map(stylist => reconstructStylist(stylist))
    return cleanStylists
  },

  async totalCount() {
    return prisma.stylist.count()
  },

  async fetch(id) {
    const stylist = await prisma.stylist.findUnique({
      where: { id },
      include: { shop: { include: { shopDetail: true } } },
    })
    return stylist ? reconstructStylist(stylist) : null
  },

  async insertStylist(name, price, shopId) {
    const stylist = await prisma.stylist.create({
      data: {
        name,
        price,
        shop: {
          connect: { id: shopId },
        },
      },
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylist = reconstructStylist(stylist)
    return cleanStylist
  },

  async updateStylist(id, name, price, shopId) {
    const stylist = await prisma.stylist.update({
      where: { id },
      data: {
        name,
        price,
        shop: { connect: { id: shopId } },
      },
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylist = reconstructStylist(stylist)
    return cleanStylist
  },

  async deleteStylist(id) {
    const stylist = await prisma.stylist.delete({
      where: { id },
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylist = reconstructStylist(stylist)
    return cleanStylist
  },

  async fetchStylistsByShopIds(shopIds) {
    const stylists = await prisma.stylist.findMany({
      where: { shopId: { in: shopIds } },
      include: { shop: { include: { shopDetail: true } } },
    })
    const cleanStylists = stylists.map(stylist => ({
      id: stylist.id,
      name: stylist.name,
      price: stylist.price,
      shopId: stylist.shopId,
    }))
    return cleanStylists
  },

  async fetchStylistsCountByShopIds(shopIds) {
    const stylists = await this.fetchStylistsByShopIds(shopIds)
    const finalData = shopIds.map(id => ({ id, count: stylists.filter(stylist => id === stylist.shopId).length }))
    return finalData
  },

}

export default StylistRepository
