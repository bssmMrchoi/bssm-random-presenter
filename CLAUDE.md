# CLAUDE.md — 랜덤발표자뽑기

새 세션에서 이 파일 하나만 읽으면 전체 프로젝트를 파악할 수 있도록 작성되었습니다.
기능 명세는 `plan.md`를 참고하세요.

---

## 프로젝트 개요

**부산소프트웨어마이스터고** 수업용 **랜덤 발표자 선택 웹앱**입니다.
야구 투구 테마의 애니메이션을 통해 학생 중 발표자를 무작위로 선택합니다.

- 완전 프론트엔드 전용 앱 (백엔드/API 없음)
- 빌드 플랫폼: **Lovable** (GPT-기반 UI 빌더) 로 초기 생성 — `lovable-tagger` 패키지로 흔적 남아있음
- 상태 영속성 없음 (새로고침 시 모든 설정 초기화됨)
- 실행 방식: **Docker** (`oven/bun:1` 이미지, 포트 8080)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| UI 프레임워크 | React 18.3.1 + TypeScript 5.8.3 |
| 빌드 도구 | Vite 5.4.19 (React SWC 플러그인) |
| 패키지 매니저 | **Bun** (`bun.lock` 존재) |
| 라우팅 | React Router DOM 6.30.1 |
| 스타일링 | Tailwind CSS 3.4.17 + shadcn/ui + Radix UI |
| 비동기 상태 | TanStack React Query 5.83.0 |
| 아이콘 | lucide-react 0.462.0 |
| 토스트 | sonner 1.7.4 |
| 테스트 | Vitest 3.2.4 + Playwright 1.57.0 |

---

## Docker 실행

```bash
# 최초 실행 / 코드 변경 후 모두 동일
docker compose up

# 백그라운드 실행
docker compose up -d

# 종료
docker compose down
```

- `docker build` 없이 `oven/bun:1` 이미지를 바로 사용
- 소스 코드를 컨테이너에 바인드 마운트 → **코드 수정이 즉시 반영** (HMR)
- `node_modules`는 `bun_modules` named volume에 분리 보관 (재시작 시 재설치 불필요)
- `CHOKIDAR_USEPOLLING=true` 설정으로 Windows 환경 파일 감지 지원

---

## 개발 명령어 (로컬 Node.js/Bun 환경)

```bash
bun run dev          # 개발 서버 시작 (포트 8080)
bun run build        # 프로덕션 빌드
bun run lint         # ESLint 실행
bun run preview      # 프로덕션 빌드 미리보기
bun run test         # Vitest 단위 테스트 실행
```

---

## 디렉토리 구조

```
랜덤발표자뽑기/
├── src/
│   ├── main.tsx                  # React 마운트 진입점
│   ├── App.tsx                   # 라우터 + QueryClientProvider + Toaster 래퍼
│   ├── index.css                 # Tailwind 디렉티브 + CSS 변수(디자인 토큰)
│   ├── pages/
│   │   ├── Index.tsx             # ★ 핵심 파일: 게임 전체 로직
│   │   └── NotFound.tsx          # 404 페이지
│   ├── components/
│   │   ├── NavLink.tsx           # Router NavLink 스타일 래퍼
│   │   └── ui/                   # shadcn/ui 컴포넌트 (사용 중인 것만 유지)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── slider.tsx
│   │       └── sonner.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx        # 모바일 브레이크포인트 감지
│   │   └── use-toast.ts          # 토스트 훅
│   └── lib/
│       └── utils.ts              # cn() 유틸리티 (clsx + tailwind-merge)
├── giants.png                    # 자이언츠 오리 마스코트 참고 이미지
├── index.html                    # HTML 진입점
├── plan.md                       # 기능 명세서 (수정 요청 시 이 파일 기준)
├── CLAUDE.md                     # 이 파일
├── package.json
├── docker-compose.yml            # Docker 실행 설정
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── components.json               # shadcn/ui 설정
├── bun.lock
└── .gitignore
```

---

## 핵심 파일: `src/pages/Index.tsx`

애플리케이션의 모든 게임 로직이 이 파일 하나에 담겨 있습니다.

### 학생 명단

```typescript
const DEFAULT_MEMBERS = [
  "곽영빈", "김민서", "김주연", "김효주", "노현승", "박건", "박시후",
  "윤동언", "이석찬", "이우린", "전지원", "조현우", "최수혁",
]; // 기본 13명
```

- UI에서 쉼표 구분 입력으로 명단 교체 가능 (`members` state)
- 명단 교체 시 `weights` / `currentWeights` 자동 초기화

### 게임 상태 머신 (Phase)

