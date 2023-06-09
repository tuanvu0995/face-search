import uniqid from 'uniqid'

export function generate(prefix: string = ''): string {
  return uniqid(prefix)
}
