import { load, type CheerioAPI } from 'cheerio'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Sprite } from '../src/types/sprite'
import { logImportError } from './errorLogger'
import { mergeSpriteCatalog } from '../src/utils/spriteCatalog'
const BASE_URL = 'https://fortnite.gg', INDEX_URL = `${BASE_URL}/sprites`, OUTPUT_PATH = resolve(import.meta.dir, '../src/data/sprites.json')
const VARIANTS = ['cube', 'gold', 'quack', 'gummy', 'galaxy', 'gem', 'holofoil']
const sleep = (duration: number) => new Promise((done) => setTimeout(done, duration))
const absoluteUrl = (path = '') => new URL(path, BASE_URL).href
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() || undefined
const numberFrom = (value?: string) => { const parsed = Number(value?.replace(/[^\d.-]/g, '')); return Number.isFinite(parsed) ? parsed : undefined }
async function fetchHtml(url: string) { const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { 'User-Agent': 'SpriteChecklist/1.0 (data import; respectful rate limit)' } }); if (!response.ok) throw new Error(`HTTP ${response.status} pour ${url}`); return response.text() }
function readFact($: CheerioAPI, label: string) { const fact = $('.sprite-fact').filter((_, element) => clean($(element).find('span').text()) === label).first(); return clean(fact.find('b').text()) }
function parseDetail(html: string) {
  const $ = load(html), descriptions = $('.sprite-desc').map((_, element) => clean($(element).text())).get().filter(Boolean)
  const dropHeading = $('.sprite-facts-subtitle').filter((_, element) => clean($(element).text()) === 'Drop Chances').first()
  const dropChances = dropHeading.next('.sprite-facts').find('.sprite-fact').map((_, element) => ({ source: clean($(element).find('span').text()) ?? '', chance: clean($(element).find('b').text()) ?? '' })).get().filter((drop) => drop.source && drop.chance)
  return { image: absoluteUrl($('.sprite-detail-art img').attr('src')), description: descriptions.join(' '), location: readFact($, 'Location'), variant: readFact($, 'Variant')?.toLowerCase(), summonCost: numberFrom(readFact($, 'Summon Cost')), dropChances: dropChances.length ? dropChances : undefined }
}
function spriteTypeFrom(name: string) { const variant = VARIANTS.find((item) => name.toLowerCase().startsWith(`${item} `)); return variant ? name.slice(variant.length + 1) : name }
async function run() {
  const previous = JSON.parse(await readFile(OUTPUT_PATH, 'utf8')) as Sprite[]
  console.log(`Chargement de ${INDEX_URL}`); const $ = load(await fetchHtml(INDEX_URL))
  const cards = $('.sprite-card').map((_, element) => { const card = $(element), href = card.find('a.sprite-name').attr('href') ?? card.find('a.sprite-art').attr('href') ?? '', match = href.match(/^\/sprites\/(\d+)-(.+)$/); if (!match) return; const [, id = '', slug = ''] = match; return { id, slug, name: clean(card.find('.sprite-name').text()) ?? slug, href, rarity: card.attr('data-rarity'), variant: card.attr('data-variant'), percentage: numberFrom(card.find('.sprite-meta .sprite-pill').eq(1).text()), image: absoluteUrl(card.find('img').attr('src')) } }).get().filter(Boolean)
  const sprites: Sprite[] = []
  for (const [index, card] of cards.entries()) { console.log(`[${index + 1}/${cards.length}] ${card.name}`); try { const detail = parseDetail(await fetchHtml(absoluteUrl(card.href))); sprites.push({ ...card, ...detail, image: detail.image || card.image, spriteType: spriteTypeFrom(card.name), sourceUrl: absoluteUrl(card.href) }) } catch (error) { const errorId = logImportError(error, { spriteId: card.id, sourceUrl: absoluteUrl(card.href), step: 'detail' }); console.error(`  Détail indisponible. Référence : ${errorId}`); sprites.push({ ...card, spriteType: spriteTypeFrom(card.name), sourceUrl: absoluteUrl(card.href) }) } if (index < cards.length - 1) await sleep(90) }
  const uniqueSprites = [...new Map(sprites.map((sprite) => [sprite.id, sprite])).values()]
  const catalog = mergeSpriteCatalog(previous, uniqueSprites)
  await writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
  const archivedCount = catalog.filter((sprite) => sprite.releaseStatus === 'archived').length
  const newCount = catalog.filter((sprite) => sprite.releaseStatus === 'new').length
  console.log(`Import terminé : ${catalog.length} sprites (${newCount} nouveaux, ${archivedCount} archivés)`)
}
run().catch((error) => { const errorId = logImportError(error, { sourceUrl: INDEX_URL, step: 'index' }); console.error(`Import impossible. Référence : ${errorId}`); process.exitCode = 1 })
