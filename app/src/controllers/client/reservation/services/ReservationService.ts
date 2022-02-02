import { OrderBy, ScheduleDays } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { ReservationServiceInterface } from '@client/reservation/ReservationController'
import { InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import ReservationRepository from '@client/reservation/repositories/ReservationRepository'
import MenuRepository from '@client/reservation/repositories/MenuRepository'
import StylistRepository from '@client/reservation/repositories/StylistRepository'
import ShopRepository from '@client/reservation/repositories/ShopRepository'
import Logger from '@lib/Logger'
import { Stylist } from '@entities/Stylist'
import isWithinSchedule from '@lib/ScheduleChecker'
import today from '@lib/Today'
import { Shop } from '@entities/Shop'

export type ReservationRepositoryInterface = {
  fetchShopReservationsForAvailabilityWithMenuDuration(shopId: number, reservationDate: Date,
    rangeInDays: number) :Promise<(Reservation & { duration: number })[]>
  createReservation(clientId: number, shopId: number, reservationDate: Date, menuId: number, stylistId?: number)
    : Promise<Reservation>
  fetchUserReservations(userId: number, page: number, order: OrderBy, take: number): Promise<Reservation[]>
  fetchUserReservation(userId: number, reservationId: number): Promise<Reservation | null>
  fetchUserReservationTotalCount(id: number): Promise<number>
}

export type MenuRepositoryInterface = {
  fetchShopMenu(shopId: number, menuId: number): Promise<Menu | null>
  fetchMenusByIds(ids: number[]): Promise<Menu[]>
}

export type StylistRepositoryInterface = {
  fetchShopStylist(shopId: number, stylistId: number): Promise<Stylist | null>
  fetchStylistsByIds(ids: number[]): Promise<Stylist[]>
}

export type ShopRepositoryInterface = {
  fetchShopDetailsForReservation(shopId: number)
    : Promise<{ startTime: string, endTime: string, days: ScheduleDays[], seats: number} | null>
  fetchShopsByIds(ids: number[]): Promise<Shop[]>
}

const getConflictingReservations = (reservationDate: Date, menuDuration: number, shopReservations:
  (Reservation & { duration: number })[]): (Reservation & { duration: number })[] => {
  const reservationStartTime = reservationDate.getTime()
  const reservationEndTime = reservationDate.getTime() + (menuDuration * 1000 * 60)
  return shopReservations.filter(r => {
    const shopReservationStartTime = r.reservationDate.getTime()
    const shopReservationEndTime = r.reservationDate.getTime() + (r.duration * 1000 * 60)
    return (shopReservationStartTime <= reservationStartTime && reservationStartTime < shopReservationEndTime)
      || (shopReservationStartTime < reservationEndTime && reservationEndTime <= shopReservationEndTime)
  })
}

const ReservationService: ReservationServiceInterface = {
  async fetchShopReservationsForAvailability(user, shopId, reservationDate) {
    const numberOfDays = 7

    const reservations = await ReservationRepository.fetchShopReservationsForAvailabilityWithMenuDuration(
      shopId, reservationDate, numberOfDays,
    )

    return reservations.map(r => ({
      id: r.id,
      reservationStartDate: r.reservationDate,
      reservationEndDate: new Date(r.reservationDate.getTime() + (r.duration * 1000 * 60)),
      stylistId: r.stylistId,
    }))
  },

  async createReservation(user, shopId, reservationDate, menuId, stylistId) {
    const shopDetails = await ShopRepository.fetchShopDetailsForReservation(shopId)
    if (!shopDetails) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
    }

    if (reservationDate < today) {
      Logger.debug('Invalid date, earlier than today')
      throw new InvalidParamsError()
    }

    const menu = await MenuRepository.fetchShopMenu(shopId, menuId)
    if (!menu) {
      Logger.debug('Menu does not exist in shop')
      throw new InvalidParamsError()
    }

    // check shop schedule availability
    const reservationEndDate = new Date(reservationDate.getTime() + menu.duration * 1000 * 60)
    const reservationIsWithinShopSchedule = isWithinSchedule(shopDetails.startTime, shopDetails.endTime,
      shopDetails.days, reservationDate, reservationEndDate, [reservationDate.getDay()])

    if (!reservationIsWithinShopSchedule) {
      Logger.debug('Reservation date is not within shop schedule')
      throw new InvalidParamsError()
    }

    // check shop availability

    const reservationsForSameDay = await ReservationRepository.fetchShopReservationsForAvailabilityWithMenuDuration(
      shopId, reservationDate, 1,
    )

    const conflictingReservations = getConflictingReservations(reservationDate, menu.duration, reservationsForSameDay)
    if (conflictingReservations.length >= shopDetails.seats) {
      Logger.debug('Provided time is not available')
      throw new InvalidParamsError()
    }

    // stylist related checks
    let stylist
    if (stylistId) {
      stylist = await StylistRepository.fetchShopStylist(shopId, stylistId)
      if (!stylist) {
        Logger.debug('Stylist does not exist in shop')
        throw new InvalidParamsError()
      }

      const reservationIsWithinStylistSchedule = isWithinSchedule(stylist.startTime, stylist.endTime,
        stylist.days, reservationDate, reservationEndDate, [reservationDate.getDay()])
      if (!reservationIsWithinStylistSchedule) {
        Logger.debug('Reservation date is not within stylist schedule')
        throw new InvalidParamsError()
      }

      const stylistReservationsForSameDay = reservationsForSameDay.filter(rfs => rfs.stylistId === stylistId)
      const conflictingReservations = getConflictingReservations(
        reservationDate, menu.duration, stylistReservationsForSameDay,
      )
      if (conflictingReservations.length > 0) {
        Logger.debug('Stylist is not available for this reservation')
        throw new InvalidParamsError()
      }
    }

    return ReservationRepository.createReservation(user.id, shopId, reservationDate,
      menuId, stylistId)
  },

  async fetchUserReservationsWithShopAndMenuAndStylist(user, page = 1, order = OrderBy.DESC, take = 10) {
    const reservations = await ReservationRepository.fetchUserReservations(user.id, page, order, take)
    const menuIds: number[] = []
    const shopIds: number[] = []
    const stylistIds: number[] = []
    reservations.forEach(r => {
      menuIds.push(r.menuId)
      shopIds.push(r.shopId)
      if (r.stylistId) {
        stylistIds.push(r.stylistId)
      }
    })
    const reservationMenus = await MenuRepository.fetchMenusByIds(menuIds)
    const reservationShops = await ShopRepository.fetchShopsByIds(shopIds)
    const reservationStylists = await StylistRepository.fetchStylistsByIds(stylistIds)

    return reservations.map(r => ({
      ...r,
      shop: reservationShops.find(s => s.id === r.shopId)!,
      stylist: reservationStylists.find(s => s.id === r.stylistId),
      menu: reservationMenus.find(m => m.id === r.menuId)!,
    }))
  },

  async fetchUserReservationTotalCount(user) {
    return ReservationRepository.fetchUserReservationTotalCount(user.id)
  },

  async fetchUserReservationWithShopAndMenuAndStylist(user, id) {
    const reservation = await ReservationRepository.fetchUserReservation(user.id, id)
    if (!reservation) {
      Logger.debug('Reservation does not exist')
      throw new NotFoundError()
    }
    const menu = (await MenuRepository.fetchMenusByIds([reservation.menuId]))[0]
    const shop = (await ShopRepository.fetchShopsByIds([reservation.shopId]))[0]
    let stylist: Stylist | undefined
    if (reservation.stylistId) {
      stylist = (await StylistRepository.fetchStylistsByIds([reservation.stylistId])).pop()
    }
    return {
      ...reservation,
      menu,
      shop,
      stylist,
    }
  },
}

export default ReservationService
