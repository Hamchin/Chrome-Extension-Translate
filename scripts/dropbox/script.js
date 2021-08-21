// マウスアップイベント: PDF
$(document).on('mouseup', '.pdf-viewer', async () => {
    await new Promise(resolve => setTimeout(resolve, 1));
    // スレッドを取得する
    const threads = $('.sc-comment-stream-threads');
    if ($(threads).length === 0) return;
    // 選択中のテキストを取得する
    const selectedText = window.getSelection().toString().trim();
    if (selectedText === '') return;
    // 引き継ぎが有効の場合 -> テキストを連結する
    const label = $('.sc-comment-stream .trans-concat-enabled');
    const mergedText = (
        $(label).length > 0 ?
        $(label).data('text') + ' ' + selectedText : selectedText
    );
    // テキストを整形および分割する
    const formattedText = translator.formatText(mergedText);
    const texts = translator.splitText(formattedText);
    if ($(label).length > 0) $(label).data('text', formattedText);
    // テキストの数が上限以上の場合 -> キャンセル
    if (texts.length > 40) return alert('Too many sentences.');
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
    // エンターキーの場合 -> 翻訳モードを切り替える
    if (e.key === 'Enter') {
        const container = $('.sc-comment-editor-coach-mark-container');
        if ($(container).length === 0) return;
        const label = $(container).find('.trans-concat-enabled');
        // ラベルが存在しない場合 -> 引き継ぎを有効にする
        if ($(label).length === 0) {
            const message = 'Translate by concatenating previous text.';
            const label = $('<p>', { class: 'trans-concat-enabled', text: message });
            $(label).data('text', '');
            $(label).appendTo(container);
        }
        // ラベルが存在する場合 -> 引き継ぎを無効にする
        else {
            $(label).remove();
        }
    }
});
