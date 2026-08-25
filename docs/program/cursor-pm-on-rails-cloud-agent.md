# Cursor Cloud Agent + PM on Rails MCP

PM on Rails の実装対象タスクを Cursor Cloud Agent に渡して実装させるための起動手順。

## 起動

```bash
export CURSOR_API_KEY="..."
export PM_ON_RAILS_PAT="..."

bun run agent:pm-on-rails
```

デフォルトでは以下で Cursor Cloud Agent を作成する。

- repo: `git remote origin` から取得
- startingRef: `main`
- PM on Rails Project: `pm-on-rails`
- MCP: `https://pmonrails.com/api/mcp`
- PR: `autoCreatePR: true`

## オプション

```bash
bun run agent:pm-on-rails -- --dry-run
bun run agent:pm-on-rails -- --ref main
bun run agent:pm-on-rails -- --project pm-on-rails
bun run agent:pm-on-rails -- --repo https://github.com/ORG/REPO
bun run agent:pm-on-rails -- --prompt "PM on Rails MCPから..."
```

環境変数でも上書きできる。

```bash
export CURSOR_REPO_URL="https://github.com/ORG/REPO"
export CURSOR_STARTING_REF="main"
export CURSOR_AUTO_CREATE_PR="true"
export CURSOR_SKIP_REVIEWER="false"
export PM_ON_RAILS_PROJECT="pm-on-rails"
export PM_ON_RAILS_MCP_URL="https://pmonrails.com/api/mcp"
export CURSOR_PM_ON_RAILS_PROMPT="PM on Rails MCPで connect_project(name_or_id: \"pm-on-rails\") を呼んで Project に接続し、現在の実装対象タスクを取得してください。仕様・Gherkin・受入条件を確認し、必要な実装とテストを行い、PRを作成してください。"
```

トークンはスクリプトや Git 管理ファイルに書かず、実行環境の環境変数で渡す。
