// キーイベント: 言語選択
$(document).on('keydown', '.tl-wrap', (e) => {
    // 左キー -> フォーカスの逆移動
    if (e.keyCode === 37) {
        $(':focus').prev().focus();
    }
    // 右キー -> フォーカスの移動
    if (e.keyCode === 39) {
        $(':focus').next().focus();
    }
});

// キーイベント: 全体
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
    const btnList = $('.tl-wrap').find('.jfk-button');
    // 左キー -> 言語選択(左)へフォーカス
    if (e.keyCode === 37) {
        $(btnList)[0].focus();
        return true;
    }
    // 右キー -> 言語選択(右)へフォーカス
    if (e.keyCode === 39) {
        $(btnList)[1].focus();
        return true;
    }
    // Enterキー -> テキストエリアへフォーカス
    if (e.keyCode === 13) {
        const source = $('#source');
        // Shift + Enter -> テキスト整形
        if (e.shiftKey) {
            const text = $(source).val();
            const sentences = splitText(formatText(text));
            $(source).val(sentences.join('\n\n'));
        }
        $(source).focus();
        return false;
    }
});
