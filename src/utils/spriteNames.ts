const baseNameTranslations: Record<string, string> = {
  Air: 'Air',
  Boss: 'Boss',
  Demon: 'Démon',
  Dream: 'Rêve',
  Duck: 'Canard',
  Earth: 'Terre',
  Fire: 'Feu',
  Fishy: 'Poisson',
  Ghost: 'Fantôme',
  Grim: 'Sinistre',
  King: 'Roi',
  Llama: 'Lama',
  Peely: 'Banane',
  Seven: 'Sept',
  Striker: 'Buteur',
  Water: 'Eau',
  'Zero Point': 'Point zéro',
  'Burnt Peanut': 'Cacahuète grillée',
}

const variantTranslations: Record<string, string> = {
  Cube: 'cubique',
  Galaxy: 'galactique',
  Gem: 'précieux',
  Gold: 'doré',
  Gummy: 'gélifié',
  Holofoil: 'holographique',
  Quack: 'coin-coin',
}

export function localizeSpriteName(name: string): string {
  const directTranslation = baseNameTranslations[name]
  if (directTranslation) return directTranslation

  const variant = Object.keys(variantTranslations).find((prefix) => name.startsWith(`${prefix} `))
  if (!variant) return name

  const baseName = name.slice(variant.length + 1)
  const localizedBaseName = baseNameTranslations[baseName] ?? baseName
  return `${localizedBaseName} ${variantTranslations[variant]}`
}
