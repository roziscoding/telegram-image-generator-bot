import { TemplateRepository } from '../data/repositories/TemplateRepository'
import { UnsavedTemplate, Template } from '../domain/Template'
import { ObjectId } from 'mongodb'

export class TemplateService {
  constructor(private readonly repository: TemplateRepository) {}

  async create(templateData: UnsavedTemplate, userId: number) {
    const id = new ObjectId()

    const template: Template = {
      _id: id,
      ...templateData,
      owners: [userId]
    }

    await this.repository.save(template)

    return template
  }

  async getByUserId(userId: number) {
    return this.repository.getForUser(userId)
  }

  async update(template: Template) {
    return this.repository.save(template)
  }

  async remove(id: ObjectId) {
    return this.repository.deleteById(id)
  }
}
