// キーダウンイベント: ドキュメント
$(document).on('keydown', (event) => {
    const source = document.querySelector('.lmt__source_textarea');
    return translator.handleKeyDown(event, source);
});

// クリックイベント: コピーボタン -> テキストエリアへフォーカスする
$(document).on('click', '.lmt__target_toolbar__copy', () => {
    $('.lmt__source_textarea').focus();
});
