# Beekle 要件パイプラインの正規順序（2026-07-14 反転確定）

ユーザー決定により、Beekleが推奨する要件パイプラインの順序を **「ユーザーストーリー→FM」から「要求→FM→ユーザーストーリー」へ全面反転**した。以後、全記事・ツール・図はこの順序で統一する。

## 正規順序（これを唯一の真実源とする）

```
① 要求（やりたいこと）を洗い出す      ← 粗い機能候補を並べる工程
② FM法で「作る／後回し／作らない」    ← 要求を3軸で粗く絞る
③ ユーザーストーリー（＋EARS）        ← 「作る」と決めた要求だけを詳細化（誰が/何を/なぜ）
④ Gherkin（Given/When/Then）          ← 受入条件・デモ＝テスト化
⑤ 実装
```

- アクター定義・As-Is/To-Be可視化を持つ記事は ①の前段に残す（不変）。
- **ブランド「6ステップパイプライン」は名称維持**。`要求を洗い出しFM法で絞る`を1ステップに束ねて6ステップを保つ（7ステップに改名しない）。新6ステップ = アクター / As-Is・To-Be / 要求を洗い出しFMで絞る / ユーザーストーリー＋EARS / Gherkin / 実装。

## なぜ反転したか
FMは「候補要件を3軸で絞る」手法。詳細なユーザーストーリーを全件書いてから絞るのは、切る分の作り込みが無駄。**粗い要求で洗い出す→FMで絞る→残った「作る」だけをストーリーで詳細化**が効率的（pm-on-railsの Demand→Requirement→Story とも整合）。

## 旧順序（story→FM）が残っていた箇所＝要修正リスト
- リスト反転で済む: dx-josys-ai-era-requirements, dx-josys-as-is-bpo-guide, requirements-definition-template, ai-development-speed, requirements-definition-process(フェーズ順), requirements-definition-complete-guide(フェーズ4)
- 背骨の再執筆が要る: engineer-communication（STEP1〜3が「Why=ストーリー」構成）, project-management-complete-guide（6ステップ本文）
- FM定義側: scope-management-fm-method（Step1の「ユーザーストーリー形式で書くと評価しやすい」ヒントを「要求は粗い1行で。詳細ストーリー化はFM後」に）, requirements-prioritization-moscow-fm
- knowledge: ears-gherkin-workflow（1-Aがユーザーストーリー始点。要求→FM→ストーリーに前置き調整。ただしEARS/Gherkin教材の主眼は不変）
- ツール: scope-manager ↔ story-builder のデータフロー説明（現状 story→FM）。新カノンは FM(要求)→story。**scope-manager.md ルール**と各ツールページのコピー/関連リンク文言を更新（コード動作は要件リストを絞る点で不変、位置づけコピーのみ）。

## 検証
PATCH後、`grep`で「ユーザーストーリー[^。]{0,20}(FM|絞|優先)」がヒットしないこと、`FM[^。]{0,20}(残った|作る要求)`系に置換されたことを各記事で確認。tools/story-builder と tools/scope-manager の説明が新順序で矛盾しないか目視。
