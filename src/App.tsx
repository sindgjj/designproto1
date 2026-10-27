import { useEffect, useMemo, useRef, useState } from 'react'

type Region = {
  id: string
  path: string[]
  name: string
  parentPath: string[]
  value: number
  depth: number
}

const DATA_URL = '/data/land-price-2026-08.csv'

function parseCSV(text: string): Region[] {
  return text
    .replace(/^\uFEFF/, '')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const columns = line.split(',').map((cell) => cell.replace(/^"|"$/g, '').trim())
      const path = columns.slice(0, 4).filter((name) => name && name !== '소계')
      return {
        id: path.join('>'),
        path,
        name: path.at(-1) ?? '',
        parentPath: path.slice(0, -1),
        value: Number(columns[4]),
        depth: path.length,
      }
    })
}

function formatRate(value: number, sign = true) {
  return `${sign && value > 0 ? '+' : ''}${value.toFixed(3)}%`
}

function Rate({ value }: { value: number }) {
  return <span className={`rate ${value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'}`}>{formatRate(value)}</span>
}

function Icon({ name }: { name: 'search' | 'chevron' | 'sort' | 'pin' | 'close' }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    sort: <><path d="m8 7 4-4 4 4M12 3v18M16 17l-4 4-4-4" /></>,
    pin: <><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    close: <path d="m7 7 10 10M17 7 7 17" />,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">{paths[name]}</svg>
}

