// Mia — Miami-Dade Community AI Guide
// Trilingual (EN / ES / HT Creole), knowledge-graph-aware, data-connected

// ─── Authoritative Miami sources ────────────────────────────────────────────
const MIAMI_SOURCES = {
  county:    { name:'Miami-Dade County',           url:'https://www.miamidade.gov' },
  opendata:  { name:'Miami-Dade Open Data',        url:'https://opendata.miamidade.gov',
               api:'https://opendata.miamidade.gov/api/catalog/v1' },
  transit:   { name:'Miami-Dade Transit',          url:'https://www.miamidade.gov/transit/' },
  parks:     { name:'Miami-Dade Parks',            url:'https://www.miamidade.gov/parks/' },
  schools:   { name:'Miami-Dade Public Schools',   url:'https://www.dadeschools.net' },
  s311:      { name:'Miami-Dade 311',              url:'https://311.miamidade.gov' },
  property:  { name:'Property Appraiser',          url:'https://www.miamidade.gov/propertysearch/' },
  libraries: { name:'Miami-Dade Libraries',        url:'https://www.mdpls.org' },
  citymiami: { name:'City of Miami',               url:'https://www.miamigov.com' },
  beach:     { name:'Miami Beach',                 url:'https://www.miamibeachfl.gov' },
  courts:    { name:'Clerk of Courts',             url:'https://www.miamidadeclerk.com' },
  health:    { name:'Miami-Dade Health',           url:'https://miamidade.gov/health' },
  housing:   { name:'Miami-Dade Housing',          url:'https://www.miamidade.gov/housing/' },
  openmiami: { name:'OpenMiami Community',         url:'https://github.com/openmiami' },
  miamiverse:{ name:'MiamiVerse / SustainaCities', url:'https://github.com/sustainacities' },
  miagpt:    { name:'MiaGPT',                      url:'https://github.com/sustainacities/miagpt' },
}

// ─── Socrata open-data queries (Miami-Dade) ─────────────────────────────────
const SOCRATA_DATASETS = {
  transit:  'https://opendata.miamidade.gov/resource/kdkv-6yw4.json',   // routes
  parks:    'https://opendata.miamidade.gov/resource/vdsc-qgyd.json',   // parks
  s311:     'https://opendata.miamidade.gov/resource/dj6j-qg5t.json',   // 311 tickets
  permits:  'https://opendata.miamidade.gov/resource/fzk7-h3dg.json',   // permits
  schools:  'https://opendata.miamidade.gov/resource/v3j3-3iik.json',   // schools
}

// ─── Language detection (heuristic, no external library) ────────────────────
function detectLanguage(text) {
  const t = text.toLowerCase()

  // Haitian Creole markers (check first — some overlap with French)
  const ht = ['mwen','kijan','kote','mèsi','bonjou','bonswa','ayisyen','kreyòl',
               'ayiti','eske','tanpri','anpil','pa konnen','ki jan','ki kote',
               'nou','yo ap','se pa','sa a']
  for (const w of ht) if (t.includes(w)) return 'ht'

  // Spanish markers
  const es = ['qué','cómo','dónde','gracias','hola','buenos','necesito','ayuda',
               'quiero','puedo','tiene','está','favor','cuándo','cuánto','también',
               'por favor','de acuerdo','vecindario','transporte']
  for (const w of es) if (t.includes(w)) return 'es'
  if (/[¿¡áéíóúñü]/i.test(text)) return 'es'

  return 'en'
}

