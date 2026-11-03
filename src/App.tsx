import { useMemo, useState } from 'react'

const sensorData = [
  { time: '10:00', value: 292 }, { time: '10:05', value: 305 },
  { time: '10:10', value: 298 }, { time: '10:15', value: 321 },
  { time: '10:20', value: 314 }, { time: '10:25', value: 336 },
  { time: '10:30', value: 329 }, { time: '10:35', value: 352 },
  { time: '10:40', value: 341 }, { time: '10:45', value: 363 },
  { time: '10:50', value: 347 }, { time: '10:55', value: 318 },
]

function SensorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.3 2.8c.4 3-1.4 4.2-2.3 5.8-.8 1.5-.4 2.7.5 3.5-.1-2.1 1.3-3.3 2.7-4.3 2 2.2 3.3 4.5 3.3 7.2a5.5 5.5 0 0 1-11 0c0-3.2 1.9-6 6.8-12.2Z" />
      <path d="M13.3 14c.7 1 1.2 1.8 1.2 2.9a2.5 2.5 0 0 1-5 0c0-1.3.7-2.5 2.3-4.1 0 1.4.6 2 1.5 2.6" />
    </svg>
  )
}

function LineChart() {
  const width = 920
  const height = 300
  const padding = { left: 52, right: 20, top: 24, bottom: 42 }
  const min = 250
  const max = 400
  const x = (index: number) => padding.left + index * ((width - padding.left - padding.right) / (sensorData.length - 1))
  const y = (value: number) => padding.top + (max - value) * ((height - padding.top - padding.bottom) / (max - min))
  const points = sensorData.map((item, index) => `${x(index)},${y(item.value)}`).join(' ')
  const area = `${padding.left},${height - padding.bottom} ${points} ${x(sensorData.length - 1)},${height - padding.bottom}`

  return (
    <div className="chart-wrap">
      <svg className="sensor-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="최근 1시간 불꽃센서 값 변화 선 그래프">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c45e42" stopOpacity=".22" />
            <stop offset="100%" stopColor="#c45e42" stopOpacity=".01" />
          </linearGradient>
        </defs>
        {[250, 300, 350, 400].map((tick) => (
          <g key={tick}>
            <line x1={padding.left} y1={y(tick)} x2={width - padding.right} y2={y(tick)} className="grid-line" />
            <text x={padding.left - 13} y={y(tick) + 4} textAnchor="end" className="axis-label">{tick}</text>
          </g>
        ))}
        <polygon points={area} fill="url(#areaFill)" />
        <polyline points={points} className="data-line" />
        {sensorData.map((item, index) => (
          <g key={item.time}>
            <circle cx={x(index)} cy={y(item.value)} r="3.5" className="data-point" />
            {(index % 2 === 0 || index === sensorData.length - 1) && (
              <text x={x(index)} y={height - 15} textAnchor="middle" className="axis-label">{item.time}</text>
            )}
          </g>
        ))}
        <line x1={padding.left} y1={y(380)} x2={width - padding.right} y2={y(380)} className="threshold-line" />
        <text x={width - padding.right} y={y(380) - 7} textAnchor="end" className="threshold-label">주의 기준 380</text>
      </svg>
    </div>
  )
}

export default function App() {
  const [range, setRange] = useState('1시간')
  const current = sensorData.at(-1)?.value ?? 0
  const average = useMemo(() => Math.round(sensorData.reduce((sum, item) => sum + item.value, 0) / sensorData.length), [])
  const peak = Math.max(...sensorData.map((item) => item.value))

  return (
    <main className="sensor-page">
      <header className="sensor-header">
        <div className="sensor-brand">
          <span className="sensor-logo"><SensorIcon /></span>
          <span>시설 안전 모니터링</span>
        </div>
        <div className="header-status"><i /> 시스템 정상</div>
      </header>

      <div className="sensor-shell">
        <section className="sensor-intro">
          <div>
            <p className="sensor-eyebrow">FIRE SENSOR MONITORING</p>
            <h1>불꽃센서 대시보드</h1>
            <p>센서의 현재 상태와 시간에 따른 변화를 확인하세요.</p>
          </div>
          <p className="updated">최근 업데이트 <b>오늘 10:55</b></p>
        </section>

        <section className="sensor-grid">
          <article className="current-card">
            <div className="card-top">
              <span>현재 센서값</span>
              <span className="live-badge"><i /> LIVE</span>
            </div>
            <div className="current-value"><strong>{current}</strong><span>ADC</span></div>
            <div className="normal-state">
              <span className="state-icon"><SensorIcon /></span>
              <span><b>정상 범위</b><small>불꽃이 감지되지 않았습니다</small></span>
            </div>
          </article>

          <div className="metric-column">
            <article className="metric-card">
              <span>1시간 평균</span>
              <strong>{average}<small> ADC</small></strong>
              <em>안정적인 상태입니다</em>
            </article>
            <article className="metric-card">
              <span>최고 센서값</span>
              <strong>{peak}<small> ADC</small></strong>
              <em>오늘 10:45 기록</em>
            </article>
          </div>

          <article className="device-card">
            <div className="device-head"><span>센서 정보</span><i /></div>
            <dl>
              <div><dt>센서 ID</dt><dd>FIRE-01</dd></div>
              <div><dt>설치 위치</dt><dd>설비실 A구역</dd></div>
              <div><dt>연결 상태</dt><dd className="connected">온라인</dd></div>
              <div><dt>주의 기준값</dt><dd>380 ADC</dd></div>
            </dl>
          </article>
        </section>

        <section className="trend-panel">
          <div className="trend-head">
            <div>
              <p className="sensor-eyebrow">SENSOR TREND</p>
              <h2>시간별 센서 변화</h2>
            </div>
            <div className="range-tabs" aria-label="조회 기간">
              {['1시간', '6시간', '24시간'].map((item) => (
                <button key={item} className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{item}</button>
              ))}
            </div>
          </div>
          <div className="chart-meta">
            <span><i className="series-dot" /> 센서값 (ADC)</span>
            <span>예시 데이터 · 5분 간격</span>
          </div>
          <LineChart />
        </section>

        <footer className="sensor-footer">
          <p>현재 화면은 예시 데이터를 사용하고 있습니다.</p>
          <p>실시간 데이터 연결 예정</p>
        </footer>
      </div>
    </main>
  )
}
