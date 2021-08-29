// キーダウンイベント: ドキュメント
$(document).on('keydown', (event) => {
    // エスケープキーの場合 -> フォーカスを解除する
    if (event.key === 'Escape') {
        $(':focus').blur();
        return true;
    }
    // フォーカスされている場合 -> キャンセル
    if ($(':focus').length > 0) {
        return true;
    }
    // エンターキーの場合 -> テキストエリアへフォーカスする
    if (event.key === 'Enter') {
        $('textarea').focus();
        return false;
    }
    return true;
});

// クリックイベント: コピーボタン -> テキストエリアへフォーカスする
$(document).on('click', 'button[aria-label="翻訳をコピー"]', () => {
    $('textarea').focus();
});
