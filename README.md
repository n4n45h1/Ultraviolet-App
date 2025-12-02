<div align="center">
  <svg width="120" height="120" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="28" fill="url(#logoGradient)" stroke="#e0e0e0" stroke-width="2"/>
    <path d="M20 25L30 35L50 15" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea"/>
        <stop offset="100%" style="stop-color:#764ba2"/>
      </linearGradient>
    </defs>
  </svg>
</div>

<h1 align="center">Sliply</h1>

<p align="center">
  <strong>高度なウェブプロキシソリューション</strong><br>
  美しいデザインと革新的な技術で、自由なインターネットアクセスを提供
</p>

Sliplyは[Ultraviolet](https://github.com/titaniumnetwork-dev/Ultraviolet)をベースにした、モダンで洗練されたプロキシアプリケーションです。Service Workersとその他の高度な技術を活用して、インターネット検閲の回避やウェブサイトへの安全なアクセスを実現します。

## ✨ 特徴

- 🎨 **モダンなデザイン**: 白色ベースの洗練されたユーザーインターフェース
- 🔒 **高度なセキュリティ**: 暗号化された通信でプライバシーを保護
- ⚡ **高速パフォーマンス**: 最適化されたサーバーで快適な閲覧体験
- 📱 **レスポンシブ対応**: デスクトップからモバイルまで完全対応
- 🌐 **多言語サポート**: 日本語をはじめとする多言語に対応

## 🚀 デプロイメント

[![Deploy to Railway](https://binbashbanana.github.io/deploy-buttons/buttons/remade/railway.svg)](https://railway.app/template/deploy)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)

サーバーやその他のサービスにデプロイする場合は、[ターミナルからのデプロイ](#ターミナルからのデプロイ)を参照してください。

## 📋 必要要件

- Node.js 16.0.0以上
- npm 7.0.0以上

## 🛠️ インストールと起動

### ローカル開発環境での起動

1. リポジトリをクローンします：
```bash
git clone https://github.com/n4n45h1/Sliply-App.git
cd Sliply-App
```

2. 依存関係をインストールします：
```bash
npm install
```

3. サーバーを起動します：
```bash
npm start
```

4. ブラウザで `http://localhost:8080` にアクセスします

### Docker を使用した起動

```bash
docker build -t sliply .
docker run -p 8080:8080 sliply
```

## ⚙️ 設定

### 環境変数

- `PORT`: サーバーポート番号（デフォルト: 8080）

### カスタマイズ

`public/` フォルダ内のファイルを編集することで、デザインや機能をカスタマイズできます：

- `index.html`: メインページのHTML構造
- `styles.css`: スタイルシートとデザイン
- `index.js`: フロントエンドのJavaScript機能

## 🔧 技術仕様

### HTTPトランスポート

このアプリケーションでは[EpoxyTransport](https://github.com/MercuryWorkshop/EpoxyTransport)を使用してプロキシデータを暗号化して取得しています。

他のトランスポートオプション：
- [CurlTransport](https://github.com/MercuryWorkshop/CurlTransport): 暗号化データの取得の代替手段
- [Bare-Client](https://github.com/MercuryWorkshop/Bare-as-module3): レガシー（非暗号化）トランスポート

詳細については[bare-mux](https://github.com/MercuryWorkshop/bare-mux)のドキュメントを参照してください。

### 使用ライブラリ

- **Fastify**: 高性能Node.js Webフレームワーク
- **Ultraviolet**: 高度なプロキシ技術
- **EpoxyTransport**: 暗号化通信
- **Wisp Server**: WebSocketベース通信

## 📄 ライセンス

このプロジェクトはGPL-3.0-or-laterライセンスの下で配布されています。

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。貢献する前に、まずイシューで議論することをお勧めします。

## 🙏 謝辞

- [TitaniumNetwork](https://github.com/titaniumnetwork-dev) - オリジナルのUltraviolet技術
- [MercuryWorkshop](https://github.com/MercuryWorkshop) - 暗号化トランスポート技術
- オープンソースコミュニティの皆様

## 📞 サポート

- [GitHub Issues](https://github.com/n4n45h1/Sliply-App/issues) - バグ報告や機能要求
- [Discord Server](https://discord.gg/unblock) - コミュニティサポート

---

<p align="center">Made with ❤️ for a free and open internet</p>
