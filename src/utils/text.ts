export const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim()
export const titleCase = (value: string) => value.replace(/\b\w/g, (letter) => letter.toUpperCase())