export default function App() {
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedPath, setSelectedPath] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [rankTab, setRankTab] = useState<'high' | 'low'>('high')
  const [sort, setSort] = useState<'desc' | 'asc'>('desc')
  const [visibleRows, setVisibleRows] = useState(12)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(DATA_URL)
      .then((response) => response.text())
      .then((text) => setRegions(parseCSV(text)))
      .catch(() => setRegions([]))
  }, [])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const national = regions.find((region) => region.id === '전국')
  const currentId = selectedPath.join('>')
  const current = selectedPath.length
    ? regions.find((region) => region.id === currentId)
    : national

  const children = useMemo(() => {
    const parent = selectedPath.length ? selectedPath : []
    return regions.filter((region) => {
      if (!parent.length) return region.depth === 1 && region.name !== '전국'
      return region.depth === parent.length + 1 && region.parentPath.join('>') === parent.join('>')
    })
  }, [regions, selectedPath])

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return regions
      .filter((region) => region.name !== '전국' && region.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.indexOf(term) - b.name.indexOf(term))
      .slice(0, 8)
  }, [regions, query])

  const ranked = useMemo(
    () => [...children].sort((a, b) => rankTab === 'high' ? b.value - a.value : a.value - b.value).slice(0, 5),
    [children, rankTab],
  )
  const tableRows = useMemo(
    () => [...children].sort((a, b) => sort === 'desc' ? b.value - a.value : a.value - b.value),
    [children, sort],
  )

  const drill = (region: Region) => {
    setSelectedPath(region.path)
    setQuery('')
    setSearchOpen(false)
    setVisibleRows(12)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const maxAbs = Math.max(...children.map((region) => Math.abs(region.value)), 0.01)
  const scopeLabel = selectedPath.length ? selectedPath.at(-1) : '전국'
  const high = [...children].sort((a, b) => b.value - a.value)[0]
  const low = [...children].sort((a, b) => a.value - b.value)[0]

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">K</span><span>국토 데이터</span></div>
        <span className="data-date">2026년 8월 기준</span>
      </header>

      <div className="shell">
        <section className="intro">
          <p className="eyebrow">LAND PRICE INDEX</p>
          <h1>지역별 지가변동률</h1>
          <p className="description">2026년 8월 대한민국 읍·면·동 단위 지가변동률을 탐색하고 비교해보세요.</p>
        </section>

        <section className="tools" aria-label="지역 탐색">
          <div className="breadcrumbs">
            <button className={selectedPath.length === 0 ? 'active' : ''} onClick={() => setSelectedPath([])}>전국</button>
            {selectedPath.map((name, index) => (
              <span className="crumb" key={`${name}-${index}`}>
                <Icon name="chevron" />
                <button className={index === selectedPath.length - 1 ? 'active' : ''} onClick={() => setSelectedPath(selectedPath.slice(0, index + 1))}>{name}</button>
              </span>
            ))}
          </div>
          <div className="search-wrap" ref={searchRef}>
            <Icon name="search" />
            <input
              aria-label="지역명 검색"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
              placeholder="지역명을 검색하세요"
            />
            {query && <button className="clear" aria-label="검색어 지우기" onClick={() => setQuery('')}><Icon name="close" /></button>}
            {searchOpen && query && (
              <div className="search-results">
                <p className="search-label">검색 결과 {searchResults.length}건</p>
                {searchResults.length ? searchResults.map((region) => (
                  <button key={region.id} onClick={() => drill(region)}>
                    <span><b>{region.name}</b><small>{region.path.join(' > ')}</small></span>
                    <Rate value={region.value} />
                  </button>
                )) : <p className="empty">일치하는 지역이 없습니다.</p>}
              </div>
            )}
          </div>
        </section>

        <section className="summary">
          <div className="summary-primary">
            <p>{scopeLabel} 지가변동률</p>
            <strong className={(current?.value ?? 0) >= 0 ? 'up' : 'down'}>{current ? formatRate(current.value) : '—'}</strong>
            <span>전월 대비 변동률</span>
          </div>
          <div className="summary-stat">
            <span>상승률이 높은 지역</span>
            <b>{high?.name ?? '—'}</b>
            {high && <Rate value={high.value} />}
          </div>
          <div className="summary-stat">
            <span>하락률이 낮은 지역</span>
            <b>{low?.name ?? '—'}</b>
            {low && <Rate value={low.value} />}
          </div>
          <div className="summary-stat count">
            <span>전체 지역 수</span>
            <b>{children.length.toLocaleString()}<small>개</small></b>
            <em>현재 단계 기준</em>
          </div>
        </section>

        <section className="panel chart-panel">
          <div className="section-head">
            <div><p className="section-kicker">{scopeLabel} OVERVIEW</p><h2>{selectedPath.length ? '하위 지역별' : '시·도별'} 지가변동률</h2></div>
            <p>막대를 선택해 하위 지역을 탐색하세요</p>
          </div>
          <div className="chart">
            {children.map((region) => (
              <button className="bar-row" key={region.id} onClick={() => drill(region)}>
                <span className="bar-name">{region.name}</span>
                <span className="bar-track">
                  <i className={region.value >= 0 ? 'positive' : 'negative'} style={{ width: `${Math.max(Math.abs(region.value) / maxAbs * 100, 1.5)}%` }} />
                </span>
                <Rate value={region.value} />
                <Icon name="chevron" />
              </button>
            ))}
            {!children.length && <p className="empty-block">더 이상 하위 지역 데이터가 없습니다.</p>}
          </div>
          <div className="legend"><span><i className="dot positive" /> 상승</span><span><i className="dot negative" /> 하락</span><span>단위: %</span></div>
        </section>

        <section className="panel ranking-panel">
          <div className="section-head">
            <div><p className="section-kicker">RANKING</p><h2>{scopeLabel} 지역 순위</h2></div>
            <div className="tabs">
              <button className={rankTab === 'high' ? 'active' : ''} onClick={() => setRankTab('high')}>상승률 높은 지역</button>
              <button className={rankTab === 'low' ? 'active' : ''} onClick={() => setRankTab('low')}>하락률 낮은 지역</button>
            </div>
          </div>
          <div className="ranking-list">
            {ranked.map((region, index) => (
              <button key={region.id} onClick={() => drill(region)}>
                <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="ranking-name">{region.name}<small>{region.parentPath.join(' > ') || '전국'}</small></span>
                <span className="mini-track"><i className={region.value >= 0 ? 'positive' : 'negative'} style={{ width: `${Math.max(Math.abs(region.value) / maxAbs * 100, 2)}%` }} /></span>
                <Rate value={region.value} />
                <Icon name="chevron" />
              </button>
            ))}
            {!ranked.length && <p className="empty-block">순위를 표시할 하위 지역이 없습니다.</p>}
          </div>
        </section>

        <section className="panel table-panel">
          <div className="section-head">
            <div><p className="section-kicker">ALL DATA</p><h2>전체 데이터</h2></div>
            <span className="row-count">{children.length.toLocaleString()}개 지역</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>지역</th><th>상위 행정구역</th><th><button onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}>지가변동률 <Icon name="sort" /></button></th></tr></thead>
              <tbody>
                {tableRows.slice(0, visibleRows).map((region) => (
                  <tr key={region.id} onClick={() => drill(region)}>
                    <td><span className="location"><Icon name="pin" />{region.name}</span></td>
                    <td>{region.parentPath.join(' > ') || '전국'}</td>
                    <td><Rate value={region.value} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleRows < tableRows.length && <button className="more" onClick={() => setVisibleRows((count) => count + 20)}>더 보기 <span>({tableRows.length - visibleRows}개 남음)</span></button>}
        </section>

        <footer><p>출처: 국토교통부 · 2026년 8월 지가변동률</p><p>본 자료는 공공데이터를 기반으로 제공됩니다.</p></footer>
      </div>
    </main>
  )
}
