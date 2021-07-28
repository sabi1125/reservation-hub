const prisma = require('../db/prisma')
const CommonRepository = require('./CommonRepository')

const include = {
  shopDetail: true,
}

module.exports = {
  cleanRelationModels(shop) {
    // clean shop detail values
    const keys = Object.keys(shop.shopDetail)
    keys.forEach(key => {
      if (!(key === 'id' || key === 'shopID')) {
        shop[key] = shop.shopDetail[key]
      }
    })
    delete shop.shopDetail
  },
  async fetchShops(page = 0, order = 'asc', filter) {
    try {
      const {
        error: fetchShopsError,
        value: shops,
      } = await CommonRepository.fetchAll('shop', page, order, filter, include)
      if (fetchShopsError) throw fetchShopsError
      shops.forEach(shop => this.cleanRelationModels(shop))
      return { value: shops }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async totalCount(filter) {
    try {
      const { error, value } = await CommonRepository.totalCount('shop', filter)
      if (error) throw error
      return { value }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchShop(id) {
    try {
      const { error, value } = await CommonRepository.fetch('shop', id, include)
      if (error) throw error
      if (value) {
        this.cleanRelationModels(value)
      }
      return { value }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async insertShop(name, address, phoneNumber, areaID, prefectureID, cityID) {
    try {
      return {
        value: await prisma.shop.create({
          data: {
            area: {
              connect: { id: areaID },
            },
            prefecture: {
              connect: { id: prefectureID },
            },
            city: {
              connect: { id: cityID },
            },
            shopDetail: {
              create: {
                name,
                address,
                phoneNumber,
              },
            },
          },
          include: {
            shopDetail: true,
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async updateShop(shop, name, address, phoneNumber, areaID, prefectureID, cityID) {
    try {
      return {
        value: await prisma.shop.update({
          where: { id: shop.id },
          data: {
            area: {
              connect: { id: areaID },
            },
            prefecture: {
              connect: { id: prefectureID },
            },
            city: {
              connect: { id: cityID },
            },
            shopDetail: {
              update: {
                name,
                address,
                phoneNumber,
              },
            },
          },
          include: {
            shopDetail: true,
          },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async deleteShop(id) {
    try {
      return {
        value: await prisma.shop.delete({
          where: { id },
        }),
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async findByProps(prop) {
    const param = Array.isArray(prop) ? { OR: prop } : prop
    try {
      return {
        value: await prisma.shop.findUnique({
          where: param,
        }),
      }
    } catch (error) {
      console.error(`Shop not found on prop : ${prop}, ${error}`)
      return { error }
    }
  },
  async findExistingShopIDs(ids) {
    try {
      const validShops = await prisma.shop.findMany({
        where: { id: { in: ids } },
      })
      return {
        value: validShops.map(shop => shop.id),
      }
    } catch (error) {
      console.error(`Shop not found on prop : ${ids.toString()}, ${error}`)
      return { error }
    }
  },
  async fetchShopReservationsByIDs(ids) {
    try {
      const data = await prisma.reservation.findMany({
        where: { shopID: { in: ids } },
      })
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchShopReservationsCountByIDs(ids) {
    const {
      error: fetchReservationsError,
      value: reservations,
    } = await this.fetchShopReservationsByIDs(ids)
    if (fetchReservationsError) throw fetchReservationsError
    const data = {}
    ids.forEach(id => {
      data[id] = reservations.filter(reservation => reservation.shopID === id).length
    })
    try {
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchShopStylistsByIDs(ids) {
    const query = `
    SELECT st.id, st.name, sp.id as shop_id
    FROM "Stylist" AS st 
    LEFT JOIN "ShopStylists" AS ss ON st.id = ss.stylist_id
    LEFT JOIN "Shop" as sp on sp.id = ss.shop_id
    WHERE sp.id in (${ids})
    `
    try {
      const data = await prisma.$queryRaw(query)

      // convert snakecase to camelcase
      data.forEach(datum => {
        datum.shopID = datum.shop_id
        delete datum.shop_id
      })

      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchShopStylistsCountByIDs(ids) {
    try {
      const {
        error: fetchStylistsError,
        value: stylists,
      } = await this.fetchShopStylistsByIDs(ids)
      if (fetchStylistsError) throw fetchStylistsError
      const data = {}
      ids.forEach(id => {
        data[id] = stylists.filter(stylist => stylist.shopID === id).length
      })
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
}
