/**
 * 新中式五声调式（宫商角徵羽）Web Audio 轻量程序化音效引擎
 * 零外部音频文件依赖、零加载延迟，按连击阶梯递升音高，营造清脆雅致的打击感。
 */
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98]

class GameAudioEngine {
  constructor() {
    this.ctx = null
    this.muted = false
  }

  ensureCtx() {
    if (this.muted || typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      this.ctx = new Ctx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  tone(freq, { type = 'triangle', start = 0, dur = 0.18, gain = 0.14, slideTo = null } = {}) {
    const ctx = this.ensureCtx()
    if (!ctx) return
    const now = ctx.currentTime + start
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur)
    }
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(gain, now + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + dur + 0.02)
  }

  /** 普通农艺动作：古筝清脆拨弦，随连击数逐级攀升五声音阶 */
  playAction(combo = 1) {
    const idx = Math.min(PENTATONIC.length - 1, Math.max(0, (combo - 1) % PENTATONIC.length))
    const base = PENTATONIC[idx]
    this.tone(base, { type: 'triangle', dur: 0.22, gain: 0.14 })
    this.tone(base * 2, { type: 'sine', start: 0.02, dur: 0.14, gain: 0.05 })
  }

  /** 秋收 / 丰收星穗：清亮金穗双音琶音 */
  playHarvest(combo = 1) {
    const idx = Math.min(PENTATONIC.length - 3, Math.max(0, (combo - 1) % 6))
    this.tone(PENTATONIC[idx], { type: 'triangle', start: 0, dur: 0.2, gain: 0.15 })
    this.tone(PENTATONIC[idx + 2], { type: 'sine', start: 0.055, dur: 0.28, gain: 0.12 })
  }

  /** 彩蛋金鲤捕获：悦耳三连清铃 */
  playBonus() {
    ;[783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) => {
      this.tone(f, { type: 'sine', start: i * 0.045, dur: 0.26, gain: 0.11 })
    })
  }

  /** 节气灾害预警：轻柔低沉木鱼/堂鼓提示 */
  playCrisis() {
    this.tone(196, { type: 'sine', dur: 0.16, gain: 0.09, slideTo: 138 })
  }

  /** 选错工具轻提示 */
  playMismatch() {
    this.tone(240, { type: 'triangle', dur: 0.11, gain: 0.08, slideTo: 185 })
  }

  /** 北斗卫星全域大招：恢弘五声极光扫音 */
  playUltimate() {
    const chord = [261.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51]
    chord.forEach((f, i) => {
      this.tone(f, { type: 'triangle', start: i * 0.055, dur: 0.55, gain: 0.11 })
    })
  }

  /** 通关结算鎏金礼乐 */
  playVictory() {
    const seq = [523.25, 659.25, 783.99, 1046.5, 1318.51]
    seq.forEach((f, i) => {
      this.tone(f, { type: 'triangle', start: i * 0.085, dur: 0.42, gain: 0.13 })
    })
  }
}

export const gameAudio = new GameAudioEngine()
