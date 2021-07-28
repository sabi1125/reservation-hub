const ShopRepository = require('./src/repositories/ShopRepository');

(async () => {
  try {
    const ids = [125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136]
    const { error, value } = await ShopRepository.fetchShopStylistsCountByIDs(ids)
    if (error) {
      console.error(error)
      process.exit()
    }
    console.log(value)
  } catch (e) {
    console.error(e)
  } finally {
    process.exit()
  }
})()