import { Stage } from 'telegraf'

import repo from './repo'
import templates from './templates'
import { TemplateService } from '../../services/TemplateService'
import { Command } from './Command'

export function getCommands(templateService: TemplateService): Command[] {
  return [
    { name: 'new', help: 'Creates a new template', run: Stage.enter('create-template') as any },
    {
      name: 'render',
      help: 'Creates image from a template',
      run: Stage.enter('render-template') as any
    },
    // { name: 'update', help: 'Modifies an existing template', run: Stage.enter('update-template') as any },
    {
      name: 'delete',
      help: 'Deletes a template from the database',
      run: Stage.enter('delete-template') as any
    },
    {
      name: 'share',
      help: 'Shares a template with another user',
      run: Stage.enter('share-template') as any
    },
    {
      name: 'start',
      help: 'Says hello',
      run: async ctx => ctx.reply('Hi there! Use /new to create a new template :D')
    },
    templates.factory(templateService),
    repo.factory(),
    { name: '*', run: async ({ reply }) => reply("Hm... I don't know that command :/") }
  ]
}
