---
globs: ["src/pages/api/ai/**/*.ts"]
---

# Cloudflare Workers AI Whisper (音声→テキスト) の契約

`env.AI.run("@cf/openai/whisper-large-v3-turbo", { audio, language, task })` で文字起こし。
- `audio`: **base64エンコードした音声バイト列の文字列**（ArrayBuffer→base64）。ファイルそのままではなくbase64文字列。
- `language`: ISO 639-1（日本語は `"ja"`）。省略で自動判定。
- `task`: `"transcribe"`（既定）or `"translate"`。
- レスポンス: `{ text, word_count, words[], vtt }`。`text` が文字起こし結果。

2026-05-02 に音声を諦めたのは Workers AI の能力不足ではなく、当時 `[ai]` binding が未配備でローカル検証が不安定だったため。現在は wrangler.toml に binding があり column-rag が env.AI を本番利用できているので Whisper も使える前提。クライアントは MediaRecorder で録音→POST→サーバで base64化→Whisper。webm/opus が Whisper でデコードできるかは実装時に要検証（ダメなら wav/mp3 へ）。
