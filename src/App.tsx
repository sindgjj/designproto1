import { useEffect, useRef, useState, type CSSProperties } from "react"
import { createClient } from "@supabase/supabase-js"

interface ReadingRow {
  value: number | string
  created_at?: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function normalizeSensorValue(value: number) {
  return clamp(value <= 1 ? value : value / 1023)
}

function BuddhaFigure() {
  return (
    <svg
      className="buddha-art"
      viewBox="0 0 500 560"
      role="img"
      aria-label="황동빛 가부좌 부처 형상"
    >
      <defs>
        <radialGradient id="haloCore">
          <stop offset="0" stopColor="#fff3c9" stopOpacity=".98" />
          <stop offset=".34" stopColor="#ffd58a" stopOpacity=".66" />
          <stop offset="1" stopColor="#d6ac61" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bronze" x1=".16" y1=".08" x2=".84" y2=".9">
          <stop offset="0" stopColor="#f0d28f" />
          <stop offset=".22" stopColor="#b98b48" />
          <stop offset=".51" stopColor="#6f4d2d" />
          <stop offset=".77" stopColor="#c39450" />
          <stop offset="1" stopColor="#49321f" />
        </linearGradient>
        <linearGradient id="bronzeLight" x1=".2" x2=".8" y2="1">
          <stop offset="0" stopColor="#f3dca6" />
          <stop offset=".42" stopColor="#b57d3f" />
          <stop offset="1" stopColor="#604026" />
        </linearGradient>
        <linearGradient id="robe" x1=".12" y1=".2" x2=".9" y2=".84">
          <stop offset="0" stopColor="#d4ad65" />
          <stop offset=".3" stopColor="#7d552e" />
          <stop offset=".62" stopColor="#b77d3c" />
          <stop offset="1" stopColor="#49301f" />
        </linearGradient>
        <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter
          id="sculptureShadow"
          x="-30%"
          y="-20%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="16"
            floodColor="#000"
            floodOpacity=".5"
          />
        </filter>
      </defs>

      <g className="halo">
        <circle
          className="halo-blur"
          cx="250"
          cy="196"
          r="148"
          fill="url(#haloCore)"
          filter="url(#softGlow)"
        />
        <circle
          className="halo-disc"
          cx="250"
          cy="196"
          r="116"
          fill="none"
          stroke="#ffd58a"
          strokeWidth="1.4"
        />
        <circle
          className="halo-ring"
          cx="250"
          cy="196"
          r="136"
          fill="none"
          stroke="#d6ac61"
          strokeWidth=".8"
        />
      </g>

      <g className="sculpture" filter="url(#sculptureShadow)">
        <ellipse
          cx="250"
          cy="496"
          rx="184"
          ry="37"
          fill="#322216"
          opacity=".84"
        />

        <path
          d="M197 313c-33 14-59 45-66 87-3 18 4 31 24 34l95 11 95-11c20-3 27-16 24-34-7-42-33-73-66-87Z"
          fill="url(#robe)"
        />
        <path
          d="M155 405c-45 9-77 32-94 66-7 15 0 30 17 34 59 13 117 10 172-13-34-45-63-73-95-87Z"
          fill="url(#bronze)"
        />
        <path
          d="M345 405c45 9 77 32 94 66 7 15 0 30-17 34-59 13-117 10-172-13 34-45 63-73 95-87Z"
          fill="url(#bronzeLight)"
        />
        <path
          d="M78 486c54 9 111 7 172-8 61 15 118 17 172 8-5 23-68 40-172 40S83 509 78 486Z"
          fill="#8a5d32"
        />
        <path
          d="M91 487c55 6 107 1 159-14 52 15 104 20 159 14"
          fill="none"
          stroke="#e2bd72"
          strokeOpacity=".45"
          strokeWidth="2"
        />

        <path
          d="M184 300c-20 13-34 38-38 71-3 30 8 48 31 55 15 4 40-6 73-30 33 24 58 34 73 30 23-7 34-25 31-55-4-33-18-58-38-71Z"
          fill="url(#bronzeLight)"
        />
        <path
          d="M250 294c-29 6-53 22-65 45 17 15 39 22 65 22s48-7 65-22c-12-23-36-39-65-45Z"
          fill="#6c492a"
        />
        <path
          d="M250 306c-7 22-10 49-8 80"
          fill="none"
          stroke="#e6c77f"
          strokeOpacity=".42"
          strokeWidth="3"
        />
        <path
          d="M184 317c15 37 22 72 20 105M316 317c-15 37-22 72-20 105"
          fill="none"
          stroke="#f0d28f"
          strokeOpacity=".22"
          strokeWidth="2"
        />

        <path
          d="M172 342c-17 12-25 35-21 68 2 16 12 24 29 22 22-2 45-13 70-31l-20-22-47 25c3-25 7-45 11-60Z"
          fill="url(#bronze)"
        />
        <path
          d="M328 342c17 12 25 35 21 68-2 16-12 24-29 22-22-2-45-13-70-31l20-22 47 25c-3-25-7-45-11-60Z"
          fill="url(#bronzeLight)"
        />
        <path
          d="M213 391c11-7 25-6 37 10-16 15-35 21-52 17 0-11 5-20 15-27Z"
          fill="#c39450"
        />
        <path
          d="M287 391c-11-7-25-6-37 10 16 15 35 21 52 17 0-11-5-20-15-27Z"
          fill="#8a5b31"
        />

        <path d="M221 279h58l10 42c-24 12-52 12-78 0Z" fill="url(#bronze)" />
        <ellipse cx="204" cy="234" rx="15" ry="28" fill="#85592f" />
        <ellipse cx="296" cy="234" rx="15" ry="28" fill="#85592f" />
        <path
          d="M250 151c-39 0-60 29-55 73 5 50 25 79 55 79s50-29 55-79c5-44-16-73-55-73Z"
          fill="url(#bronzeLight)"
        />
        <path
          d="M215 222c10-6 20-6 30 0M255 222c10-6 20-6 30 0"
          fill="none"
          stroke="#4a301d"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M220 230c8 5 16 5 23 0M257 230c7 5 15 5 23 0"
          fill="none"
          stroke="#49301f"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M250 224c-4 18-5 29 1 33 4 2 8 1 12-2"
          fill="none"
          stroke="#684427"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M235 271c10 6 20 6 30 0"
          fill="none"
          stroke="#4d321e"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M205 207c10-31 26-47 45-48 20 1 36 17 46 48-5-42-19-64-46-64s-41 22-45 64Z"
          fill="#76502d"
        />

        <ellipse cx="250" cy="139" rx="28" ry="25" fill="url(#bronze)" />
        <path d="M232 135c4-22 13-34 18-39 6 6 15 18 18 39" fill="#9f6d38" />
        <circle cx="250" cy="100" r="7" fill="#c69652" />
        <path
          d="M226 126c15 6 33 6 48 0M219 145c20 8 42 8 62 0"
          fill="none"
          stroke="#e2bd72"
          strokeOpacity=".34"
          strokeWidth="2"
        />
      </g>
    </svg>
  )
}

function ConnectionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 12a4 4 0 0 1 4-4h3m1-3 3 3-3 3M16 12a4 4 0 0 1-4 4H9m-1 3-3-3 3-3" />
    </svg>
  )
}

