const router = require('express').Router()
const eah = require('express-async-handler')
const LocationRepository = require('../repositories/LocationRepository')
const indexSchema = require('./schemas/indexSchema')

const joiOptions = { abortEarly: false, stripUnknown: true }

const index = eah(async (req, res, next) => {
  const {
    error: schemaError,
    value: schemaValues,
  } = indexSchema.validate(req.query, joiOptions)
  if (schemaError) {
    return next({ code: 400, message: 'Invalid query values', error: schemaError })
  }

  const {
    error: areaCountError,
    value: areaCount,
  } = await LocationRepository.fetchAreaCount(schemaValues.filter)
  if (areaCountError) {
    return next({ code: 500, message: 'Server error', error: areaCountError })
  }

  const {
    error: areaFetchError,
    value: areas,
  } = await LocationRepository.fetchAllAreas(
    schemaValues.page,
    schemaValues.order,
    schemaValues.filter,
  )

  if (areaFetchError) {
    return next({ code: 500, message: 'Server error', error: areaFetchError })
  }

  return res.send({ data: areas, totalCount: areaCount })
})

router.get('/', index)

module.exports = router
