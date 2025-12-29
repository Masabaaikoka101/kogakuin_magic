# 工学院大学マジシャンズ・ソサエティ公式サイト

## 1. サービスを一言で表す説明
工学院大学マジシャンズ・ソサエティ（KMS）の公式ポートフォリオサイトです。
新歓情報の提供、活動実績の紹介、そして外部からの公演依頼を円滑に受け付けるための公式窓口として機能します。

## 2. サイト概要とURL
| 項目 | 内容 |
| --- | --- |
| 制作者 | 工学院大学情報学部所属のマジシャンTN（公式サイトのリニューアルを担当） |
| 技術スタック | <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/AVIF-000000?style=for-the-badge&logo=avif&logoColor=white"><br>Vanilla JavaScript (SPA) / Google Apps Script (GAS) / **AVIF (画像軽量化)** |
| ページ構成 | `index.html` (JP) / `en/index.html` (EN) ほか、各ページに英語対応版あり |
| SEO対策 | `sitemap.xml`, `robots.txt`, OGP, 多言語SEO (canonical/lang) 設定済み |
| ステータス | 運用中（工学院大学サーバーにて静的ホスティング）<br>※セキュリティおよびサーバー仕様上、CD（継続的デプロイ）は導入不可。手動デプロイにて運用。 |

## 3. 制作背景と目的
- **リニューアルの動機**: 既存サイトのデザイン刷新に加え、外部からの公演依頼数を増加させることが最大の目的。スマートフォン利用を前提としたUI/UXの最適化も実施。
- **課題解決**: 
    - 「公演依頼」と「その他のお問い合わせ」を明確に区分し、依頼時に必要な情報（日時、予算、会場等）をフォーム上で完結させることで、メール往復のコストを削減。
    - 入部希望者が活動内容を直感的に理解できるギャラリーやFAQの整備。
- **技術的挑戦**: フレームワークに頼らず、標準技術（Vanilla JS, History API, View Transitions API）のみでSPA（シングルページアプリケーション）風の高速な遷移と多言語対応を実現すること。

## 4. デザイン・UIのこだわり
- **没入感を高める演出**:
    - **初回限定オープニング**: セッションストレージ (`sessionStorage`) を利用し、初回訪問時のみブランドムービーを再生。
    - **季節連動アニメーション**: 12月〜2月の冬季限定で、タイトルロゴに雪が降り積もる演出（Canvas API）を実装。
- **テーマ切替（ダーク/ライトモード）**:
    - 画面右上の電球スイッチを引くことで、ステージの暗転（ダーク）と日常（ライト）を切り替え可能。
    - **物理演算**: バネの物理モデルを用いた紐の揺れをJavaScriptで再現。
    - **五感へのフィードバック**: Web Audio APIによるスイッチ音と、Vibration APIによる触覚フィードバック（対応端末のみ）を実装。
- **迷わせない導線設計**:
    - `fetch` APIによる共通ヘッダーの動的読み込みと、現在地 (`aria-current`) の自動ハイライト。
    - フォーム入力モードの動的切り替えにより、ユーザーの目的に応じて不要な入力項目を非表示化。

## 5. 実装した主な機能
| 機能 | ファイル/技術 | 詳細 |
| --- | --- | --- |
| **SPA遷移システム** | `page-transition.js` | History APIとView Transitions APIを組み合わせ、リロードなしで高速にページ遷移。メタタグやOGP、`lang`属性も動的に更新。 |
| **多言語対応 (i18n)** | `en/` ディレクトリ + JS制御 | ディレクトリベースの静的ファイル配置と、JSによる動的テキスト置換（フォーム等）のハイブリッド構成。canonicalタグによるSEO重複防止。 |
| **テーマ切替システム** | `lightbulb.js` / `lightbulb.css` | 物理演算（Spring Physics）を用いた紐の挙動、配色変数の即時置換、効果音・バイブレーション制御。 |
| **共通ヘッダー** | `script.js` / `header.html` | 非同期読み込みにより保守性を向上。現在の言語（JP/EN）に応じてリンク先やアセットパスを自動書き換え。 |
| **お問い合わせフォーム** | `script.js` / Google Apps Script | 「公演依頼」「その他」のラジオボタンで必須項目を制御。言語設定に応じてラベルやバリデーションメッセージを英語/日本語に切り替え。 |
| **スクロール演出** | `script.js` / `scroll.css` | `IntersectionObserver` を利用した軽量なフェードインアニメーション。`data-animate` 属性で制御。 |
| **雪のアニメーション** | `snow-title.js` | HTML要素（タイトル文字）のピクセルデータを解析し、雪が文字の上に物理的に積もる様子をシミュレーション。 |
| **SEO・OGP** | 各HTML / `robots.txt` | メタタグ完備、クローラー制御、サイトマップ設置による検索エンジン最適化。 |

## 6. フォルダ構成
```
kogakuin_magic/
kogakuin_magic/
├─ index.html                 # ホーム（JP）
├─ about.html                 # 活動紹介（JP）
├─ contact.html               # お問い合わせ（JP）
├─ en/                        # 英語ページディレクトリ
│  ├─ index.html              # Home (EN)
│  ├─ about.html              # About (EN)
│  └─ contact.html            # Contact (EN)
├─ header.html                # 共通ヘッダーコンポーネント
├─ sitemap.xml                # サイトマップ
├─ robots.txt                 # クローラー設定
├─ assets/
│  ├─ css/
│  │  ├─ style.css            # メインスタイル（変数、共通設定）
│  │  ├─ scroll.css           # スクロールアニメーション
│  │  └─ lightbulb.css        # 電球スイッチスタイル
│  ├─ js/
│  │  ├─ script.js            # ルーティング、フォーム制御、共通ロジック
│  │  ├─ lightbulb.js         # テーマ切替（物理演算・音声・振動）
│  │  └─ snow-title.js        # 冬季限定雪アニメーション
│  ├─ images/                 # 画像アセット（AVIF統一）
│  └─ audio/                  # 効果音（Pendant_Light.mp3等）
└─ LICENSE
```

## 7. 工夫した点・学んだこと
- **アクセシビリティ (a11y)**:
    - フォームのエラーメッセージに `aria-live="polite"` を付与し、スクリーンリーダー利用者にリアルタイムで通知。
    - カラーコントラストや `aria-label` の適切な設定。
- **パフォーマンス**:
    - 画像の遅延読み込み (`loading="lazy"`) と、First Viewの優先読み込み (`fetchpriority="high"`).
    - 重いライブラリ（jQuery等）を排除し、Core Web Vitalsを意識した軽量設計。
- **保守性**:
    - CSS変数 (`--color-bg`, `--color-primary` 等) によるテーマ管理の一元化。
    - JSの機能をモジュール単位（機能ごと）にファイル分割し、可読性を維持。

## 8. 今後の展望
1.  **活動実績のCMS化**: Google Spreadsheet等を簡易CMSとして利用し、HTMLを編集せずに実績を追加できる仕組みの構築。
2.  **CI/CDパイプラインの整備**:
    *   **CI (継続的インテグレーション)**: GitHub Actionsを用い、プルリクエスト時にHTML/CSSの構文チェックやリンク切れ確認を自動実行する体制を整える（将来的な導入を検討）。
    *   **CD (継続的デプロイ)**: サーバー環境の制約により実施不可のため、今後はデプロイ手順の文書化と効率化（FTPスクリプト等は要検討）に留める。

