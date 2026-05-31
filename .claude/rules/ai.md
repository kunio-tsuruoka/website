---
globs: ["src/pages/api/ai/**/*.ts"]
---

# Cloudflare Workers AI Whisper (音声→テキスト) の契約

`env.AI.run("@cf/openai/whisper-large-v3-turbo", { audio, language, task })` で文字起こし。
- `audio`: **base64エンコードした音声バイト列の文字列**（ArrayBuffer→base64）。ファイルそのままではなくbase64文字列。
- `language`: ISO 639-1（日本語は `"ja"`）。省略で自動判定。
- `task`: `"transcribe"`（既定）or `"translate"`。
- レスポンス: `{ text, word_count, words[], vtt }`。`text` が文字起こし結果。

クライアントは MediaRecorder で録音→POST→サーバで base64化→Whisper。**webm/opus は Whisper で問題なくデコードできる**（2026-05-30 実証: REST直叩きで3秒、`text` 正確）。

## `env.AI` バインディングは local dev で whisper がハングする（2026-05-30 実証・重要）

`/api/ai/transcribe` 実装時の事故: `env.AI.run(whisper, ...)` を先に呼ぶと **local dev で60秒以上ハングして応答が返らない**（platformProxy 経由のリモート binding が audio で詰まる。2026-05-02 の音声断念と同根）。一方 **Workers AI の REST 直叩き (`https://api.cloudflare.com/.../ai/run/@cf/openai/whisper-large-v3-turbo`) は webm を3秒で正しく処理**する。

→ **transcribe は REST を優先する**: `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` があれば REST、無いときだけ `env.AI` バインディング。`env.AI` 経路には必ず `Promise.race` でタイムアウト(25s)を噛ませ無限ハングを防ぐ。クライアント側も `AbortController`(30s) で「変換中」表示が無限に残らないようにする。

**本番(Cloudflare Pages)の注意**: `CLOUDFLARE_API_TOKEN` はローカル限定クレデンシャル（`.cloudflare/api-token`）で **prod Pages には未設定**。したがって prod では現状 `env.AI` バインディング経路に落ちる。whisper が binding 経由で prod で安定動作するかは未検証。**もし prod で音声がハング/失敗するなら、`CLOUDFLARE_API_TOKEN`(Workers AI Read権限) を Pages secret に入れて REST 経路を使わせる**のが確実。embeddings(column-rag) は binding で動いているが、audio は別物として扱う。
