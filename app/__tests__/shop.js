const ShopRepository = require('../src/repositories/ShopRepository')

it('Jest test', () => {
  expect(1).toBe(1)
})

it('Shop Repository is defined', () => {
  expect(ShopRepository).toBeDefined()
})

it('clean relation models method exists', () => {
  expect(ShopRepository.cleanRelationModels).toBeDefined()
})

it('clean relation models method removes shop details', () => {
  const shop = { id: 1, shopDetail: { name: 'test' } }
  ShopRepository.cleanRelationModels(shop)
  expect(shop).toEqual({ id: 1, name: 'test' })
})

