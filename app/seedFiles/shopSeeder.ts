import prisma from '../prisma'

(async () => {
  const cityCount = 1747
  let count = 10
  while (count > 0) {
    const randomInt = Math.floor(Math.random() * cityCount)
    try {
      const city = await prisma.city.findFirst({
        skip: randomInt,
        include: {
          prefecture: {
            include: {
              area: true,
            },
          },
        },
      })
      await prisma.shop.create({
        data: {
          city: {
            connect: {
              id: city!.id,
            },
          },
          prefecture: {
            connect: {
              id: city!.prefecture.id,
            },
          },
          area: {
            connect: {
              id: city!.prefecture.area.id,
            },
          },
          shopDetail: {
            create: {
              name: 'Test Shop',
            },
          },
          menu: {
            create: {},
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
    count--
  }

  console.log('Seeding done!')
  process.exit()
})()