export default function App() {
  const [latestValue, setLatestValue] = useState<number | null>(null)
  const [manualLevel, setManualLevel] = useState(0.38)
  const [inputMode, setInputMode] = useState<"manual" | "sensor">("manual")
  const [databaseState, setDatabaseState] =
    useState<"connecting" | "connected" | "offline">("connecting")
  const [serialState, setSerialState] =
    useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [serialError, setSerialError] = useState("")
  const portRef = useRef<SerialPortLike | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  useEffect(() => {
    if (!supabase) {
      setDatabaseState("offline")
      return
    }

    let active = true
    const loadLatest = async () => {
      const { data, error } = await supabase
        .from("readings")
        .select("value, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!active) return
      if (error) {
        setDatabaseState("offline")
        return
      }
      const value = Number((data as ReadingRow | null)?.value)
      if (Number.isFinite(value)) {
        setLatestValue(value)
        setInputMode("sensor")
      }
      setDatabaseState("connected")
    }

    void loadLatest()
    const channel = supabase
      .channel("meditation-readings-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "readings" },
        (payload) => {
          const value = Number((payload.new as ReadingRow).value)
          if (!Number.isFinite(value)) return
          setLatestValue(value)
          setInputMode("sensor")
          setDatabaseState("connected")
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setDatabaseState("connected")
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          setDatabaseState("offline")
      })

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [])

  const connectSerial = async () => {
    const serial = (navigator as SerialNavigator).serial
    if (!serial) {
      setSerialError(
        "Web Serial을 지원하는 Chrome 또는 Edge에서 연결해 주세요.",
      )
      return
    }

    try {
      setSerialError("")
      setSerialState("connecting")
      const port = await serial.requestPort()
      await port.open({ baudRate: 9600 })
      portRef.current = port
      setSerialState("connected")
      setInputMode("sensor")

      if (!port.readable) throw new Error("센서 입력 스트림을 열 수 없습니다.")
      const reader = port.readable.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          const match = line.trim().match(/-?\d+(?:\.\d+)?$/)
          if (!match) continue
          const reading = Number(match[0])
          if (Number.isFinite(reading)) setLatestValue(reading)
        }
      }
    } catch (error) {
      if ((error as DOMException).name !== "NotFoundError") {
        setSerialError(
          error instanceof Error
            ? error.message
            : "센서 연결 중 오류가 발생했습니다.",
        )
      }
      setSerialState("disconnected")
    }
  }

  const disconnectSerial = async () => {
    await readerRef.current?.cancel().catch(() => undefined)
    readerRef.current = null
    await portRef.current?.close().catch(() => undefined)
    portRef.current = null
    setSerialState("disconnected")
    setInputMode("manual")
  }

  useEffect(
    () => () => {
      void readerRef.current?.cancel()
      void portRef.current?.close()
    },
    [],
  )

  const sensorAvailable = latestValue !== null
  const sensorLevel = sensorAvailable ? normalizeSensorValue(latestValue) : 0
  const level =
    inputMode === "sensor" && sensorAvailable ? sensorLevel : manualLevel
  const height = level * 2
  const stateLabel =
    level === 0
      ? "고요"
      : level < 0.34
        ? "호흡"
        : level < 0.72
          ? "상승"
          : "초월"
  const experienceStyle = { "--level": level } as CSSProperties

  return (
    <main className="meditation-page" style={experienceStyle}>
      <div className="ambient-light" aria-hidden="true" />
      <header className="meditation-header">
        <a className="brand" href="#" aria-label="명상 시간 홈">
          <span className="brand-mark" />
          <span>명상 시간</span>
        </a>
        <div className="connection-area">
          <span
            className={`connection-status ${
              serialState === "connected" || databaseState === "connected"
                ? "online"
                : ""
            }`}
          >
            <i />
            {serialState === "connected"
              ? "센서 연결됨"
              : databaseState === "connected"
                ? "데이터 수신 중"
                : "체험 모드"}
          </span>
          <button
            className="connect-button"
            type="button"
            onClick={
              serialState === "connected" ? disconnectSerial : connectSerial
            }
            disabled={serialState === "connecting"}
          >
            <ConnectionIcon />
            {serialState === "connecting"
              ? "연결 중"
              : serialState === "connected"
                ? "연결 해제"
                : "센서 연결"}
          </button>
        </div>
      </header>

      <section className="experience" aria-label="인터랙티브 명상 경험">
        <div className="intro-copy">
          <p className="eyebrow">INTERACTIVE MEDITATION · 01</p>
          <h1>
            고요함이
            <br />
            빛이 되는 순간
          </h1>
          <p className="intro-description">
            호흡과 감각에 집중해 보세요.
            <br />
            당신의 입력이 상승과 빛으로 변환됩니다.
          </p>
        </div>

        <div className="visual-stage">
          <div className="vertical-guide" aria-hidden="true">
            <span>2m</span>
            <i />
            <span>0m</span>
          </div>
          <div className="figure-float">
            <BuddhaFigure />
          </div>
          <div className="ground-shadow" aria-hidden="true" />
          <div className="ground-line" aria-hidden="true" />
        </div>

        <aside className="state-panel" aria-label="현재 명상 상태">
          <p>현재 상태</p>
          <strong>{stateLabel}</strong>
          <div className="state-rule" />
          <dl>
            <div>
              <dt>부양 높이</dt>
              <dd>
                {height.toFixed(2)}
                <small> m</small>
              </dd>
            </div>
            <div>
              <dt>후광 강도</dt>
              <dd>
                {Math.round(level * 100)}
                <small> %</small>
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="control-dock" aria-label="센서 입력 제어">
        <div className="mode-switch" role="group" aria-label="입력 방식">
          <button
            className={inputMode === "manual" ? "active" : ""}
            type="button"
            onClick={() => setInputMode("manual")}
          >
            체험 입력
          </button>
          <button
            className={inputMode === "sensor" ? "active" : ""}
            type="button"
            disabled={!sensorAvailable}
            onClick={() => setInputMode("sensor")}
          >
            센서 입력
          </button>
        </div>
        <div className="level-control">
          <div className="level-meta">
            <label htmlFor="meditation-level">LEVEL</label>
            <output htmlFor="meditation-level">{level.toFixed(2)}</output>
          </div>
          <input
            id="meditation-level"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={level}
            disabled={inputMode === "sensor"}
            onChange={(event) => setManualLevel(Number(event.target.value))}
            aria-label="명상 단계"
          />
          <div className="range-labels">
            <span>고요</span>
            <span>초월</span>
          </div>
        </div>
        <p className="control-note">
          {inputMode === "sensor"
            ? "센서의 움직임을 실시간으로 반영합니다."
            : "슬라이더를 움직여 변화의 흐름을 경험하세요."}
        </p>
      </section>

      {serialError && (
        <div className="toast" role="alert">
          {serialError}
        </div>
      )}
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
