# AWS 배포 가이드 — S3 + CloudFront + 커스텀 도메인 (최신 콘솔 기준)

## 내 AWS 현황

- `bssmmrchoi.com` 도메인 보유
- Route 53 호스팅 영역: A, NS, SOA 레코드 존재

---

## 전체 흐름

```
① 앱 빌드 (로컬)
② S3 버킷 생성 + 파일 업로드
③ CloudFront 배포 생성 (OAC + ACM 인증서 + 도메인 통합 설정)
④ S3 버킷에 OAC 정책 붙여넣기
⑤ Route 53 A 레코드 → CloudFront로 교체
```

> **2024 이후 최신 콘솔 변경사항**
> - S3 버킷을 퍼블릭으로 열 필요 없음 → **OAC(Origin Access Control)** 방식으로 CloudFront만 접근 허용
> - CloudFront 생성 화면에서 도메인·SSL 인증서 통합 설정 가능
> - 정적 웹사이트 호스팅 활성화 불필요

---

## 0. 앱 빌드 (이미 완료됨 ✅)

### 빌드가 왜 필요한가?

개발 서버(`bun run dev`)는 소스 코드를 실시간 변환하며 실행합니다.
AWS에 올리려면 브라우저가 바로 읽을 수 있는 완성된 HTML/CSS/JS 파일이 필요합니다.
`bun run build`를 실행하면 `src/` 코드를 최적화·압축해서 `dist/` 폴더에 저장합니다.

### 재빌드가 필요할 때

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/Users/user/OneDrive - 부산산업과학고등학교/2026학년도(부산소프트웨어마이스터고)/랜덤발표자뽑기:/app" -w /app oven/bun:1 sh -c "bun install && bun run build"
```

`dist/` 폴더 안에 `index.html`, `assets/` 폴더가 생성됩니다.

---

## 1. S3 버킷 생성

1. [AWS 콘솔](https://console.aws.amazon.com) 로그인
2. 상단 검색창에 **S3** 검색 → **버킷 만들기** 클릭

### 버킷 설정

| 항목 | 값 |
|------|-----|
| 버킷 이름 | `bssm-random-presenter` |
| AWS 리전 | **아시아 태평양(서울) ap-northeast-2** |
| 객체 소유권 | **ACL 비활성화됨** (기본값 유지) |
| 퍼블릭 액세스 차단 | **그대로 유지** (모두 차단 — 변경 불필요) |
| 버전 관리 | 비활성화 |
| 기본 암호화 | 기본값 유지 |

**버킷 만들기** 클릭

> ✅ 퍼블릭 액세스를 열거나 버킷 정책을 수동 작성할 필요 없습니다.
> CloudFront OAC가 S3에 안전하게 접근합니다.

---

## 2. 파일 업로드

버킷 → **객체** 탭 → **업로드** 클릭

1. **파일 및 폴더 추가** 클릭
2. `dist/` 폴더 **안의 파일들** 선택 (폴더 자체가 아님)
   - `index.html`
   - `assets/` 폴더
3. **업로드** 클릭

> ⚠️ `dist` 폴더 자체가 아닌 **dist 폴더 안의 파일들**을 올려야 합니다.

---

## 3. CloudFront 배포 생성

검색창에 **CloudFront** 검색 → **배포 생성** 클릭

### 3-1. 배포 유형 선택

화면 상단에 배포 유형 선택 화면이 나타납니다.

→ **Single website or app** 선택

### 3-2. 기본 정보

| 항목 | 값 |
|------|-----|
| Distribution name | `bssm-random-presenter` |

### 3-3. 도메인 설정 (Domain setup)

| 항목 | 값 |
|------|-----|
| 도메인 설정 방식 | **Use a domain registered with Route 53** 선택 |
| 도메인 | 드롭다운에서 `bssmmrchoi.com` 선택 |
| SSL 인증서 | **Request new ACM certificate** 클릭 |

> ACM 인증서 발급 팝업이 열립니다. 도메인 이름 `bssmmrchoi.com` 확인 후 요청.
> us-east-1 리전에 자동 생성됩니다.
> 발급까지 수 분 소요 — 상태가 **"Issued"** 가 된 후 다시 이 화면으로 돌아와 발급된 인증서 선택.

### 3-4. 원본 설정 (Origin)

| 항목 | 값 |
|------|-----|
| Origin type | **Amazon S3** 선택 |
| Origin domain | `bssm-random-presenter.s3.ap-northeast-2.amazonaws.com` 선택 |
| Origin access | **Origin access control settings (recommended)** 선택 |
| Origin access control | **Create new OAC** 클릭 → 이름 기본값 유지 → **Create** |

### 3-5. 캐시 동작 설정

| 항목 | 값 |
|------|-----|
| 설정 방식 | **Use recommended origin settings** 선택 |
| 뷰어 프로토콜 정책 | **Redirect HTTP to HTTPS** (자동 설정됨) |

### 3-6. 기타 설정

| 항목 | 값 |
|------|-----|
| 기본값 루트 객체 (Default root object) | `index.html` |

**배포 생성** 클릭 → 배포 완료까지 **5~10분** 소요

---

## 4. S3 버킷에 OAC 정책 적용

배포 생성 직후 상단에 노란 배너가 나타납니다:

> *"The S3 bucket policy needs to be updated"*

1. 배너의 **Copy policy** 버튼 클릭 (자동 생성된 정책이 클립보드에 복사됨)
2. S3 → `bssm-random-presenter` 버킷 → **권한** 탭 → **버킷 정책** → **편집**
3. 복사한 내용 전체 붙여넣기 → **변경 사항 저장**

복사되는 정책 형태 (값은 자동 생성):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bssm-random-presenter/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::계정ID:distribution/배포ID"
        }
      }
    }
  ]
}
```

