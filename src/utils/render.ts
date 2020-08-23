import pug from 'pug'
import swig from 'swig'
import hogan from 'hogan.js'
import nunjucks from 'nunjucks'
import handlebars from 'handlebars'

import { Template } from '../domain/Template'
import { TemplateEngine } from '../domain/TemplateEngine'

export const ENGINES: TemplateEngine[] = [
  {
    id: 'nunjucks',
    name: 'Nunjucks',
    render: (template, data) => nunjucks.renderString(template, data)
  },
  {
    id: 'handlebars',
    name: 'Handlebars',
    render: (template, data) => handlebars.compile(template)(data)
  },
  { id: 'pug', name: 'Pug', render: (template, data) => pug.render(template, data) },
  {
    id: 'hogan',
    name: 'Hogan.js',
    render: (template, data) => hogan.compile(template).render(data)
  },
  { id: 'swig', name: 'Swig', render: (template, data) => swig.render(template, data) }
]

export const ENGINE_OPTIONS = ENGINES.map(({ id, name }) => ({ name, value: id }))

export function render(template: Template, data: Record<string, any>) {
  const engine = ENGINES.find(({ id }) => id === template.engine)

  if (!engine) throw new Error(`Engine ${template.engine} is not supported`)

  return engine.render(template.template, data)
}
