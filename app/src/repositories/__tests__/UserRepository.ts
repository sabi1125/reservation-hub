import {
  fetch, fetchAll, totalCount, insertUserWithProfile, updateUserFromAdmin,
} from '../UserRepository'
import { User } from '../../entities/User'

describe('Fetch Users', () => {
  it('Should exist', () => {
    expect(fetchAll).toBeDefined()
  })

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
  it('Should exist', () => {
    expect(totalCount).toBeDefined()
  })
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
  test('Should exist', () => {
    expect(fetch).toBeDefined()
  })
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

describe('Insert user', () => {
  const userObj = {
    email: 'test@test.com',
    password: 'testtest',
    profile: {
      lastNameKanji: 'test',
      firstNameKanji: 'test',
      lastNameKana: 'test',
      firstNameKana: 'test',
      birthday: '1991-08-29',
      gender: '0',
    },
  }

  test('Should exist', async () => {
    expect(insertUserWithProfile).toBeDefined()
  })

  test('Should insert user from admin', async () => {
    const user = await insertUserWithProfile(userObj.email,
      userObj.password, [1], userObj.profile.lastNameKanji,
      userObj.profile.firstNameKanji, userObj.profile.lastNameKana,
      userObj.profile.firstNameKanji,
      userObj.profile.birthday, userObj.profile.gender)

    expect(user).not.toBeNull()
  })

  test('Should throw when user with same email is entered', async () => {
    await expect(insertUserWithProfile(userObj.email,
      userObj.password, [1], userObj.profile.lastNameKanji,
      userObj.profile.firstNameKanji, userObj.profile.lastNameKana,
      userObj.profile.firstNameKanji,
      userObj.profile.birthday, userObj.profile.gender)).rejects.toThrow(Error)
  })
})

describe('Update User', () => {
  const userObj = {
    email: 'test@test.com',
    password: 'testtest',
    profile: {
      lastNameKanji: 'teste',
      firstNameKanji: 'teste',
      lastNameKana: 'teste',
      firstNameKana: 'teste',
      birthday: '1991-08-29',
      gender: '0',
    },
  }

  test('Should exist', async () => {
    expect(updateUserFromAdmin).toBeDefined()
  })

  test('Should insert user from admin', async () => {
    const user = await updateUserFromAdmin(5, userObj.email,
      userObj.password, userObj.profile.lastNameKanji,
      userObj.profile.firstNameKanji, userObj.profile.lastNameKana,
      userObj.profile.firstNameKanji,
      userObj.profile.birthday, userObj.profile.gender,
      [2], [1])

    expect(user).not.toBeNull()
  })

  test('Should throw when user with same email is entered', async () => {
    await expect(updateUserFromAdmin(10, userObj.email,
      userObj.password, userObj.profile.lastNameKanji,
      userObj.profile.firstNameKanji, userObj.profile.lastNameKana,
      userObj.profile.firstNameKanji,
      userObj.profile.birthday, userObj.profile.gender,
      [1], [2])).rejects.toThrow(Error)
  })
})
