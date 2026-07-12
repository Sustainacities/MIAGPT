import Alpine from 'alpinejs'

window.Alpine = Alpine

// ─── Knowledge Graph (canvas force-directed) ─────────────────────────────────
class MiaGraph {
  constructor(canvas) {
    this.canvas  = canvas
    this.ctx     = canvas.getContext('2d')
    this.nodes   = []
    this.edges   = []
    this.running = false
    this._resize()
    window.addEventListener('resize', () => this._resize())
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width  = rect.width  || 320
    this.canvas.height = rect.height || 200
  }

  addNode(id, label, type) {
    if (this.nodes.find(n => n.id === id)) return
    const colors = {
      place:      '#00f5ff',
      service:    '#ff6b35',
      department: '#9b59b6',
      topic:      '#2ecc71',
      person:     '#f39c12',
      dataset:    '#e74c3c',
    }
    this.nodes.push({
      id, label, type,
      x:     this.canvas.width  * (0.2 + Math.random() * 0.6),
      y:     this.canvas.height * (0.2 + Math.random() * 0.6),
      vx: 0, vy: 0,
      color:  colors[type] || '#00f5ff',
      pulse:  Math.random() * Math.PI * 2,
    })
    if (!this.running) this._start()
  }

  addEdge(source, target, relation) {
    if (!source || !target) return
    if (this.edges.find(e => e.source === source && e.target === target)) return
    this.edges.push({ source, target, relation })
  }

  loadFromResponse(entities = [], relations = []) {
    entities.forEach(e => this.addNode(e.id, e.label, e.type))
    relations.forEach(r => this.addEdge(r.source, r.target, r.relation))
  }

  _simulate() {
    const W = this.canvas.width, H = this.canvas.height
    const N = this.nodes

    // Repulsion
    for (let i = 0; i < N.length; i++) {
      for (let j = i + 1; j < N.length; j++) {
        const a = N[i], b = N[j]
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const f = Math.min(4000 / (dist * dist), 3)
        a.vx -= f * dx / dist; a.vy -= f * dy / dist
        b.vx += f * dx / dist; b.vy += f * dy / dist
      }
    }

    // Spring along edges
    for (const e of this.edges) {
      const a = N.find(n => n.id === e.source)
      const b = N.find(n => n.id === e.target)
      if (!a || !b) continue
      const dx = b.x - a.x, dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const f = (dist - 110) * 0.008
      a.vx += f * dx / dist; a.vy += f * dy / dist
      b.vx -= f * dx / dist; b.vy -= f * dy / dist
    }

    // Center gravity + damping + boundary
    const cx = W / 2, cy = H / 2
    for (const node of N) {
      node.vx += (cx - node.x) * 0.002
      node.vy += (cy - node.y) * 0.002
      node.vx *= 0.88; node.vy *= 0.88
      node.x += node.vx; node.y += node.vy
      node.x = Math.max(30, Math.min(W - 30, node.x))
      node.y = Math.max(20, Math.min(H - 20, node.y))
      node.pulse += 0.04
    }
  }

  _draw() {
    const { ctx } = this
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Edges
    for (const e of this.edges) {
      const a = this.nodes.find(n => n.id === e.source)
      const b = this.nodes.find(n => n.id === e.target)
      if (!a || !b) continue
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
      g.addColorStop(0, a.color + '70')
      g.addColorStop(1, b.color + '70')
      ctx.strokeStyle = g
      ctx.lineWidth = 1
      ctx.stroke()
      // Relation label
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '7px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(e.relation, (a.x + b.x) / 2, (a.y + b.y) / 2 - 3)
    }

    // Nodes
    for (const n of this.nodes) {
      const r = 14 + Math.sin(n.pulse) * 2

      // Outer glow
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5)
      glow.addColorStop(0, n.color + '55')
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Node circle
      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      ctx.fillStyle = n.color + '25'
      ctx.fill()
      ctx.strokeStyle = n.color
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label below node
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 8px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const lbl = n.label.length > 14 ? n.label.slice(0, 14) + '…' : n.label
      ctx.fillText(lbl, n.x, n.y + r + 3)
    }
  }

  _start() {
    this.running = true
    const tick = () => {
      if (this.nodes.length) { this._simulate(); this._draw() }
      requestAnimationFrame(tick)
    }
    tick()
  }
}

// ─── Voice synthesis ──────────────────────────────────────────────────────────
const VOICE_LANG = { en: 'en-US', es: 'es-US', ht: 'fr-HT' }

function speak(text, lang = 'en') {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang  = VOICE_LANG[lang] || 'en-US'
  utt.pitch = 1.1
  utt.rate  = 0.95
  // Pick a female voice if available
  const voices = window.speechSynthesis.getVoices()
  const female = voices.find(v =>
    v.lang.startsWith(VOICE_LANG[lang]?.split('-')[0] || 'en') &&
    (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') ||
     v.name.toLowerCase().includes('monica') || v.name.toLowerCase().includes('karen') ||
     v.name.toLowerCase().includes('zoe'))
  ) || voices.find(v => v.lang.startsWith(utt.lang.split('-')[0]))
  if (female) utt.voice = female
  window.speechSynthesis.speak(utt)
}

