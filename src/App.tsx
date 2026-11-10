import { useEffect, useRef, useState, type CSSProperties } from "react"
import { createClient } from "@supabase/supabase-js"

interface ReadingRow {
  value: number | string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const normalizeSensorValue = (value: number) =>
  clamp(value <= 1 ? value : value / 1023)

function BuddhaSilhouette() {
  return (
    <svg
      className="buddha-art"
      viewBox="0 0 420 500"
      role="img"
      aria-label="명상하는 부처 실루엣"
    >
      <defs>
        <radialGradient id="aura">
          <stop offset="0" stopColor="#fff1c7" stopOpacity=".82" />
          <stop offset=".38" stopColor="#e0b96c" stopOpacity=".28" />
          <stop offset="1" stopColor="#d6ac61" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stone" x1=".08" y1=".12" x2=".92" y2=".9">
          <stop offset="0" stopColor="#8d7652" />
          <stop offset=".24" stopColor="#3c352b" />
          <stop offset=".58" stopColor="#171714" />
          <stop offset=".82" stopColor="#4b3e2d" />
          <stop offset="1" stopColor="#191816" />
        </linearGradient>
        <linearGradient id="robeLight" x1="0" y1="0" x2="1" y2=".8">
          <stop offset="0" stopColor="#d7b874" stopOpacity=".72" />
          <stop offset=".32" stopColor="#8e754d" stopOpacity=".3" />
          <stop offset="1" stopColor="#151513" stopOpacity="0" />
        </linearGradient>
        <filter id="auraBlur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
        <filter id="objectShadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="20"
            stdDeviation="18"
            floodColor="#000"
            floodOpacity=".72"
          />
        </filter>
      </defs>

      <g className="aura">
        <circle
          cx="210"
          cy="148"
          r="144"
          fill="url(#aura)"
          filter="url(#auraBlur)"
        />
        <circle className="aura-line outer" cx="210" cy="148" r="116" />
        <circle className="aura-line inner" cx="210" cy="148" r="91" />
      </g>

      <g className="statue" filter="url(#objectShadow)">
        <path
          className="statue-form"
          d="M210 42c-7 0-11 9-11 19-15 5-24 18-24 34v8c-17 12-27 34-25 59 3 39 26 70 60 70s57-31 60-70c2-25-8-47-25-59v-8c0-16-9-29-24-34 0-10-4-19-11-19Z"
        />
        <path
          className="statue-form"
          d="M170 211c-29 10-50 32-59 68-7 29-4 77 14 105h170c18-28 21-76 14-105-9-36-30-58-59-68-10 16-23 24-40 24s-30-8-40-24Z"
        />
        <path
          className="statue-form"
          d="M117 292c-15 15-25 39-28 72-2 21 5 36 22 43 20 8 54-4 99-37l-22-27-58 31c7-31 16-59 27-82Z"
        />
        <path
          className="statue-form"
          d="M303 292c15 15 25 39 28 72 2 21-5 36-22 43-20 8-54-4-99-37l22-27 58 31c-7-31-16-59-27-82Z"
        />
        <path
          className="statue-form"
          d="M189 352c8-5 15-6 21-2 6-4 13-3 21 2 11 7 16 18 14 31-10 9-22 13-35 13s-25-4-35-13c-2-13 3-24 14-31Z"
        />
        <path
          className="statue-form"
          d="M124 384c-54 15-88 43-103 83-5 14 5 24 26 27 61 8 115-2 163-31-31-49-59-76-86-79Z"
        />
        <path
          className="statue-form"
          d="M296 384c54 15 88 43 103 83 5 14-5 24-26 27-61 8-115-2-163-31 31-49 59-76 86-79Z"
        />
        <path
          className="statue-base"
          d="M41 474c54 6 110-2 169-25 59 23 115 31 169 25-14 17-70 26-169 26s-155-9-169-26Z"
        />

        <path
          className="robe-light"
          d="M171 213c-23 11-38 34-44 69-5 33-1 67 12 102l48-24 23-10V235c-16 0-29-7-39-22Z"
        />
        <path
          className="robe-seam"
          d="M171 229c-15 42-18 88-9 139M137 287c18 10 34 13 49 11"
        />
        <path
          className="face-mark"
          d="M177 150c9-5 18-5 27 0m12 0c9-5 18-5 27 0m-46 39c9 5 18 5 27 0"
        />
      </g>
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M7.5 6H6a4 4 0 0 0 0 8h2m4.5 0H14a4 4 0 0 0 0-8h-2m-4 4h4" />
    </svg>
  )
}

export default function App() {
  const [latestValue, setLatestValue] = useState<number | null>(null)
  const [manualLevel, setManualLevel] = useState(0.34)
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
        .select("value")
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
      setSerialError("Chrome 또는 Edge에서 센서를 연결해 주세요.")
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

      if (!port.readable) throw new Error("센서 입력을 열 수 없습니다.")
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
      setSerialState("disconnected")
    } catch (error) {
      if ((error as DOMException).name !== "NotFoundError") {
        setSerialError(
          error instanceof Error ? error.message : "센서 연결에 실패했습니다.",
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
  const level =
    inputMode === "sensor" && sensorAvailable
      ? normalizeSensorValue(latestValue)
      : manualLevel
  const stateLabel =
    level === 0
      ? "고요"
      : level < 0.34
        ? "깨어남"
        : level < 0.72
          ? "상승"
          : "초월"
  const experienceStyle = { "--level": level } as CSSProperties
  const isOnline = serialState === "connected" || databaseState === "connected"

  return (
    <main className="meditation-page" style={experienceStyle}>
      <header className="meditation-header">
        <a className="brand" href="#" aria-label="명상 시간 홈">
          <span className="brand-symbol" />
          <span>명상 시간</span>
        </a>
        <div className="header-actions">
          <span className={`connection-status ${isOnline ? "online" : ""}`}>
            <i />
            {serialState === "connected"
              ? "SENSOR CONNECTED"
              : databaseState === "connected"
                ? "LIVE DATA"
                : "EXPERIENCE MODE"}
          </span>
          <button
            className="connect-button"
            type="button"
            onClick={
              serialState === "connected" ? disconnectSerial : connectSerial
            }
            disabled={serialState === "connecting"}
          >
            <LinkIcon />
            {serialState === "connecting"
              ? "연결 중"
              : serialState === "connected"
                ? "연결 해제"
                : "센서 연결"}
          </button>
        </div>
      </header>

      <section className="experience" aria-label="인터랙티브 명상 경험">
        <div className="title-block">
          <p>RESPOND TO STILLNESS</p>
          <h1>고요에서, 빛으로</h1>
          <span>당신의 감각이 만드는 작은 초월</span>
        </div>

        <div className="stage">
          <div className="figure-float">
            <BuddhaSilhouette />
          </div>
          <div className="ground-shadow" aria-hidden="true" />
        </div>

        <div className="readout state-readout">
          <span>현재 상태</span>
          <strong>{stateLabel}</strong>
        </div>
        <div className="readout height-readout">
          <span>LEVITATION</span>
          <strong>{(level * 2).toFixed(2)}</strong>
          <small>M</small>
        </div>
      </section>

      <section className="control-bar" aria-label="명상 레벨 제어">
        <div className="mode-switch" role="group" aria-label="입력 방식">
          <button
            className={inputMode === "manual" ? "active" : ""}
            type="button"
            onClick={() => setInputMode("manual")}
          >
            직접 체험
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
            <label htmlFor="meditation-level">명상 레벨</label>
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
          />
        </div>

        <p className="control-hint">
          {inputMode === "sensor"
            ? "입력에 집중하세요"
            : "천천히 움직여 보세요"}
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