```typescript
type Phase =
  | 'idle'         // 투구 대기. 버튼/설정 전체 표시
  | 'windup'       // 투구 준비 (1200ms)
  | 'pitch'        // 공 날아가는 중 (800ms)
  | 'name-show'    // 이름 표시 + 판정 대기
  | 'strike'       // 스트라이크 판정 + 화면 흔들림
  | 'strike-wait'  // 비확정 스트라이크 후 대기 (이름 취소선만, BALL! 없음)
  | 'ball'         // 볼 판정
  | 'ball-wait'    // 볼 후 대기
  | 'reveal'       // 발표자 확정
  | 'fourball';    // 4볼 면제
```

### 주요 State

```typescript
members: string[]                 // 현재 학생 명단 (UI에서 편집 가능)
weights: Record<string, number>   // 사용자 설정 가중치 (1~5, 리셋 후 유지)
currentWeights: Record<string, number> // 게임 중 실제 모수. 투구마다 차감
phase: Phase                      // 현재 게임 단계
winner: string | null             // 선택된 발표자
ballCount: number                 // 현재 볼 수 (0~3)
strikeCount: number               // 현재 스트라이크 수
strikeTarget: number              // 발표자 확정에 필요한 스트라이크 수 (1~3)
isRandomMode: boolean             // 스트라이크 목표가 랜덤 선택됐는지 여부
showWeights: boolean              // 가중치 패널 표시 여부
tempName: string | null           // 현재 투구에서 선택된 임시 이름
weightsRef: MutableRefObject      // weights의 최신값 ref (비동기 콜백용)
```

### 가중치 / 모수 시스템

- **가중치 = 모수 내 복사본 수**: 가중치 2 = 해당 학생 이름이 2개 존재
- 투구 결과(볼/스트라이크) 시 해당 학생 `currentWeights` -1 차감
- `currentWeights` = 0 → 다음 투구부터 모수에서 제외
- 전체 소진 시 `currentWeights` → `weights`로 자동 복원
- `fullReset` 시 `currentWeights` → `weights`로 복원

### 스트라이크 확률 (투구 횟수 기준)

| 투구 수 | 스트라이크 확률 |
|---------|----------------|
| 1번째   | 10%            |
| 2번째   | 30%            |
| 3번째   | 50%            |
| 4번째+  | 70%            |

### 투구 흐름

```
[투구! 버튼]
  → currentWeights 기반 가중 무작위 선택
  → idle → windup (1.2s) → pitch (0.8s) → name-show
  → 확률 판정
      strike → currentWeights[chosen] -1 / strikeCount +1
          strikeCount == strikeTarget → reveal
          아직 부족 → strike-wait
      ball → currentWeights[chosen] -1 / ballCount +1
          ballCount == 4 → fourball
          아직 부족 → ball-wait
```

### 투수 캐릭터 (SVG)

`giants.png` (롯데 자이언츠 오리 마스코트) 기반 SVG:
- 흰 몸통 + 주황색 오리 부리 + 주황색 오리발
- 네이비 야구 모자 ("G" 로고) + Giants 유니폼 (등번호 18)
- 큰 동그란 눈 + 볼터치
- 날개형 팔 애니메이션: idle → windup(들어올림) → pitch(뻗음)
- windup 시 집중 눈썹 표정

### 화면 구성 (idle 기준, 위→아래)

```
① 제목
② B/S 카운트 표시
③ 메인 스테이지 (오리 투수 SVG + 공 + 텍스트 오버레이)
④ [투구!] [가중치 보기/숨기기] 버튼
⑤ 스트라이크 목표: [1S] [2S] [3S] [🎲 랜덤]
⑥ 명단 편집 카드 (쉼표 구분 입력 + 적용 버튼)
⑦ 가중치 설정 카드 (학생별 슬라이더 1~5)
```

---

## 스타일링 시스템

- `src/index.css`: HSL 기반 디자인 토큰 (`--primary`, `--background` 등), 다크 모드 지원
- 인라인 `<style>` 태그: 게임 전용 CSS 키프레임 (`ball-fly`, `strike-slam`, `winner-pop`, `shake` 등)
- 경로 별칭: `@/` → `src/`

---

## 처리 예정 작업 (TODO)

현재 처리 예정 작업 없음.

---

## 라우팅 구조

```
/ → src/pages/Index.tsx
* → src/pages/NotFound.tsx (404)
```

---

## 수정 시 참고

| 작업 | 위치 |
|------|------|
| 기본 학생 명단 변경 | `Index.tsx` `DEFAULT_MEMBERS` 배열 |
| 스트라이크 확률 조정 | `Index.tsx` `startPitch()` 내 `pitchNumber` 분기 |
| 투수 캐릭터 변경 | `Index.tsx` SVG 섹션 |
| 애니메이션 수정 | `Index.tsx` 하단 인라인 `<style>` 태그 |
| UI 컴포넌트 추가 | `npx shadcn@latest add <컴포넌트명>` |
| 기능 명세 확인/수정 요청 | `plan.md` |
