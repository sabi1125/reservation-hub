import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import { reservationUpsertSchema } from './schemas/reservation'
import indexSchema from './schemas/indexSchema'
import { Reservation } from '../entities/Reservation'
import ReservationService from '../services/ReservationService'
import { insertReservationQuery, updateReservationQuery } from '../request-response-types/ReservationService'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import { searchSchema } from './schemas/search'
import { User } from '../entities/User'

export type ReservationServiceInterface = {
  fetchReservationsWithTotalCount(query: fetchModelsWithTotalCountQuery)
    : Promise<{ data: Reservation[], totalCount: number }>,
  fetchReservation(id: number): Promise<Reservation>,
  insertReservation(query: insertReservationQuery): Promise<Reservation>,
  updateReservation(query: updateReservationQuery): Promise<Reservation>,
  deleteReservation(id: number): Promise<Reservation>,
  searchReservations(keyword: string): Promise<User[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const index = asyncHandler(async (req, res) => {
  const params = await indexSchema.validateAsync(req.query, joiOptions)
  const reservationsWithcount = await ReservationService.fetchReservationsWithTotalCount(params)
  return res.send(reservationsWithcount)
})

export const showReservation = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const reservation = await ReservationService.fetchReservation(id)
  return res.send(reservation)
})

const insertReservation = asyncHandler(async (req, res) => {
  const params = await reservationUpsertSchema.validateAsync(req.body, joiOptions)
  const reservation = await ReservationService.insertReservation(params)
  return res.send(reservation)
})

export const searchReservations = asyncHandler(async (req, res) => {
  const searchValues = await searchSchema.validateAsync(req.body, joiOptions)
  const reservation = await ReservationService.searchReservations(searchValues.keyword)

  return res.send({ data: reservation })
})

const updateReservation = asyncHandler(async (req, res) => {
  const params = await reservationUpsertSchema.validateAsync(req.body, joiOptions)
  const { id } = res.locals
  const reservation = await ReservationService.updateReservation({ id, params })
  return res.send(reservation)
})

const deleteReservation = asyncHandler(async (req, res) => {
  const { id } = res.locals
  await ReservationService.deleteReservation(id)
  return res.send({ message: 'Reservation deleted' })
})

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showReservation)
routes.post('/', roleCheck(['admin']), insertReservation)
routes.post('/search', searchReservations)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateReservation)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteReservation)

export default routes
