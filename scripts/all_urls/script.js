// 閉じるボタンのHTML
const CLOSE_BUTTON_HTML = '<svg viewBox="0 0 512 512" class="ext-close-btn"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"></path></svg>';

// 翻訳モーダルを設置する
const setTransModal = () => {
    const initialState = { maxWidth: '', maxHeight: '' };
    const modal = $('<div>', { class: 'ext-trans-modal' });
    const container = $('<div>', { class: 'ext-trans-container' });
    $(modal).append(container);
    $(modal).draggable({
        containment: 'window',
        cancel: '.ext-trans-text',
        scroll: false
    });
    $(modal).resizable({
        handles: 'all',
        minWidth: 105,
        minHeight: 105,
        start: (e, ui) => $(modal).css({ ...ui.size, ...initialState })
    });
    $(modal).css({ maxWidth: '80vw', maxHeight: '80vh' });
    $(modal).append(CLOSE_BUTTON_HTML);
    $(modal).appendTo('body');
    return $(modal).get(0);
};

// キーアップイベント: ドキュメント
$(document).on('keyup', (e) => {
    // フォーカスしている場合 -> キャンセル
    if ($(':focus').length > 0) return;
    // エンターキー以外の場合 -> キャンセル
    if (e.key !== 'Enter') return;
    // テキストを取得および分割する
    const text = window.getSelection().toString();
    const texts = text.split('\n').map(s => s.trim()).filter(s => s);
    // メッセージを送信する
    if (texts.length === 0) return;
    parent.postMessage({ type: 'TRANSLATE', texts: texts }, '*');
});

// メッセージイベント -> テキストを翻訳する
window.addEventListener('message', (event) => {
    if (event.data === null) return;
    const { type, texts } = event.data;
    if (type !== 'TRANSLATE') return;
    // 翻訳モーダルを取得または生成する
    const modal = document.querySelector('.ext-trans-modal') || setTransModal();
    const container = modal.querySelector('.ext-trans-container');
    // 各テキストを翻訳する
    const scrollTop = { firstItem: 0, lastTime: 0 };
    texts.forEach((text, index) => {
        // テンプレートを生成する
        const item = $('<div>', { class: 'ext-trans-item' });
        const source = $('<p>', { class: 'ext-trans-text', text: text });
        const target = $('<p>', { class: 'ext-trans-text', text: '...' });
        const load = $('<div>', { class: 'ext-trans-load' });
        const line = $('<hr>');
        $(item).append(source).append(line).append(target).append(load);
        $(item).appendTo(container);
        // 最初のアイテムにスクロールを合わせる
        if (index === 0) scrollTop.firstItem = container.scrollTop + $(item).position().top;
        container.scrollTop = scrollTop.firstItem;
        scrollTop.lastTime = container.scrollTop;
        // 翻訳結果を反映する
        const setResult = (response) => {
            if (response === null) return false;
            $(source).text(response.source);
            $(target).text(response.target);
            return true;
        };
        // 最初のアイテムにスクロールを合わせる
        const setScroll = () => {
            if (container.scrollTop !== scrollTop.lastTime) return false;
            container.scrollTop = scrollTop.firstItem;
            scrollTop.lastTime = container.scrollTop;
            return true;
        };
        // テキストをGoogle翻訳する
        (async (type) => {
            const response = await translator.translateText(text, type);
            if ($(item).find('.ext-trans-load').length === 0) return;
            setResult(response) && setScroll();
        })('GOOGLE_TRANSLATE');
        // テキストをDeepL翻訳する
        (async (type) => {
            const response = await translator.translateText(text, type);
            setResult(response) && setScroll();
            $(item).find('.ext-trans-load').remove();
        })('DEEPL_TRANSLATE');
    });
});

// クリックイベント: 閉じるボタン -> 翻訳モーダルを削除する
$(document).on('click', '.ext-close-btn', (e) => {
    $(e.currentTarget).closest('.ext-trans-modal').remove();
});
