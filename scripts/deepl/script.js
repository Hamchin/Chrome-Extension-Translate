// キーダウンイベント
$(document).on('keydown', (e) => {
    // Escキー -> フォーカス解除
    if (e.keyCode === 27) {
        $(':focus').blur();
        return true;
    }
    // フォーカスされている場合 -> キャンセル
    if ($(':focus').length > 0) {
        return true;
    }
    // Enterキー -> テキストエリアへフォーカス
    if (e.keyCode === 13) {
        const source = $('.lmt__source_textarea');
        // Shift + Enter -> テキスト整形
        if (e.shiftKey) {
            const text = $(source).val();
            const sentences = splitText(formatText(text));
            $(source).val(sentences.join('\n\n'));
        }
        $(source).focus();
        return false;
    }
    return true;
});

// クリックイベント: コピーボタン
$(document).on('click', '.lmt__target_toolbar__copy', () => {
    // テキストエリアへフォーカス
    $('.lmt__source_textarea').focus();
});
