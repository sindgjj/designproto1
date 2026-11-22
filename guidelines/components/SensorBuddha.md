# SensorBuddha

검은 바탕 정가운데에 배치된 불상 이미지. 센서값에 따라 밝기와 주변 광채가 바뀐다.

- 이미지 `불상.png` (투명 배경). `<div class="buddha"><img src="/불상.png" alt=""></div>`
- 위치: 화면 정가운데. 감싸는 `<section aria-label="불상 상태">`는 min-height 70vh, flex 세로 정렬로 가로 세로 가운데. 소제목 없음
- level = clamp((value − SENSOR_MIN) / (SENSOR_MAX − SENSOR_MIN), 0, 1) → `.buddha`의 `--level` 스타일 변수
- 밝기 0.25 + 0.75 × level, 빛 drop-shadow level × 48px `--buddha-glow` (styles.md의 `.buddha` 그대로)
- 전원 OFF: `data-power="off"` → 밝기 0.12, 흑백, 빛 없음
- 위아래 10px, 6초 주기로 천천히 떠 있음. reduced-motion이면 멈춤
- 불상 아래 space-6 간격으로 현재값 `t-value` (천 단위 콤마, 값 없으면 "—")
- `role="img"`, `aria-label="불상 밝기 NN%"`, 꺼지면 "불상 꺼짐"
- 응용: 같은 규격(정사각, 투명 배경) 이미지로 바꾸면 자기 제품 오브제로 쓸 수 있다