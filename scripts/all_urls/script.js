// 閉じるボタンのHTML
const CLOSE_BUTTON_HTML = '<svg viewBox="0 0 512 512" class="ext-close-btn"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"></path></svg>';

// 翻訳モーダルを設置する
const setTransModal = () => {
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
        start: (e, ui) => $(modal).css({ ...ui.size, maxWidth: '', maxHeight: '' })
    });
    $(modal).css({ maxWidth: '80vw', maxHeight: '80vh' });
    $(modal).append(CLOSE_BUTTON_HTML);
    $(modal).appendTo('body');
    $(modal).find('.ext-close-btn').on('click', () => $(modal).remove());
    return $(modal).get(0);
};

// テキストを翻訳する
const translate = (text) => {
    // テキストを分割する
    const texts = text.split('\n').map(s => s.trim()).filter(s => s);
    if (texts.length === 0) return;
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
            const response = await translator.translateText(type, text);
            if ($(item).find('.ext-trans-load').length === 0) return;
            setResult(response) && setScroll();
        })('GOOGLE_TRANSLATE');
        // テキストをDeepL翻訳する
        (async (type) => {
            const response = await translator.translateText(type, text);
            setResult(response) && setScroll();
            $(item).find('.ext-trans-load').remove();
        })('DEEPL_TRANSLATE');
    });
};

// メッセージイベント
window.addEventListener('message', (event) => {
    // データが存在しない場合 -> キャンセル
    if (event.data === null) return;
    // テキストを翻訳する
    if (event.data.type === 'TRANSLATE') {
        translate(event.data.text);
    }
});

// 直近にコピーした時間
let lastCopyTime = null;

// キーダウンイベント: ドキュメント
document.addEventListener('keydown', (event) => {
    // コマンドによるコピーの場合
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && event.repeat === false) {
        const thisCopyTime = performance.now();
        // コピーが連続して行われなかった場合 -> コピーした時間を記録する
        if (lastCopyTime === null || thisCopyTime - lastCopyTime > 500) {
            lastCopyTime = thisCopyTime;
            return;
        }
        // コピーが連続して行われた場合 -> 選択中のテキストを翻訳する
        const text = window.getSelection().toString();
        parent.postMessage({ type: 'TRANSLATE', text }, '*');
        lastCopyTime = null;
    }
});
