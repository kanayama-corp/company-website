<<<<<<< HEAD
# 法人物販事業コーポレートサイト

スタイリッシュで信頼感のある法人向けコーポレートサイトです。

## 特徴

- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応
- **モダンなUI**: 白背景にネイビー・グレーを基調としたビジネスライクなデザイン
- **アニメーション**: スムーズなスクロールアニメーションと視覚効果
- **SEO対応**: 適切なHTML構造とメタタグ

## ページ構成

1. **ヒーローセクション** - 会社名、キャッチコピー、CTAボタン
2. **会社概要** - 企業理念、沿革、代表メッセージ
3. **事業内容** - EC物販、卸業者取引、業務効率化支援
4. **実績紹介** - 販売実績、取扱ブランド、導入事例
5. **FAQ** - よくある質問（仕入れ・業務支援関連）
6. **お問い合わせ** - コンタクトフォーム、会社情報、地図

## 技術仕様

- HTML5 + CSS3 + JavaScript (Vanilla)
- Google Fonts (Noto Sans JP)
- Font Awesome アイコン
- CSS Grid & Flexbox レイアウト
- Intersection Observer API (アニメーション)

## 使用方法

1. ローカルサーバーを起動:
   ```bash
   python -m http.server 8000
   ```

2. ブラウザで `http://localhost:8000` にアクセス

## カスタマイズ

- 会社名や連絡先情報を実際の情報に変更してください
- Google Maps の埋め込みURLを実際の住所に変更してください
- 実績数値や事例を実際のデータに更新してください
=======
# Google Meet Brightness Filter Chrome Extension

A Chrome extension that adds a brightness control slider to Google Meet video calls.

## Features

- Real-time brightness adjustment for all video elements in Google Meet
- Fixed-position slider in the top-right corner of the screen
- Brightness range: 50% to 200% (0.5x to 2.0x)
- Automatic detection of new video elements (participants joining/leaving)
- Clean, minimal UI that doesn't interfere with Meet's interface

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `google-meet-brightness-filter` folder
4. The extension will be installed and ready to use

## Usage

1. Join any Google Meet call at `https://meet.google.com/*`
2. You'll see a brightness control slider in the top-right corner
3. Move the slider to adjust the brightness of all video feeds
4. The current brightness percentage is displayed below the slider

## Files Structure

- `manifest.json` - Extension configuration (Manifest V3)
- `content.js` - Main functionality script
- `styles.css` - UI styling for the brightness slider
- `README.md` - This documentation

## Technical Details

- Uses Manifest V3 for Chrome extensions
- Content script targets `https://meet.google.com/*`
- Applies CSS `filter: brightness()` to all `<video>` elements
- Uses MutationObserver to detect dynamically added video elements
- Slider specifications:
  - Min: 0.5 (50% brightness)
  - Max: 2.0 (200% brightness)
  - Step: 0.01
  - Default: 1.0 (100% brightness)

## Browser Compatibility

- Chrome (Manifest V3 compatible)
- Edge (Chromium-based)
- Other Chromium-based browsers

## License

This project is open source and available under the MIT License.
>>>>>>> c47e6a7662105cbc87e1a1bf7c73ee7acb14beb0
