# Case Study / Service Case 数値根拠監査

作成: 2026-08-17（tasks-v3 TASK-P0-02 / TASK-P1-05）
対象: `src/pages/case-studies.astro`（allCases）と `src/data/service.ts`（各サービスのcaseStudies）

## Evidence Status 分類

- **A VERIFIED**: 契約資料・顧客確認・実測・ユーザー確認で根拠確認済み → 維持
- **B DERIVED**: 元データから計算可能 → 計算根拠を記録して維持
- **C QUALITATIVE**: 方向性は確認できるが数値は未確認 → 数値を削除し定性表現へ
- **D UNSUPPORTED**: 根拠不明 → 削除

数値を削除・定性化した場合も、この表に元の数値を残す。後から根拠（顧客確認・実測）が
得られた場合は、この表を根拠に復元してよい（2026-08-15のチャットボット数値誤削除事故の
再発防止: 台帳に無い＝実績でない、ではない。復元可能性を常に残す）。

## 監査結果

| source | case | claim | number | status | evidence location | action |
|---|---|---|---:|---|---|---|
| service.ts web-mobile | 社内業務システムのリプレイス | 運用コスト削減 | 40% | D | 出所不明（.claude/rules/marketing.md に記載なし） | 数値削除→定性化（2026-08-17） |
| service.ts web-mobile | 同上 | 処理時間短縮 | 60% | D | 同上 | 数値削除→定性化 |
| service.ts web-mobile | 同上 | ユーザー満足度 | 90% | D | 同上 | 数値削除→定性化 |
| service.ts web-mobile | モバイルアプリのUI/UX改善 | 継続率改善 | 30% | D | 同上 | 数値削除→定性化 |
| service.ts web-mobile | 同上 | 満足度向上 | 25% | D | 同上 | 数値削除→定性化 |
| service.ts web-mobile | 同上 | 機能利用率増加 | 50% | D | 同上 | 数値削除→定性化 |
| service.ts web-mobile | 倉庫AI DX | （数値なし・定性のみ） | - | C | marketing.md 2026-07-18（実案件・期間非公開） | 維持 |
| service.ts web-mobile | サブスク課金型マッチング | （数値なし・事実記述） | - | A | marketing.md 2026-07-18/08-15（BigQuery→Databricks併用確定） | 維持 |
| service.ts cdp | ECサイトの顧客データ基盤構築 | 顧客LTV向上 | 30% | D | 出所不明（memory: cdp従来2件は出所未確認） | 数値削除→定性化 |
| service.ts cdp | 同上 | マーケティング効率改善 | 40% | D | 同上 | 数値削除→定性化 |
| service.ts cdp | 同上 | リピート率増加 | 25% | D | 同上 | 数値削除→定性化 |
| service.ts cdp | SaaSスタートアップの売上分析基盤 | 売上増加 | 20% | D | 同上 | 数値削除→定性化 |
| service.ts ai-chatbot | SaaS企業 社内ヘルプデスク | 月間問い合わせ | 200件以上 | A | marketing.md 2026-08-15 ユーザー確認済み実測（除去禁止） | 維持 |
| service.ts ai-chatbot | 同上 | FAQ数 | 150件 | A | 同上 | 維持 |
| service.ts ai-chatbot | 同上 | 自動回答率 | 75% | A | 同上 | 維持 |
| service.ts ai-chatbot | 同上 | 情シス引き継ぎ | 月50件 | A | 同上 | 維持 |
| service.ts ai-chatbot | 同上 | 回答待ち | 4時間→5分 | A | 同上 | 維持 |
| service.ts ai-chatbot | 同上 | 戻せた時間 | 月30時間 | A | 同上 | 維持 |
| service.ts ai-chatbot | 建材メーカー 顧客サポート | 月間問い合わせ | 300件以上 | A | 同上 | 維持 |
| service.ts ai-chatbot | 同上 | カタログ | 200種類以上 | A | 同上 | 維持 |
| service.ts ai-chatbot | 同上 | 自動対応率 | 60% | A | 同上 | 維持 |
| service.ts ai-chatbot | 同上 | 技術サポート対応 | 月120件 | A | 同上 | 維持 |
| service.ts ai-chatbot | FAQ回答「自動回答率70〜80%」 | 設計目標 | 70-80% | B | 設計目標と明記済み（実績と誤認されない表記） | 維持 |
| service.ts ai-development | Gartner PoC放棄予測 | 30% | 30% | A | Gartner 2024-07 プレスリリース（リンク付き） | 維持 |
| case-studies.astro | 全件 | 丸い%・実績風数値 | - | - | 2026-08時点の全文grepで%系メトリクス0件（PR #110-112でベネフィット化済み） | 対応不要 |
| case-studies.astro | NTT系リカバリー | 3ヶ月停滞→3週間 | 3週間 | A | marketing.md（ユーザー申告・検証可能な事実の範囲） | 維持 |
| case-studies.astro | 大手商社の新規事業 | 立ち上げ | 1週間 | A | marketing.md（ユーザー申告） | 維持 |
| case-studies.astro | iroAI介護 | 本開発期間 | 約2ヶ月 | A | marketing.md（実URL公開・検証可能） | 維持 |
| case-studies.astro | 商用モバイルアプリFlutter移行 | IDR86・E2E19 | 86/19 | A | marketing.md 2026-07-18（リポジトリ実測） | 維持 |

注: tasks-v3 に監査対象例として挙がっていた「学習継続率+45% / 学習コスト-60% / 評価精度85% / 集計時間-90%」は、現行mainのコード内に存在しない（過去のPRで既に除去済みと判断）。

## 運用ルール

1. 新しい数値をcaseStudies/allCasesへ足すときは、この表に行を追加し status を付ける
2. C/D の数値は公開しない。ただし削除ではなくこの表に退避（復元可能性の確保）
3. 数値を落とす前に、それが実測かどうか不明な場合はユーザーに確認する（2026-08-15の教訓）
4. 監査の再実行: `grep -nE '[0-9]+(%|％|倍)' src/data/service.ts src/pages/case-studies.astro`
