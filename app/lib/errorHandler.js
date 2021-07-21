// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('error: ', err)
  if (err.name === 'ValidationError') {
    // mongoose model validation エラー処理
    if (err.errors !== undefined && err.errors.details.name === 'ValidatorError') {
      const mongooseErrors = Object.entries(err.errors).map(([key, val]) => ({
        label: key,
        message: val.message,
      }))
      return res.status(400).send(mongooseErrors)
    }
    // else

    // Joi Validation エラー処理
    const messages = err.details.map(e => ({
      label: e.context.label,
      message: e.message,
    }))
    return res.status(400).send(messages)
  }

  // prisma errors
  if (err.code[0] === 'P') {
    return res.status(401).send({ message: err.meta.cause || 'Bad request' })
  }

  if (err.name === 'DocumentNotFoundError' || err.code === 404) {
    return res.status(404).send({ message: err.message || 'Error: Not Found' })
  }

  if (err.code === 401) {
    return res.status(err.code).send({ message: err.message || 'ERROR' })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(400).send({ message: err.message })
  }

  return res.status(err.code || 500).send({ message: err.message || 'Internal Server Error', data: err.data })
}