// ─── Voice recognition ────────────────────────────────────────────────────────
function startListening(onResult, onEnd) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) { alert('Voice input not supported in this browser.'); return null }
  const rec = new SR()
  rec.continuous     = false
  rec.interimResults = false
  rec.lang           = 'en-US'
  rec.onresult       = e => onResult(e.results[0][0].transcript)
  rec.onend          = onEnd
  rec.start()
  return rec
}

// ─── Alpine app ───────────────────────────────────────────────────────────────
window.addEventListener('alpine:init', () => {

  Alpine.store('mia', {
    chats:      JSON.parse(localStorage.getItem('mia_chats') || '[]'),
    graphNodes: JSON.parse(localStorage.getItem('mia_graph_nodes') || '[]'),
    graphEdges: JSON.parse(localStorage.getItem('mia_graph_edges') || '[]'),
    language:   'en',
    voiceOn:    true,

    push(msg) {
      this.chats.push(msg)
      if (this.chats.length > 80) this.chats = this.chats.slice(-80)
      localStorage.setItem('mia_chats', JSON.stringify(this.chats))
    },

    addGraph(entities, relations) {
      this.graphNodes.push(...(entities || []))
      this.graphEdges.push(...(relations || []))
      // Deduplicate by id / source+target
      const seen = new Set()
      this.graphNodes = this.graphNodes.filter(n => {
        if (seen.has(n.id)) return false; seen.add(n.id); return true
      })
      const eSeen = new Set()
      this.graphEdges = this.graphEdges.filter(e => {
        const k = `${e.source}→${e.target}`
        if (eSeen.has(k)) return false; eSeen.add(k); return true
      })
      localStorage.setItem('mia_graph_nodes', JSON.stringify(this.graphNodes))
      localStorage.setItem('mia_graph_edges', JSON.stringify(this.graphEdges))
    },

    clear() {
      this.chats = []; this.graphNodes = []; this.graphEdges = []
      localStorage.removeItem('mia_chats')
      localStorage.removeItem('mia_graph_nodes')
      localStorage.removeItem('mia_graph_edges')
    }
  })

  Alpine.data('miaChat', () => ({
    currentMessage: '',
    loading: false,
    listening: false,
    showGraph: false,
    recognition: null,
    graph: null,

    get chats()    { return Alpine.store('mia').chats },
    get lang()     { return Alpine.store('mia').language },
    get voiceOn()  { return Alpine.store('mia').voiceOn },

    init() {
      this.$nextTick(() => {
        const canvas = document.getElementById('mia-graph-canvas')
        if (canvas) {
          this.graph = new MiaGraph(canvas)
          // Load accumulated graph
          const s = Alpine.store('mia')
          s.graphNodes.forEach(n => this.graph.addNode(n.id, n.label, n.type))
          s.graphEdges.forEach(e => this.graph.addEdge(e.source, e.target, e.relation))
        }
        this.scrollBottom()
      })
    },

    scrollBottom() {
      this.$nextTick(() => {
        const el = document.getElementById('chat-scroll')
        if (el) el.scrollTop = el.scrollHeight
      })
    },

    toggleVoice() {
      Alpine.store('mia').voiceOn = !Alpine.store('mia').voiceOn
    },

    toggleListen() {
      if (this.listening) {
        this.recognition?.stop()
        this.listening = false
        return
      }
      this.listening = true
      this.recognition = startListening(
        text => { this.currentMessage = text },
        ()   => { this.listening = false }
      )
    },

    async sendMessage() {
      const msg = this.currentMessage.trim()
      if (!msg || this.loading) return

      Alpine.store('mia').push({ from: 'me', message: msg, ts: Date.now() })
      this.currentMessage = ''
      this.loading = true
      this.scrollBottom()

      try {
        const res = await fetch('/api/chat', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ input: { currentMessage: msg } })
        })
        const data = await res.json()

        const miaMsg = {
          from:       'mia',
          message:    data.response?.content || data.response || '🌴',
          sources:    data.sources    || [],
          quickLinks: data.quickLinks || [],
          entities:   data.entities  || [],
          language:   data.language  || 'en',
          ts: Date.now(),
        }

        Alpine.store('mia').push(miaMsg)
        Alpine.store('mia').language = miaMsg.language

        if (miaMsg.entities.length) {
          Alpine.store('mia').addGraph(data.entities, data.relations)
          if (this.graph) {
            this.graph.loadFromResponse(data.entities, data.relations)
          }
        }

        if (Alpine.store('mia').voiceOn) {
          speak(miaMsg.message.replace(/https?:\/\/\S+/g, '').replace(/[*_#]/g, ''), miaMsg.language)
        }
      } catch (err) {
        Alpine.store('mia').push({ from: 'mia', message: '⚡ Connection issue — please try again!', ts: Date.now() })
      } finally {
        this.loading = false
        this.scrollBottom()
      }
    },

    clearHistory() {
      if (confirm('Clear all chat history and knowledge graph?')) {
        Alpine.store('mia').clear()
        if (this.graph) { this.graph.nodes = []; this.graph.edges = [] }
      }
    }
  }))
})

window.addEventListener('DOMContentLoaded', () => Alpine.start())
