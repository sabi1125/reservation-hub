import { Prisma } from '@prisma/client'
import prisma from './prisma'
import { Reservation } from '../entities/Reservation'
import { ReservationRepositoryInterface as ReservationServiceSocket } from '../services/ReservationService'
import { ReservationRepositoryInterface as ShopServiceSocket } from '../services/ShopService'
import { CommonRepositoryInterface, DescOrder } from './CommonRepository'

const reservationWithUserAndStylistAndShopWithoutLocation = Prisma.validator<Prisma.ReservationArgs>()(
  {
    include: {
      user: { include: { profile: true, roles: { include: { role: true } } } },
      shop: { include: { shopDetail: true } },
      stylist: { include: { shop: true } },
    },
  },
)
type reservationWithUserAndStylistAndShopWithoutLocation =
Prisma.ReservationGetPayload<typeof reservationWithUserAndStylistAndShopWithoutLocation>

export const reconstructReservation = (reservation: reservationWithUserAndStylistAndShopWithoutLocation)
: Reservation => ({
  id: reservation.id,
  reservationDate: reservation.reservationDate,
  shop: {
    id: reservation.shop.id,
    name: reservation.shop.shopDetail?.name,
  },
  stylist: {
    id: reservation.stylist.id,
    name: reservation.stylist.name,
    price: reservation.stylist.price,
    shop: reservation.stylist.shop,
  },
  user: {
    id: reservation.user.id,
    email: reservation.user.email,
    lastNameKanji: reservation.user.profile?.lastNameKanji,
    firstNameKanji: reservation.user.profile?.firstNameKanji,
    lastNameKana: reservation.user.profile?.firstNameKana,
    firstNameKana: reservation.user.profile?.firstNameKana,
    roles: reservation.user.roles.map(role => role.role),
  },
})

const ReservationRepository: CommonRepositoryInterface<Reservation> & ReservationServiceSocket & ShopServiceSocket = {
  async fetchAll({ page = 0, order = DescOrder, limit = 10 }) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const reservations = await prisma.reservation.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
      include: {
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
      },
    })

    const cleanReservations = reservations.map(r => reconstructReservation(r))

    return cleanReservations
  },

  async totalCount() {
    return prisma.reservation.count()
  },

  async fetch(id) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
      },
    })
    return reservation ? reconstructReservation(reservation) : null
  },

  async searchReservations(keyword) {
    const userIds = await prisma.$queryRaw('SELECT id FROM "User" WHERE (username ILIKE $1 or email ILIKE $2)',
      `${keyword}%`,
      `${keyword}%`)

    let mappedIds = userIds.map((obj: any) => obj.id)
    if (mappedIds.length === 0) {
      mappedIds = [0]
    }
    const reservations = await prisma.$queryRaw(`SELECT s.name,r.reservation_date,st.name,st.price,u.email 
    FROM "Reservation" AS r 
    INNER JOIN "ShopDetail" AS s ON s.id = r.shop_id
    INNER JOIN "Stylist" AS st ON st.id = r.stylist_id
    INNER JOIN "User" AS u ON u.id = r.user_id
    WHERE r.user_id IN (${mappedIds})`)
    return reservations
  },

  async fetchReservationsByShopIds(shopIds) {
    const reservations = await prisma.reservation.findMany({
      where: { shopId: { in: shopIds } },
      include: {
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
      },
    })

    const finalData = shopIds.map(id => ({
      id,
      data: reservations.filter(reservation => reservation.shopId === id)
        .map(reservation => reconstructReservation(reservation)),
    }))

    return finalData
  },

  async fetchReservationsCountByShopIds(shopIds) {
    const value = await this.fetchReservationsByShopIds(shopIds)
    const finalData = value.map(item => ({ id: item.id, count: item.data.length }))
    return finalData
  },

  async insertReservation(reservationDate, userId, shopId, stylistId) {
    const reservation = await prisma.reservation.create({
      data: {
        reservationDate,
        shop: {
          connect: { id: shopId },
        },
        stylist: {
          connect: { id: stylistId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },

  async updateReservation(id, reservationDate, userId, shopId, stylistId) {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        reservationDate,
        shop: {
          connect: { id: shopId },
        },
        stylist: {
          connect: { id: stylistId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },

  async deleteReservation(id) {
    const reservation = await prisma.reservation.delete({
      where: { id },
      include: {
        user: { include: { profile: true, roles: { include: { role: true } } } },
        shop: { include: { shopDetail: true } },
        stylist: { include: { shop: true } },
      },
    })
    const cleanReservation = reconstructReservation(reservation)
    return cleanReservation
  },
}

export default ReservationRepository
