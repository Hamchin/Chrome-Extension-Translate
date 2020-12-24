// 状態
const state = {
    enableTakeOver: false,
    text: ''
};

// マウスアップイベント: PDF
$(document).on('mouseup', '.pdf-viewer', async () => {
    await new Promise(resolve => setTimeout(resolve, 1));
    // 選択中のテキストを取得する
    const selectedText = window.getSelection().toString();
    if (selectedText.trim() === '') return;
    const mergedText = state.text + ' ' + selectedText;
    // テキストを整形および分割する
    const formattedText = translator.formatText(mergedText);
    if (state.enableTakeOver) state.text = formattedText;
    const texts = translator.splitText(formattedText);
    // テキストの数が上限以上の場合 -> キャンセル
    if (texts.length > 40) return alert('Too many sentences.');
    // スレッドを初期化する
    const threads = $('.sc-comment-stream-threads');
    $(threads).empty();
    // 各テキストを翻訳する
    texts.forEach((text) => {
        // テンプレートを生成する
        const item = $('<li>', { class: 'trans-item' });
        const source = $('<p>', { class: 'trans-text', text: text });
        const target = $('<p>', { class: 'trans-text', text: '' });
        $(item).append(source);
        $(item).append(target);
        $(item).appendTo(threads);
        // 翻訳結果を反映する
        const setResult = async (text, type) => {
            const response = await translator.translateText(text, type);
            if (response === null) return;
            $(source).text(response.source);
            $(target).text(response.target);
        };
        // テキストをGoogle翻訳する
        setResult(text, 'GOOGLE_TRANSLATE');
        // テキストをDeepL翻訳する
        setResult(text, 'DEEPL_TRANSLATE');
    });
});

// キーダウンイベント: ドキュメント
$(document).on('keydown', (e) => {
    // フォーカスされている場合 -> キャンセル
    if ($(':focus').length > 0) return;
    // エンターキーの場合 -> テキストの引き継ぎ設定を切り替える
    if (e.key === 'Enter') {
        state.enableTakeOver = !state.enableTakeOver;
        const container = $('.sc-comment-editor-coach-mark-container');
        // 有効の場合
        if (state.enableTakeOver) {
            const message = 'Enable translation by taking over text.';
            const label = $('<p>', { class: 'label', text: message });
            $(container).append(label);
        }
        // 無効の場合
        else {
            state.text = '';
            $(container).find('.label').remove();
        }
    }
});
