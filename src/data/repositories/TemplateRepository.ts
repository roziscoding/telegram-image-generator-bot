import { Db } from 'mongodb'
import { MongodbRepository } from '@nindoo/mongodb-data-layer'

import { Template } from '../../domain/Template'

export class TemplateRepository extends MongodbRepository<Template> {
  constructor (connection: Db) {
    super(connection.collection('templates'))
  }

  async getAll () {
    return this.unpaginatedSearch({})
  }

  async getForUser (userId: number) {
    return this.unpaginatedSearch({ owners: userId })
  }
}
