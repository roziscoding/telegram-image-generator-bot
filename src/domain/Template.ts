import { ObjectId } from 'mongodb'

export type Template = {
  _id: ObjectId
  name: string
  owners: number[]
  dimensions: {
    width: number
    height: number
  }
  engine: string
  template: string
  fields: string[]
}

export type UnsavedTemplate = Omit<Template, '_id' | 'owners'>
