import bcrypt from 'bcrypt'
import prisma from '../src/repositories/prisma'
import areas from './areas-db'
import prefectures from './prefec-db'
import cities from './cities-db'
import { RoleSlug } from '.prisma/client'

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
    firstNameKanji: 'sabir',
    lastNameKanji: 'barahi',
    firstNameKana: 'サビル',
    lastNameKana: 'バラヒ',
    password: 'testtest',
    email: 'sabirbarahi41@gmail.com',
  },
]

const staffs = [
  {
    firstNameKanji: 'staff',
    lastNameKanji: 'staff',
    firstNameKana: 'staff',
    lastNameKana: 'staff',
    password: 'testtest',
    email: 'staff1@staff.com',
  },
  {
    firstNameKanji: 'staff',
    lastNameKanji: 'staff',
    firstNameKana: 'staff',
    lastNameKana: 'staff',
    password: 'testtest',
    email: 'staff2@staff.com',
  },
  {
    firstNameKanji: 'staff',
    lastNameKanji: 'staff',
    firstNameKana: 'staff',
    lastNameKana: 'staff',
    password: 'testtest',
    email: 'staff3@staff.com',
  },
  {
    firstNameKanji: 'staff',
    lastNameKanji: 'staff',
    firstNameKana: 'staff',
    lastNameKana: 'staff',
    password: 'testtest',
    email: 'staff4@staff.com',
  },
  {
    firstNameKanji: 'staff',
    lastNameKanji: 'staff',
    firstNameKana: 'staff',
    lastNameKana: 'staff',
    password: 'testtest',
    email: 'staff5@staff.com',
  },
  {
    firstNameKanji: 'staff',
    lastNameKanji: 'staff',
    firstNameKana: 'staff',
    lastNameKana: 'staff',
    password: 'testtest',
    email: 'staff6@staff.com',
  },
]

const roles = [
  {
    name: 'admin',
    slug: RoleSlug.ADMIN,
    description: 'Administrator role. Can make changes on everything.',
  },
  {
    name: 'client',
    slug: RoleSlug.CLIENT,
    description: 'Client role. Can make profile and reservations.',
  },
  {
    name: 'shop staff',
    slug: RoleSlug.SHOP_STAFF,
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
    where: { slug: RoleSlug.ADMIN },
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
          role: {
            connect: {
              id: adminRole?.id,
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

  console.log('running staff seeder')

  const staffRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.SHOP_STAFF },
  })

  const staffPromises = staffs.map(async (staff: any) => {
    try {
      return prisma.user.upsert({
        where: { email: staff.email },
        update: {},
        create: {
          email: staff.email,
          username: staff.username,
          password: bcrypt.hashSync(staff.password, 10),
          profile: {
            create: {
              firstNameKanji: staff.firstNameKanji,
              lastNameKanji: staff.lastNameKanji,
              firstNameKana: staff.firstNameKana,
              lastNameKana: staff.lastNameKana,
            },
          },
          role: {
            connect: {
              id: staffRole?.id,
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })

  await Promise.all(staffPromises)

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
      const shopDetail = await prisma.shopDetail.create({
        data: {
          name: 'TEST',
        },
      })
      const menu = await prisma.menu.create({
        data: {},
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
            connect: {
              id: shopDetail.id,
            },
          },
          menu: {
            connect: { id: menu.id },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
    count--
  }

  console.log('connecting staff to shops')
  const shopStaffs = await prisma.user.findMany({
    where: { role: { slug: RoleSlug.SHOP_STAFF } },
  })
  const staffShopTargets = await prisma.shop.findMany({})
  shopStaffs.map(async ss => {
    await prisma.shopUser.create({
      data: {
        shopId: staffShopTargets[ss.id].id,
        userId: ss.id,
      },
    })
  })

  console.log('running menu item seeder')
  const menus = await prisma.menu.findMany()
  const menuIds = menus.map(m => m.id)
  const menuItemPromises = menuIds.map(async id => prisma.menuItem.create({
    data: {
      name: 'test',
      description: 'test',
      price: 500,
      menuId: id,
      duration: 60,
    },
  }))

  await Promise.all(menuItemPromises)

  console.log('running stylist seeder')
  const shopCounts = await prisma.shop.count()
  const randomShopInt = Math.floor(Math.random() * shopCounts)
  const randomShop = async () => prisma.shop.findFirst({ skip: randomShopInt })
  const stylists = [
    { name: 'Testarou', price: 500, shop: await randomShop() },
    { name: 'Testoko', price: 500, shop: await randomShop() },
  ]

  const stylistPromises = stylists.map(async stylist => prisma.stylist.create({
    data: {
      name: stylist.name,
      price: stylist.price,
      shop: {
        connect: {
          id: stylist.shop?.id,
        },
      },
    },
  }))

  await Promise.all(stylistPromises)

  console.log('running reservation seeder')
  const randomStylist = await prisma.stylist.findFirst({
    include: { shop: { include: { menu: { include: { items: true } } } } },
  })
  const reservations = [
    { date: new Date('2022-09-01') },
    { date: new Date('2022-09-02') },
    { date: new Date('2022-09-03') },
    { date: new Date('2022-09-04') },
  ]
  const reservationPromises = reservations.map(reservation => prisma.reservation.create({
    data: {
      reservationDate: reservation.date,
      stylistId: randomStylist!.id,
      shopId: randomStylist!.shopId,
      userId: 1,
      menuItemId: randomStylist!.shop.menu!.items[0].id,
    },
  }))

  await Promise.all(reservationPromises)

  console.log('seed done')
  process.exit()
})()
