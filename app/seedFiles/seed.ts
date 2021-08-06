import bcrypt from 'bcrypt'
import prisma from '../prisma'
import areas from './areas-db'
import prefectures from './prefec-db'
import cities from './cities-db'

const admins = [
  {
    firstNameKanji: 'eugene',
    lastNameKanji: 'sinamban',
    firstNameKana: 'ユージン',
    lastNameKana: 'シナンバン',
    password: 'testtest',
    email: 'eugene.sinamban@gmail.com',
  },
  {
    firstNameKanji: 'yoonsung',
    lastNameKanji: 'jang',
    firstNameKana: 'ユンソン',
    lastNameKana: 'チャン',
    password: 'testtest',
    email: 'upthe15752@gmail.com',
  },
  {
    firstNameKanji: 'sana',
    lastNameKanji: 'nakamura',
    firstNameKana: 'サナ',
    lastNameKana: 'ナカムラ',
    password: 'testtest',
    email: 'dq.tri.fi@gmail.com',
  },
  {
    firstNameKanji: 'sabir',
    lastNameKanji: 'barahi',
    firstNameKana: 'サビル',
    lastNameKana: 'バラヒ',
    password: 'testtest',
    email: 'sabirbarahi41@gmail.com',
  },
]

const roles = [
  {
    name: 'admin',
    slug: 'admin',
    description: 'Administrator role. Can make changes on everything.',
  },
  {
    name: 'client',
    slug: 'client',
    description: 'Client role. Can make profile and reservations.',
  },
  {
    name: 'shop staff',
    slug: 'shop_staff',
    description: 'Shop staff user role. Can view shop details connected to the user.',
  },
];

(async () => {
  console.log('running seeder')

  console.log('running roles seeder')
  await Promise.all(roles.map(async item => {
    try {
      await prisma.role.upsert({
        where: {
          slug: item.slug,
        },
        update: item,
        create: item,
      })
    } catch (e) {
      console.error('Role Error', e)
      process.exit()
    }
  }))

  console.log('running admins seeder')

  const adminRole = await prisma.role.findUnique({
    where: { slug: 'admin' },
  })
  const adminPromises = admins.map(async (admin: any) => {
    try {
      return prisma.user.upsert({
        where: { email: admin.email },
        update: {},
        create: {
          email: admin.email,
          username: admin.username,
          password: bcrypt.hashSync(admin.password, 10),
          profile: {
            create: {
              firstNameKanji: admin.firstNameKanji,
              lastNameKanji: admin.lastNameKanji,
              firstNameKana: admin.firstNameKana,
              lastNameKana: admin.lastNameKana,
            },
          },
          roles: {
            create: {
              role: {
                connect: {
                  id: adminRole?.id,
                },
              },
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })
  await Promise.all(adminPromises)

  console.log('running area seeder')

  await prisma.area.createMany({
    data: areas.map((area: any) => ({
      slug: area.slug,
      name: area.name,
    })),
    skipDuplicates: true,
  })

  console.log('running prefecture seeder')

  const prefecturePromises = prefectures.map(async prefec => {
    try {
      return await prisma.prefecture.upsert({
        where: { slug: prefec.slug },
        update: {},
        create: {
          name: prefec.name,
          slug: prefec.slug,
          area: {
            connect: {
              slug: prefec.area,
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })

  await Promise.all(prefecturePromises)

  console.log('running city seeder')

  const cityPromises = cities.map(async city => {
    try {
      return await prisma.city.upsert({
        where: { slug: `SUB${city.id}` },
        update: {},
        create: {
          name: city.name,
          slug: `SUB${city.id}`,
          prefecture: {
            connect: {
              slug: city.prefecture,
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })

  await Promise.all(cityPromises)

  console.log('running shop seeder')
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
              id: city?.id,
            },
          },
          prefecture: {
            connect: {
              id: city?.prefecture.id,
            },
          },
          area: {
            connect: {
              id: city?.prefecture.area.id,
            },
          },
          shopDetail: {
            create: {
              name: 'TEST',
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

  console.log('running stylist seeder')
  const shopCounts = await prisma.shop.count()
  const randomShopInt = Math.floor(Math.random() * shopCounts)
  const randomShop = async () => prisma.shop.findFirst({ skip: randomShopInt })
  const stylists = [
    { name: 'Testarou', shop: await randomShop() },
    { name: 'Testoko', shop: await randomShop() },
  ]

  const stylistPromises = stylists.map(async stylist => prisma.stylist.create({
    data: {
      name: stylist.name,
      shops: {
        create: {
          shop: {
            connect: { id: stylist.shop?.id },
          },
        },
      },
    },
  }))

  await Promise.all(stylistPromises)

  console.log('seed done')
  process.exit()
})()
