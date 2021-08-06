import {
  fetch, fetchAll, totalCount, insertUserWithProfile,
} from '../UserRepository'
import { User } from '../../entities/User'
import { prismaMock } from '../../../singleton'

describe('Fetch Users', () => {
  it('Should not be null', async () => {
    await expect(fetchAll()).not.toBeNull()
  })

  it('Should have email', async () => {
    const users = await fetchAll()
    expect(users[0]).toHaveProperty('email')
  })

  it('Should be an array', async () => {
    const users = await fetchAll()
    expect(users).toBeInstanceOf(Array)
  })

  it('The first item should not have 1 as id when sorted by descending', async () => {
    const users = await fetchAll(1, 'desc')
    expect(users[0]).not.toHaveProperty('id', 1)
  })
})

describe('Total Count', () => {
  it('Should be a number', async () => {
    const count = await totalCount()
    expect(count).not.toBeNaN()
  })

  it('Should not be null', async () => {
    const count = await totalCount()
    expect(count).not.toBeNull()
  })
})

describe('Fetch user', () => {
  it('Should not be null when id is correct', async () => {
    const user = await fetch(1)
    expect(user).not.toBeNull()
  })

  it('Should have the same id as the argument', async () => {
    const user = await fetch(1)
    expect(user).toHaveProperty('id', 1)
  })

  it('Should return null if no match', async () => {
    const user = await fetch(999)
    expect(user).toBeNull()
  })

  it('Should return null if negative id is passed', async () => {
    const user = await fetch(-1)
    expect(user).toBeNull()
  })
})
