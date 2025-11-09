import { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Instrument states
  const [bassActive, setBassActive] = useState(true)
  const [bassFreq, setBassFreq] = useState(55)
  const [bassVolume, setBassVolume] = useState(-10)

  const [leadActive, setLeadActive] = useState(true)
  const [leadType, setLeadType] = useState('sawtooth')
  const [leadVolume, setLeadVolume] = useState(-15)

  const [padActive, setPadActive] = useState(true)
  const [padVolume, setPadVolume] = useState(-20)

  const [arpActive, setArpActive] = useState(true)
  const [arpSpeed, setArpSpeed] = useState(8)
  const [arpVolume, setArpVolume] = useState(-18)

  const [kickActive, setKickActive] = useState(true)
  const [kickVolume, setKickVolume] = useState(-8)

  const [hihatActive, setHihatActive] = useState(true)
  const [hihatVolume, setHihatVolume] = useState(-12)

  // Effects states
  const [reverbActive, setReverbActive] = useState(true)
  const [reverbDecay, setReverbDecay] = useState(3)

  const [delayActive, setDelayActive] = useState(true)
  const [delayTime, setDelayTime] = useState(0.25)

  const [filterActive, setFilterActive] = useState(true)
  const [filterFreq, setFilterFreq] = useState(5000)

  // BPM
  const [bpm, setBpm] = useState(138)

  // Refs for Tone.js objects
  const synthsRef = useRef<any>({})
  const effectsRef = useRef<any>({})
  const partsRef = useRef<any>({})

  // Visualizer
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(32).fill(0))

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setVisualizerData(prev => prev.map(() => Math.random() * 100))
      } else {
        setVisualizerData(Array(32).fill(0))
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying])

  const initializeAudio = async () => {
    if (isInitialized) return

    await Tone.start()
    Tone.Transport.bpm.value = bpm

    // Create effects
    const reverb = new Tone.Reverb({ decay: reverbDecay, wet: 0.3 }).toDestination()
    const delay = new Tone.FeedbackDelay({ delayTime: delayTime, feedback: 0.4, wet: 0.2 }).connect(reverb)
    const filter = new Tone.Filter({ frequency: filterFreq, type: 'lowpass' }).connect(delay)

    effectsRef.current = { reverb, delay, filter }

    // Create instruments
    const bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 },
      volume: bassVolume
    }).connect(filter)

    const lead = new Tone.Synth({
      oscillator: { type: leadType as any },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
      volume: leadVolume
    }).connect(filter)

    const pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.8, decay: 0.2, sustain: 0.7, release: 2 },
      volume: padVolume
    }).connect(filter)

    const arp = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
      volume: arpVolume
    }).connect(filter)

    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 },
      volume: kickVolume
    }).connect(filter)

    const hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
      volume: hihatVolume
    }).connect(filter)

    synthsRef.current = { bass, lead, pad, arp, kick, hihat }

    // Create patterns
    // Bass pattern (trance bassline)
    const bassPart = new Tone.Sequence((time, note) => {
      if (bassActive && note) {
        bass.triggerAttackRelease(note, '8n', time)
      }
    }, [
      'A1', 'A1', null, 'A1',
      null, 'A1', 'A1', null,
      'G1', 'G1', null, 'G1',
      null, 'G1', 'G1', null
    ], '16n')

    // Lead pattern (trance lead melody)
    const leadPart = new Tone.Sequence((time, note) => {
      if (leadActive && note) {
        lead.triggerAttackRelease(note, '4n', time)
      }
    }, [
      'E4', null, 'D4', null,
      'C4', null, 'D4', null,
      'E4', null, 'G4', null,
      'A4', null, 'G4', null
    ], '8n')

    // Pad pattern (trance chord progression)
    const padPart = new Tone.Sequence((time, chord) => {
      if (padActive && chord) {
        pad.triggerAttackRelease(chord, '2n', time)
      }
    }, [
      ['A2', 'C3', 'E3'],
      null,
      ['G2', 'B2', 'D3'],
      null,
      ['F2', 'A2', 'C3'],
      null,
      ['G2', 'B2', 'D3'],
      null
    ], '2n')

    // Arp pattern
    const arpPart = new Tone.Sequence((time, note) => {
      if (arpActive && note) {
        arp.triggerAttackRelease(note, '16n', time)
      }
    }, [
      'A3', 'C4', 'E4', 'A4',
      'A3', 'C4', 'E4', 'A4',
      'G3', 'B3', 'D4', 'G4',
      'G3', 'B3', 'D4', 'G4'
    ], '16n')

    // Kick pattern (four on the floor)
    const kickPart = new Tone.Sequence((time) => {
      if (kickActive) {
        kick.triggerAttackRelease('C1', '8n', time)
      }
    }, [0, 1, 2, 3], '4n')

    // Hihat pattern
    const hihatPart = new Tone.Sequence((time, velocity) => {
      if (hihatActive && velocity) {
        hihat.triggerAttackRelease('16n', time, velocity)
      }
    }, [0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6], '8n')

    partsRef.current = { bassPart, leadPart, padPart, arpPart, kickPart, hihatPart }

    setIsInitialized(true)
  }

  const handlePlay = async () => {
    await initializeAudio()

    if (!isPlaying) {
      Object.values(partsRef.current).forEach((part: any) => part.start(0))
      Tone.Transport.start()
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    if (isPlaying) {
      Tone.Transport.stop()
      Object.values(partsRef.current).forEach((part: any) => part.stop())
      setIsPlaying(false)
    }
  }

  const handleClear = () => {
    handleStop()
    setBassActive(false)
    setLeadActive(false)
    setPadActive(false)
    setArpActive(false)
    setKickActive(false)
    setHihatActive(false)
  }

  // Update effects
  useEffect(() => {
    if (effectsRef.current.reverb) {
      effectsRef.current.reverb.decay = reverbDecay
      effectsRef.current.reverb.wet.value = reverbActive ? 0.3 : 0
    }
  }, [reverbDecay, reverbActive])

  useEffect(() => {
    if (effectsRef.current.delay) {
      effectsRef.current.delay.delayTime.value = delayTime
      effectsRef.current.delay.wet.value = delayActive ? 0.2 : 0
    }
  }, [delayTime, delayActive])

  useEffect(() => {
    if (effectsRef.current.filter) {
      effectsRef.current.filter.frequency.value = filterFreq
    }
  }, [filterFreq, filterActive])

  // Update instrument volumes
  useEffect(() => {
    if (synthsRef.current.bass) {
      synthsRef.current.bass.volume.value = bassVolume
    }
  }, [bassVolume])

  useEffect(() => {
    if (synthsRef.current.lead) {
      synthsRef.current.lead.volume.value = leadVolume
      synthsRef.current.lead.oscillator.type = leadType
    }
  }, [leadVolume, leadType])

  useEffect(() => {
    if (synthsRef.current.pad) {
      synthsRef.current.pad.volume.value = padVolume
    }
  }, [padVolume])

  useEffect(() => {
    if (synthsRef.current.arp) {
      synthsRef.current.arp.volume.value = arpVolume
    }
  }, [arpVolume])

  useEffect(() => {
    if (synthsRef.current.kick) {
      synthsRef.current.kick.volume.value = kickVolume
    }
  }, [kickVolume])

  useEffect(() => {
    if (synthsRef.current.hihat) {
      synthsRef.current.hihat.volume.value = hihatVolume
    }
  }, [hihatVolume])

  useEffect(() => {
    if (isInitialized) {
      Tone.Transport.bpm.value = bpm
    }
  }, [bpm, isInitialized])

  return (
    <div className="container">
      <div className="header">
        <h1>🎵 سازنده موزیک ترنس</h1>
        <p>موزیک ترنس خود را با ابزارهای مختلف بسازید</p>
      </div>

      <div className="controls">
        <button className="btn btn-play" onClick={handlePlay}>
          {isPlaying ? '⏸ متوقف کردن موقت' : '▶ پخش'}
        </button>
        <button className="btn btn-stop" onClick={handleStop}>
          ⏹ توقف
        </button>
        <button className="btn btn-clear" onClick={handleClear}>
          🗑 پاک کردن همه
        </button>
      </div>

      <div className="instruments">
        <div className="instrument">
          <h3>⚡ BPM</h3>
          <div className="instrument-controls">
            <div className="control-group">
              <label>سرعت: {bpm}</label>
              <input
                type="range"
                className="slider"
                min="120"
                max="150"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="instrument">
          <h3>🎸 بیس</h3>
          <div className="instrument-controls">
            <button
              className={`toggle-btn ${bassActive ? 'active' : 'inactive'}`}
              onClick={() => setBassActive(!bassActive)}
            >
              {bassActive ? 'فعال' : 'غیرفعال'}
            </button>
            <div className="control-group">
              <label>صدا: {bassVolume} dB</label>
              <input
                type="range"
                className="slider"
                min="-30"
                max="0"
                value={bassVolume}
                onChange={(e) => setBassVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="instrument">
          <h3>🎹 سینتی سایزر اصلی</h3>
          <div className="instrument-controls">
            <button
              className={`toggle-btn ${leadActive ? 'active' : 'inactive'}`}
              onClick={() => setLeadActive(!leadActive)}
            >
              {leadActive ? 'فعال' : 'غیرفعال'}
            </button>
            <div className="control-group">
              <label>نوع موج</label>
              <select
                className="select"
                value={leadType}
                onChange={(e) => setLeadType(e.target.value)}
              >
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
                <option value="triangle">Triangle</option>
                <option value="sine">Sine</option>
              </select>
            </div>
            <div className="control-group">
              <label>صدا: {leadVolume} dB</label>
              <input
                type="range"
                className="slider"
                min="-30"
                max="0"
                value={leadVolume}
                onChange={(e) => setLeadVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="instrument">
          <h3>🌊 پد</h3>
          <div className="instrument-controls">
            <button
              className={`toggle-btn ${padActive ? 'active' : 'inactive'}`}
              onClick={() => setPadActive(!padActive)}
            >
              {padActive ? 'فعال' : 'غیرفعال'}
            </button>
            <div className="control-group">
              <label>صدا: {padVolume} dB</label>
              <input
                type="range"
                className="slider"
                min="-40"
                max="0"
                value={padVolume}
                onChange={(e) => setPadVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="instrument">
          <h3>🎼 آرپجیاتور</h3>
          <div className="instrument-controls">
            <button
              className={`toggle-btn ${arpActive ? 'active' : 'inactive'}`}
              onClick={() => setArpActive(!arpActive)}
            >
              {arpActive ? 'فعال' : 'غیرفعال'}
            </button>
            <div className="control-group">
              <label>صدا: {arpVolume} dB</label>
              <input
                type="range"
                className="slider"
                min="-40"
                max="0"
                value={arpVolume}
                onChange={(e) => setArpVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="instrument">
          <h3>🥁 کیک</h3>
          <div className="instrument-controls">
            <button
              className={`toggle-btn ${kickActive ? 'active' : 'inactive'}`}
              onClick={() => setKickActive(!kickActive)}
            >
              {kickActive ? 'فعال' : 'غیرفعال'}
            </button>
            <div className="control-group">
              <label>صدا: {kickVolume} dB</label>
              <input
                type="range"
                className="slider"
                min="-30"
                max="0"
                value={kickVolume}
                onChange={(e) => setKickVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="instrument">
          <h3>🎩 های‌هت</h3>
          <div className="instrument-controls">
            <button
              className={`toggle-btn ${hihatActive ? 'active' : 'inactive'}`}
              onClick={() => setHihatActive(!hihatActive)}
            >
              {hihatActive ? 'فعال' : 'غیرفعال'}
            </button>
            <div className="control-group">
              <label>صدا: {hihatVolume} dB</label>
              <input
                type="range"
                className="slider"
                min="-30"
                max="0"
                value={hihatVolume}
                onChange={(e) => setHihatVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="effects">
        <h2>🎚 افکت‌ها</h2>
        <div className="effects-grid">
          <div className="control-group">
            <button
              className={`toggle-btn ${reverbActive ? 'active' : 'inactive'}`}
              onClick={() => setReverbActive(!reverbActive)}
            >
              ریورب {reverbActive ? 'فعال' : 'غیرفعال'}
            </button>
            <label>زمان: {reverbDecay}s</label>
            <input
              type="range"
              className="slider"
              min="0.5"
              max="10"
              step="0.5"
              value={reverbDecay}
              onChange={(e) => setReverbDecay(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <button
              className={`toggle-btn ${delayActive ? 'active' : 'inactive'}`}
              onClick={() => setDelayActive(!delayActive)}
            >
              دیلی {delayActive ? 'فعال' : 'غیرفعال'}
            </button>
            <label>زمان: {delayTime}s</label>
            <input
              type="range"
              className="slider"
              min="0.1"
              max="1"
              step="0.05"
              value={delayTime}
              onChange={(e) => setDelayTime(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <button
              className={`toggle-btn ${filterActive ? 'active' : 'inactive'}`}
              onClick={() => setFilterActive(!filterActive)}
            >
              فیلتر {filterActive ? 'فعال' : 'غیرفعال'}
            </button>
            <label>فرکانس: {filterFreq} Hz</label>
            <input
              type="range"
              className="slider"
              min="200"
              max="10000"
              step="100"
              value={filterFreq}
              onChange={(e) => setFilterFreq(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="visualizer">
        <div className="visualizer-bars">
          {visualizerData.map((height, i) => (
            <div
              key={i}
              className="bar"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