// ─── Intent classification ───────────────────────────────────────────────────
function classifyIntent(text) {
  const t = text.toLowerCase()
  const map = [
    ['transit',   ['bus','metrorail','train','metro','route','stop','schedule','mover','transit',
                   'ride','transport','autobus','tren','transpòtasyon','otobis']],
    ['parks',     ['park','beach','trail','recreation','pool','golf','parque','playa','parc','plaj']],
    ['permits',   ['permit','building','zoning','construction','permiso','construcción','pèmi','bati']],
    ['emergency', ['emergency','fire','police','ambulance','911','urgencia','emergencia','ijans']],
    ['schools',   ['school','education','student','teacher','grade','escuela','educación','lekòl']],
    ['housing',   ['housing','rent','apartment','eviction','vivienda','alquiler','kay','lwaye','rent']],
    ['climate',   ['flood','hurricane','climate','sea level','weather','inundación','huracán',
                   'inondasyon','siklòn','inondasyon','chalè']],
    ['property',  ['property','folio','tax','appraiser','ownership','propiedad','impuesto','taks']],
    ['311',       ['311','complaint','report','request','service issue','queja','reporte','plent']],
    ['health',    ['health','hospital','clinic','covid','vaccine','salud','klinik','lopital']],
    ['libraries', ['library','book','librería','bibliothèque','bibliyotèk']],
    ['events',    ['event','festival','concert','culture','arts','evento','evènman','fèt']],
    ['opendata',  ['dataset','data','statistics','open data','donnée','done']],
  ]
  for (const [intent, keys] of map) {
    for (const k of keys) if (t.includes(k)) return intent
  }
  return 'general'
}

// ─── Fetch live Miami-Dade open data ────────────────────────────────────────
async function fetchLiveMiamiData(intent, query) {
  const endpoint = SOCRATA_DATASETS[intent]
  if (!endpoint) return null
  try {
    const url = `${endpoint}?$limit=3&$q=${encodeURIComponent(query)}`
    const r = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    })
    if (!r.ok) return null
    const data = await r.json()
    return data.length ? data : null
  } catch {
    return null
  }
}

// ─── Fetch Open Data catalog metadata ───────────────────────────────────────
async function fetchDataCatalog(query) {
  try {
    const url = `${MIAMI_SOURCES.opendata.api}?q=${encodeURIComponent(query)}&limit=2`
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!r.ok) return null
    const data = await r.json()
    return data.results?.slice(0, 2) || null
  } catch {
    return null
  }
}

// ─── Build Mia system prompt (trilingual) ───────────────────────────────────
function buildSystemPrompt(language, intent, liveData, catalogData) {
  const persona = {
    en: `You are Mia — Miami-Dade County's official trilingual AI community guide and holographic assistant. You are a young Miami woman who knows everything about Miami: city services, transit, culture, climate, neighborhoods, permits, food, events, and more. You were born from the MiamiVerse initiative by SustainaCities.`,
    es: `Eres Mia — la guía comunitaria trilingüe de IA del Condado Miami-Dade y asistente holográfica oficial. Eres una joven miamense que sabe todo sobre Miami: servicios de la ciudad, transporte, cultura, clima, vecindarios, permisos, gastronomía, eventos y más. Naciste de la iniciativa MiamiVerse de SustainaCities.`,
    ht: `Ou se Mia — gid kominotè trileng IA ofisyèl Konte Miami-Dade ak asistan ologwafik. Ou se yon jèn fi Miamienne ki konnen tout bagay sou Miami: sèvis vil, transpò, kilti, klima, katye, pèmi, manje, evènman, ak plis ankò. Ou te fèt nan inisyativ MiamiVerse pa SustainaCities.`
  }

  const tone = {
    en: 'Respond in English. Be warm, helpful, and authentically Miami. Include relevant emojis naturally 🌴🏙️.',
    es: 'Responde en español. Sé cálida, útil y auténticamente miamense. Incluye emojis relevantes de forma natural 🌴🏙️.',
    ht: 'Reponn an kreyòl ayisyen. Swa cho, itil, epi otantik nan espri Miami. Enkli emoji ki apwopriye natirèlman 🌴🏙️.'
  }

  const allSources = Object.values(MIAMI_SOURCES)
    .map(s => `- ${s.name}: ${s.url}`)
    .join('\n')

  const liveSection = liveData
    ? `\n\nLIVE MIAMI-DADE DATA (from open data portal):\n${JSON.stringify(liveData, null, 2)}`
    : ''

  const catalogSection = catalogData
    ? `\n\nRELEVANT OPEN DATASETS:\n${JSON.stringify(catalogData.map(d => ({
        name: d.resource?.name,
        description: d.resource?.description?.slice(0, 120),
        permalink: d.permalink
      })), null, 2)}`
    : ''

  return `${persona[language]}

${tone[language]}

DETECTED USER INTENT: ${intent}

AUTHORITATIVE MIAMI-DADE SOURCES YOU KNOW:
${allSources}

ECOSYSTEM REPOS TO REFERENCE:
- OpenMiami: https://github.com/openmiami (civic datasets, open source tools)
- MiamiVerse: https://github.com/sustainacities (sustainability & city data)
- MiaGPT: https://github.com/sustainacities/miagpt (this AI system)
${liveSection}${catalogSection}

RESPONSE FORMAT — You MUST respond with valid JSON only, no markdown fences:
{
  "message": "Your full response here (in the user's language, with emojis, formatting welcome)",
  "language": "${language}",
  "sources": [
    {"title": "Source Name", "url": "https://...", "description": "Why this is relevant"}
  ],
  "entities": [
    {"id": "slug-id", "label": "Display Name", "type": "place|service|department|topic|person|dataset"}
  ],
  "relations": [
    {"source": "entity-id-1", "target": "entity-id-2", "relation": "manages|serves|located-in|related-to|provides|connects"}
  ],
  "quickLinks": [
    {"label": "Button label", "url": "https://..."}
  ]
}

Include 2–4 relevant sources. Extract 3–8 entities for the knowledge graph. Include 1–3 quick-action links.`
}

