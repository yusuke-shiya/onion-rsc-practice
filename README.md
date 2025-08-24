# Onion RSC Practice

Onion ArchitectureとReact Server Components (RSC)の学習用プロジェクト - Remix + Vite + TypeScript

## 概要

このプロジェクトは以下の技術・アーキテクチャパターンを学習するためのものです：

- **Onion Architecture**: ドメイン駆動設計のアーキテクチャパターン
- **React Server Components (RSC)**: Reactの新しいレンダリング機能
- **Remix**: フルスタックWebフレームワーク
- **Vite**: モダンなビルドツール
- **TypeScript**: 型安全性を提供

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Claude Code設定 (オプション)

Claude Codeを使用する場合は、以下の設定が必要です：

```bash
# Claude設定ファイルをコピー
cp .claude/symlinks/claude.example.json .claude/symlinks/claude.json

# claude.jsonを編集してGitHubアクセストークンを設定
# GITHUB_PERSONAL_ACCESS_TOKEN: "your_github_personal_access_token_here"
```

**注意**: `.claude/symlinks/claude.json`にはシークレットキーが含まれるため、Gitにコミットされません。

## リソース

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server:

```sh
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
