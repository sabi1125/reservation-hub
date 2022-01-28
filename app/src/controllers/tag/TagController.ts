import { TagControllerInterface } from '@controller-adapter/Tag'
import { Tag } from '@entities/Tag'
import { OrderBy } from '@request-response-types/Common'
import TagService from '@tag/services/TagService'
import { indexSchema, tagUpsertSchema } from '@tag/schemas'

export type TagServiceInterface = {
  fetchTagsWithTotalCount(page?: number, order?: OrderBy): Promise<{ tags: Tag[], totalCount: number }>
  fetchTag(id: number): Promise<Tag>
  insertTag(slug: string): Promise<Tag>
  updateTag(id: number, slug: string): Promise<Tag>
  deleteTag(id: number): Promise<Tag>
}

const TagController: TagControllerInterface = {
  async index(query) {
    const { page, order } = await indexSchema.parseAsync(query)
    const { tags, totalCount } = await TagService.fetchTagsWithTotalCount(page, order)
    return { values: tags, totalCount }
  },

  async show(query) {
    const { id } = query
    return TagService.fetchTag(id)
  },

  async insert(query) {
    const { slug } = await tagUpsertSchema.parseAsync(query)
    await TagService.insertTag(slug)
    return 'Tag created'
  },

  async update(query) {
    const { id, params } = query
    const { slug } = await tagUpsertSchema.parseAsync(params)
    await TagService.updateTag(id, slug)
    return 'Tag updated'
  },

  async delete(query) {
    const { id } = query
    await TagService.deleteTag(id)
    return 'Tag deleted'
  },
}

export default TagController
