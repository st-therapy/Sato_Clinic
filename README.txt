佐藤医院 静的Webサイト（HTML/CSS + 予約入力デモ用JavaScript）

index.htmlをブラウザで開くとトップページを表示できます。
下層ページ: news.html / services.html / about.html / hours.html / faq.html / reservation.html
スタイル: css/style.css
画像: img/（ご指定のimg.zipの画像を使用。各HTMLから ./img/ で参照）

Google Fontsを読み込むため、Noto Sans JP / Noto Serif JPの正しい表示にはインターネット接続が必要です。
PC表示は1440px幅のPDFデザインを基準とし、画面幅に合わせてレイアウトを調整します。
480px以下はスマートフォン用表示です。写真と文章は写真→文章の順に縦に配置します。
確認時は全7ページを320px・375px・480px・768px・1440px幅で開き、横スクロールや文字の欠けがないか確認してください。
元のデザインと同じ架空の電話番号・所在地等を表示しています。

ネット予約（reservation.html）は学習用の入力画面です。実際の個人情報は入力しないでください。
js/reservation.jsで入力例・項目別エラー・入力形式のチェック・消去のみを行います。
送信ボタン、予約完了画面、通信処理、入力内容の保存処理はありません。
住所は任意です。希望日は日本時間の今日以降（木曜・日曜を除く）、生年月日は今日以前でチェックします。