> 이 정책은 CloudFront 배포만 S3에 접근하도록 허용합니다. 직접 S3 URL로는 접근 불가.

---

## 5. 404 오류 처리 설정

새로고침하거나 직접 URL 입력 시 흰 화면이 뜨지 않도록 설정합니다.

CloudFront 배포 → **오류 페이지** 탭 → **사용자 정의 오류 응답 생성**

**403 설정:**

| 항목 | 값 |
|------|-----|
| HTTP 오류 코드 | **403** |
| 오류 응답 사용자 지정 | **예** |
| 응답 페이지 경로 | `/index.html` |
| HTTP 응답 코드 | **200** |

**404 설정** (동일하게 한 번 더):

| 항목 | 값 |
|------|-----|
| HTTP 오류 코드 | **404** |
| 오류 응답 사용자 지정 | **예** |
| 응답 페이지 경로 | `/index.html` |
| HTTP 응답 코드 | **200** |

---

## 6. Route 53 A 레코드 → CloudFront로 교체

Route 53 → **호스팅 영역** → `bssmmrchoi.com` → 기존 **A 레코드** 선택 → **편집**

| 항목 | 값 |
|------|-----|
| 레코드 유형 | **A** |
| 별칭 | **켜기** |
| 트래픽 라우팅 대상 | **CloudFront 배포에 대한 별칭** 선택 |
| 배포 선택 | 드롭다운에서 방금 만든 CloudFront 배포 선택 |

**저장** 클릭 → DNS 전파까지 최대 5분 소요

---

## 7. 접속 확인

브라우저에서 아래 주소로 접속:

```
https://bssmmrchoi.com
```

정상 접속 시 랜덤 발표자 뽑기 화면이 표시됩니다.

> **NoSuchKey 에러가 뜬다면?**
> S3에 파일이 제대로 올라가지 않은 것입니다. §2(파일 업로드) 단계에서 `dist` **폴더 자체**가 아닌 **폴더 안의 파일들**(`index.html`, `assets/`)을 선택했는지 확인하세요.

---

## 테마송 파일 처리

`public/tema_song.mp3`는 빌드 시 `dist/tema_song.mp3`로 자동 복사됩니다.

S3 업로드 시 `index.html`, `assets/`와 함께 `tema_song.mp3`도 같이 업로드해야 합니다.

> ⚠️ 파일 누락 시 브라우저 콘솔에 오디오 로드 오류가 출력되지만, 게임 자체는 정상 동작합니다.

---

## 코드 수정 후 재배포 절차

소스 코드를 변경할 때마다 아래 4단계를 순서대로 실행합니다.

---

### Step 1 — 코드 수정

`src/pages/Index.tsx` 등 소스 파일을 수정합니다.

---

### Step 2 — 로컬 빌드 (Docker 사용)

> 로컬에 Bun이 설치되어 있지 않아도 Docker로 빌드할 수 있습니다.
> **Git Bash(MSYS)** 에서 실행하세요.

```bash
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "C:/Users/user/OneDrive - 부산산업과학고등학교/2026학년도(부산소프트웨어마이스터고)/랜덤발표자뽑기:/app" \
  -w /app oven/bun:1 \
  sh -c "bun install && bun run build"
```

완료 후 프로젝트 폴더 안에 `dist/` 폴더가 생성(또는 갱신)됩니다.

```
dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

---

### Step 3 — S3 기존 파일 삭제 후 재업로드

#### 3-1. 기존 파일 삭제

1. [AWS S3 콘솔](https://s3.console.aws.amazon.com) → `bssm-random-presenter` 버킷
2. **객체** 탭에서 `index.html` 클릭 → 상단 **삭제** → 확인
3. `assets/` 폴더 클릭 → 상단 **삭제** → 확인

> ⚠️ 삭제를 건너뛰고 덮어쓰기만 해도 되지만, 이전 빌드의 해시 파일이 남아 버킷이 지저분해집니다.

#### 3-2. 새 파일 업로드

1. **업로드** 클릭
2. **파일 및 폴더 추가** → 로컬의 `dist/` **폴더 안** 파일 선택
   - `index.html` 선택
   - `assets/` 폴더 선택
3. **업로드** 클릭

> ✅ `dist` 폴더 자체가 아니라 **그 안의 파일들**을 선택해야 합니다.
> 업로드 후 버킷 최상위에 `index.html`과 `assets/`가 보여야 정상입니다.

---

### Step 4 — CloudFront 캐시 무효화

브라우저·엣지 서버에 남아 있는 이전 버전 캐시를 삭제합니다.

1. [AWS CloudFront 콘솔](https://console.aws.amazon.com/cloudfront) → `bssm-random-presenter` 배포 클릭
2. **무효화(Invalidations)** 탭 → **무효화 생성** 클릭
3. 객체 경로 입력창에 아래 입력:
   ```
   /*
   ```
4. **무효화 생성** 클릭

상태가 **In progress** → **Completed** 로 바뀌면 완료입니다 (보통 1~3분).

---

### 재배포 완료 확인

```
https://bssmmrchoi.com
```

브라우저에서 강력 새로고침(`Ctrl + Shift + R`)으로 접속해 수정 내용이 반영됐는지 확인합니다.
