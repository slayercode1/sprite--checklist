const baseNameTranslations: Record<string, string> = {
  Air: 'Esprit d’air',
  Boss: 'Boss',
  Demon: 'Esprit démoniaque',
  Dream: 'Esprit onirique',
  Duck: 'Esprit canard',
  Earth: 'Esprit de terre',
  Fire: 'Esprit de feu',
  Fishy: 'Poiscaille',
  Ghost: 'Esprit fantôme',
  Grim: 'Sinistre',
  King: 'Esprit roi',
  Llama: 'Lama',
  Peely: 'Banane',
  Punk: 'Esprit punk',
  Seven: 'Les Sept',
  Striker: 'Buteur',
  Water: 'Esprit d’eau',
  'Zero Point': 'Esprit du Point zéro',
  'Burnt Peanut': 'Cacahuète grillée',
}

const nameVariantTranslations: Record<string, string> = {
  Cube: 'du Cube',
  Galaxy: 'galactique',
  Gem: 'de gemme',
  Gold: 'doré',
  Gummy: 'bonbon',
  Holofoil: 'Holofoil',
  Quack: 'coin-coin',
}

const filterVariantTranslations: Record<string, string> = {
  base: 'De base',
  candy: 'Bonbon',
  cube: 'Cube',
  galaxy: 'Galactique',
  gem: 'Gemme',
  gold: 'Doré',
  holofoil: 'Holofoil',
  quack: 'Coin-coin',
}

export function localizeSpriteType(type: string): string {
  return baseNameTranslations[type] ?? type
}

export function localizeSpriteVariant(variant: string): string {
  return filterVariantTranslations[variant.toLocaleLowerCase()] ?? variant
}

export function localizeSpriteName(name: string): string {
  const directTranslation = baseNameTranslations[name]
  if (directTranslation) return directTranslation

  const variant = Object.keys(nameVariantTranslations).find((prefix) => name.startsWith(`${prefix} `))
  if (!variant) return name

  const baseName = name.slice(variant.length + 1)
  const localizedBaseName = baseNameTranslations[baseName] ?? baseName
  return `${localizedBaseName} ${nameVariantTranslations[variant]}`
}