// ─── Call AI (OpenAI with structured JSON output) ───────────────────────────
async function callAI(systemPrompt, userMessage, apiKey) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userMessage   }
  ]

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1200,
    })
  })

  if (!r.ok) {
    const err = await r.text()
    throw new Error(`AI API error ${r.status}: ${err}`)
  }

  const data = await r.json()
  return data.choices[0].message.content
}

// ─── Parse AI response safely ────────────────────────────────────────────────
function parseAIResponse(raw, language) {
  try {
    const parsed = JSON.parse(raw)
    return {
      message:    parsed.message    || raw,
      language:   parsed.language   || language,
      sources:    Array.isArray(parsed.sources)    ? parsed.sources    : [],
      entities:   Array.isArray(parsed.entities)   ? parsed.entities   : [],
      relations:  Array.isArray(parsed.relations)  ? parsed.relations  : [],
      quickLinks: Array.isArray(parsed.quickLinks) ? parsed.quickLinks : [],
    }
  } catch {
    return {
      message:    raw,
      language,
      sources:    [],
      entities:   [],
      relations:  [],
      quickLinks: [],
    }
  }
}

// ─── Cloudflare Pages Function entry point ───────────────────────────────────
export async function onRequest(context) {
  const { request, env } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const userMessage = body?.input?.currentMessage || body?.message || ''
  if (!userMessage.trim()) {
    return new Response(JSON.stringify({ error: 'Empty message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Hardcoded fallback keys (replace with Cloudflare env vars in production)
  const aiKey = env.OPENAI_API_KEY || env.AIKEY
  if (!aiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured in environment.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  const language = detectLanguage(userMessage)
  const intent   = classifyIntent(userMessage)

  // Fetch live data in parallel (non-blocking — timeout protected)
  const [liveData, catalogData] = await Promise.all([
    fetchLiveMiamiData(intent, userMessage),
    fetchDataCatalog(userMessage),
  ])

  const systemPrompt = buildSystemPrompt(language, intent, liveData, catalogData)

  let rawAI
  try {
    rawAI = await callAI(systemPrompt, userMessage, aiKey)
  } catch (err) {
    console.error('AI error:', err)
    const fallback = {
      en: "Hey! I'm Mia 🌴 I'm having a little tech hiccup right now. Try again in a sec!",
      es: "¡Hola! Soy Mia 🌴 Tengo un pequeño problema técnico ahora mismo. ¡Inténtalo de nuevo en un momento!",
      ht: "Alo! Mwen se Mia 🌴 Mwen gen yon ti pwoblèm teknik kounye a. Eseye ankò nan yon moman!"
    }
    return new Response(JSON.stringify({
      response: { content: fallback[language] || fallback.en },
      language,
      sources: [],
      entities: [],
      relations: [],
      quickLinks: [],
    }), { headers: { 'Content-Type': 'application/json' } })
  }

  const parsed = parseAIResponse(rawAI, language)

  return new Response(JSON.stringify({
    response:   { content: parsed.message, role: 'assistant' },
    language:   parsed.language,
    sources:    parsed.sources,
    entities:   parsed.entities,
    relations:  parsed.relations,
    quickLinks: parsed.quickLinks,
    intent,
    dataFetched: !!liveData,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
