import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface SensorReading {
  time: string
  value: number
}

interface ReadingRow {
  id?: number
  value: number | string
  created_at?: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

function SensorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.3 2.8c.4 3-1.4 4.2-2.3 5.8-.8 1.5-.4 2.7.5 3.5-.1-2.1 1.3-3.3 2.7-4.3 2 2.2 3.3 4.5 3.3 7.2a5.5 5.5 0 0 1-11 0c0-3.2 1.9-6 6.8-12.2Z" />
      <path d="M13.3 14c.7 1 1.2 1.8 1.2 2.9a2.5 2.5 0 0 1-5 0c0-1.3.7-2.5 2.3-4.1 0 1.4.6 2 1.5 2.6" />
    </svg>
  )
}

function LineChart({ data }: { data: SensorReading[] }) {
  const width = 920
  const height = 300
  const padding = { left: 52, right: 20, top: 24, bottom: 42 }
  const values = data.map((item) => item.value)
  const minValue = values.length ? Math.min(...values) : 0
  const maxValue = values.length ? Math.max(...values) : 1
  const paddingValue = Math.max(10, (maxValue - minValue) * 0.15)
  const min = Math.floor((minValue - paddingValue) / 10) * 10
  const max = Math.ceil((maxValue + paddingValue) / 10) * 10 || 10
  const x = (index: number) => padding.left + index * ((width - padding.left - padding.right) / Math.max(data.length - 1, 1))
  const y = (value: number) => padding.top + (max - value) * ((height - padding.top - padding.bottom) / Math.max(max - min, 1))
  const points = data.map((item, index) => `${x(index)},${y(item.value)}`).join(' ')
  const area = data.length ? `${padding.left},${height - padding.bottom} ${points} ${x(data.length - 1)},${height - padding.bottom}` : ''
  const tickCount = 4
  const ticks = Array.from({ length: tickCount }, (_, index) => Math.round(min + (max - min) * index / (tickCount - 1)))

  return (
    <div className="chart-wrap">
      <svg className="sensor-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="최근 100개 불꽃센서 값 변화 선 그래프">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c45e42" stopOpacity=".22" />
            <stop offset="100%" stopColor="#c45e42" stopOpacity=".01" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} y1={y(tick)} x2={width - padding.right} y2={y(tick)} className="grid-line" />
            <text x={padding.left - 13} y={y(tick) + 4} textAnchor="end" className="axis-label">{tick}</text>
          </g>
        ))}
        {data.length > 0 && <polygon points={area} fill="url(#areaFill)" />}
        {data.length > 0 && <polyline points={points} className="data-line" />}
        {data.map((item, index) => (index === data.length - 1 || index === 0 || index % 20 === 0) && (
          <text key={`${item.time}-${index}`} x={x(index)} y={height - 15} textAnchor="middle" className="axis-label">{item.time}</text>
        ))}
        {data.length === 0 && <text x={width / 2} y={height / 2} textAnchor="middle" className="empty-chart-label">Supabase 데이터를 기다리는 중</text>}
      </svg>
    </div>
  )
}

