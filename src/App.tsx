import { useEffect, useRef, useState, type CSSProperties } from "react"
import { createClient } from "@supabase/supabase-js"

interface ReadingRow {
  value: number | string
}

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const supabaseUrl = rawSupabaseUrl
  ?.trim()
    .replace(/\/rest\/v1\/?.*$/, '')
  .replace(/\/$/, '')
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const normalizeSensorValue = (value: number) =>
  clamp(value <= 1 ? value : value / 1023)

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
          <h1>in-sense</h1>
          <span className="title-subtitle">빛으로 보는 명상</span>
        </div>

        <div className="stage">
          <div className="figure-float">
            <img
              className="buddha-image"
              src={`${import.meta.env.BASE_URL}images/buddha.png`}
              alt="명상하는 불상"
            />
          </div>
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
