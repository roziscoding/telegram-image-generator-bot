export type TemplateEngine = {
  id: string
  name: string
  render: (template: string, data: Record<string, any>) => string | Promise<string>
}
