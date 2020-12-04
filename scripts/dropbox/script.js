// 状態
const state = {
    timestamp: 0,
    enableTakeOver: false,
    text: ''
};

// マウスアップイベント: PDF
$(document).on('mouseup', '.pdf-viewer', async () => {
    if (chrome.app === undefined) return;
    if (chrome.app.isInstalled === undefined) return;
    await new Promise(resolve => setTimeout(resolve, 1));
    // 選択中のテキストを取得する
    let text = window.getSelection().toString();
    if (text === '') return;
    if (state.enableTakeOver) text = state.text + ' ' + text;
    // テキストを分割する
    text = formatText(text);
    if (state.enableTakeOver) state.text = text;
    const texts = splitText(text);
    // テキストの数が上限以上の場合 -> キャンセル
    if (texts.length > 40) return alert('Too many sentences.');
    // タイムスタンプを記録する
    const timestamp = Date.now();
    state.timestamp = timestamp;
    // テンプレートを表示する
    const container = $('.sc-comment-stream-threads');
    $(container).empty();
    texts.forEach((text) => {
        const item = $('<li>', { class: 'trans-item' });
        $('<p>', { class: 'trans-source', text: text }).appendTo(item);
        $('<p>', { class: 'trans-target', text: '' }).appendTo(item);
        $(item).appendTo(container);
    });
    $(container).scrollTop(0);
    // コールバック
    const callback = (responses) => {
        // チェック
        if (timestamp !== state.timestamp) return;
        // 各結果を表示する
        responses.forEach((response, i) => {
            if (response === null) return;
            const { source, target } = response;
            const item = $('.trans-item')[i];
            $(item).find('.trans-source').text(source);
            $(item).find('.trans-target').text(target);
        });
    };
    // 各テキストをGoogle翻訳する
    translateTexts(texts, 'GOOGLE_TRANSLATE', callback);
    // 各テキストをDeepL翻訳する
    translateTexts(texts, 'DEEPL_TRANSLATE', callback);
});

// キーダウンイベント
$(document).on('keydown', (e) => {
    // フォーカスされている場合 -> キャンセル
    if ($(':focus').length > 0) return;
    // Enterキー
    if (e.keyCode === 13) {
        // テキストの引き継ぎを無効化する
        if (state.enableTakeOver) {
            state.enableTakeOver = false;
            $('.label').remove();
        }
        // テキストの引き継ぎを有効化する
        else {
            state.enableTakeOver = true;
            const message = 'Enable translation by taking over text.';
            const element = $('<p>', { class: 'label', text: message });
            $('.sc-comment-editor-coach-mark-container').append(element);
        }
        state.text = '';
    }
});
