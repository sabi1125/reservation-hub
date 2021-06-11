exports.errorHandler = (err, req, res, next) => {
  console.log('error: ', err)
  if ("ValidationError" === err.name) {
    const messages = err.details.map(e => {
      return {
        label: e.context.label,
        message: e.message
      }
    })
    return res.status(400).send(messages)
  }

  if (err.name === "DocumentNotFoundError") {
    return res.status(404).send({message: 'Error: Not Found'})
  }

  return res.status(err.code || 500).send({message: err.message || 'Internal Server Error', data: err.data})
}