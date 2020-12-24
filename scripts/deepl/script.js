// キーダウンイベント: ドキュメント
$(document).on('keydown', (e) => {
    const source = document.querySelector('.lmt__source_textarea');
    return translator.handleKeyDown(e, source);
});

// クリックイベント: コピーボタン -> テキストエリアへフォーカスする
$(document).on('click', '.lmt__target_toolbar__copy', () => {
    $('.lmt__source_textarea').focus();
});