function formatTime(createdAt?: string) {
  if (!createdAt) return '--:--:--'
  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? '--:--:--' : date.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

function toSensorReading(row: ReadingRow): SensorReading | null {
  const value = Number(row.value)
  return Number.isFinite(value) ? { time: formatTime(row.created_at), value } : null
}

export default function App() {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [databaseError, setDatabaseError] = useState('')
  const [serialState, setSerialState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [serialError, setSerialError] = useState('')
  const portRef = useRef<SerialPortLike | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  const current = readings.at(-1)?.value ?? null
  const average = useMemo(() => readings.length ? Math.round(readings.reduce((sum, item) => sum + item.value, 0) / readings.length) : null, [readings])
  const peak = readings.length ? Math.max(...readings.map((item) => item.value)) : null

  useEffect(() => {
    if (!supabase) {
      setDatabaseError('.env에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정하세요.')
      setConnectionState('error')
      return
    }

    let active = true

    const loadRecentReadings = async () => {
      const { data, error } = await supabase
        .from('readings')
        .select('value, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!active) return
      if (error) {
        setDatabaseError(error.message)
        setConnectionState('error')
        return
      }

      const recent = (data as ReadingRow[] | null ?? [])
        .map(toSensorReading)
        .filter((reading): reading is SensorReading => reading !== null)
        .reverse()
      setReadings(recent)
      setConnectionState('connected')
    }

    void loadRecentReadings()

    const channel = supabase
      .channel('readings-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'readings' }, (payload) => {
        const reading = toSensorReading(payload.new as ReadingRow)
        if (!reading) return
        setReadings((previous) => [...previous, reading].slice(-100))
        setConnectionState('connected')
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnectionState('connected')
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setConnectionState('error')
      })

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [])

  const connectSerial = async () => {
    const serial = (navigator as SerialNavigator).serial
    if (!serial) {
      setSerialError('이 브라우저는 Web Serial API를 지원하지 않습니다. Chrome 또는 Edge를 사용하세요.')
      return
    }

    try {
      setSerialError('')
      setSerialState('connecting')
      const port = await serial.requestPort()
      await port.open({ baudRate: 9600 })
      portRef.current = port
      setSerialState('connected')

      if (!port.readable) throw new Error('시리얼 입력 스트림을 열 수 없습니다.')
      const reader = port.readable.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const match = line.trim().match(/-?\d+(?:\.\d+)?$/)
          if (!match) continue
          const reading = Number(match[0])
          if (!Number.isFinite(reading)) continue
          const now = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
          })
          setReadings((previous) => [...previous, { time: now, value: reading }].slice(-100))
        }
      }
    } catch (error) {
      if ((error as DOMException).name !== 'NotFoundError') {
        setSerialError(error instanceof Error ? error.message : '시리얼 연결 중 오류가 발생했습니다.')
      }
      setSerialState('disconnected')
    }
  }

  const disconnectSerial = async () => {
    await readerRef.current?.cancel().catch(() => undefined)
    readerRef.current = null
    await portRef.current?.close().catch(() => undefined)
    portRef.current = null
    setSerialState('disconnected')
  }

  useEffect(() => () => {
    void readerRef.current?.cancel()
    void portRef.current?.close()
  }, [])

  return (
    <main className="sensor-page">
      <header className="sensor-header">
        <div className="sensor-brand">
          <span className="sensor-logo"><SensorIcon /></span>
          <span>시설 안전 모니터링</span>
        </div>
        <span className={`live-badge ${connectionState}`}><i /> {connectionState === 'connected' ? 'LIVE' : connectionState === 'connecting' ? 'CONNECTING' : 'ERROR'}</span>
        <div className="header-actions">
          <span className={`live-badge ${connectionState}`}><i /> {connectionState === 'connected' ? 'DB LIVE' : connectionState === 'connecting' ? 'CONNECTING' : 'DB ERROR'}</span>
          <button
            className={`serial-button ${serialState === 'connected' ? 'connected' : ''}`}
            onClick={serialState === 'connected' ? disconnectSerial : connectSerial}
            disabled={serialState === 'connecting'}
            type="button"
          >
            <i />
            {serialState === 'connecting' ? '연결 중...' : serialState === 'connected' ? '포트 연결 해제' : '포트 연결'}
          </button>
        </div>
      </header>

      <div className="sensor-shell">
        <section className="sensor-intro">
          <div>
            <p className="sensor-eyebrow">SUPABASE REALTIME · READINGS</p>
            <h1>불꽃센서 대시보드</h1>
            <p>최근 센서값을 실시간으로 확인하세요.</p>
          </div>
          <p className="updated">Supabase 데이터 <b>{readings.length} / 100</b></p>
        </section>

        {databaseError && <div className="serial-error" role="alert">{databaseError}</div>}

        {serialError && <div className="serial-error" role="alert">{serialError}</div>}

        <section className="sensor-grid">
          <article className="current-card">
            <div className="card-top">
              <span>현재 센서값</span>
              <span className="live-badge"><i /> {connectionState === 'connected' ? 'LIVE' : 'WAITING'}</span>
            </div>
            <div className="current-value"><strong>{current ?? '—'}</strong><span>ADC</span></div>
            <div className="normal-state">
              <span className="state-icon"><SensorIcon /></span>
              <span><b>{connectionState === 'connected' ? 'Supabase 연결됨' : '데이터 연결 대기'}</b><small>Realtime · readings</small></span>
            </div>
          </article>

          <div className="metric-column">
            <article className="metric-card">
              <span>최근 100개 평균</span>
              <strong>{average ?? '—'}<small> ADC</small></strong>
              <em>Supabase 데이터</em>
            </article>
            <article className="metric-card">
              <span>최근 최고 센서값</span>
              <strong>{peak ?? '—'}<small> ADC</small></strong>
              <em>최근 100개 기준</em>
            </article>
          </div>

          <article className="device-card">
            <div className="device-head"><span>데이터 소스</span><i /></div>
            <dl>
              <div><dt>테이블</dt><dd>readings</dd></div>
              <div><dt>조회 개수</dt><dd>최근 100개</dd></div>
              <div><dt>Realtime</dt><dd className={connectionState === 'connected' ? 'connected' : ''}>{connectionState === 'connected' ? '온라인' : '연결 대기'}</dd></div>
              <div><dt>데이터 저장</dt><dd>Supabase</dd></div>
            </dl>
          </article>
        </section>

        <section className="trend-panel">
          <div className="trend-head">
            <div>
              <p className="sensor-eyebrow">SENSOR TREND</p>
              <h2>최근 센서 변화</h2>
            </div>
          </div>
          <div className="chart-meta">
            <span><i className="series-dot" /> 센서값 (ADC)</span>
            <span>Supabase · 최근 100개</span>
          </div>
          <LineChart data={readings} />
        </section>

        <footer className="sensor-footer">
          <p>Supabase readings 테이블을 조회합니다.</p>
          <p>새 행이 추가되면 자동으로 갱신됩니다.</p>
        </footer>
      </div>
    </main>
  )
}

interface SerialPortLike {
  readable: ReadableStream<Uint8Array> | null
  open: (options: { baudRate: number }) => Promise<void>
  close: () => Promise<void>
}

interface SerialNavigator extends Navigator {
  serial?: {
    requestPort: () => Promise<SerialPortLike>
  }
}
