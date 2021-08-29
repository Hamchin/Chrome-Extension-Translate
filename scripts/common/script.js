// 閉じるボタンのHTML
const CLOSE_BUTTON_HTML = '<svg viewBox="0 0 512 512" class="ext-close-btn"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"></path></svg>';

// 状態
const state = {
    lastCopyTime: 0,
    lastText: ''
};

// テキストを整形する
const formatText = (text) => {
    // 両端の空白を削除する
    text = text.trim();
    // 単語の分裂を修正する
    text = text.replace(/-\s+/g, '');
    // 空白文字を単一の空白へ置換する
    text = text.replace(/\s+/g, ' ');
    // 小数点前後の空白を削除する
    text = text.replace(/(?<=\d)\s*\.\s*(?=\d)/g, '.');
    // ピリオド間の空白を削除する
    text = text.replace(/(?<=\.)\s+(?=\.)/g, '');
    // コンマ前の空白を削除する
    text = text.replace(/\s+(?=,)/g, '');
    // 文ごとに改行を挿入する
    return text.replace(/(?<!\w\.\w\.)(?<![A-Z]\.)(?<![A-Z]\w\.)(?<![A-Z]\w\w\.)(?<![A-Z]\w\w\w\.)(?<=\.|\?|\!)\s+(?=[A-Z])/g, '\n');
};

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
    $(modal).find('.ext-close-btn').on('click', () => {
        $(modal).remove();
        state.lastText = '';
    });
    return $(modal).get(0);
};

// 翻訳リクエストを送信する
const sendRequest = (type, text) => {
    return new Promise((resolve) => {
        const message = { type, text };
        chrome.runtime.sendMessage(message, data => resolve(data));
    });
};

// テキストを翻訳する
const translate = (text) => {
    if (chrome.app?.isInstalled === undefined) {
        alert('翻訳機能を利用するにはブラウザをリロードする必要があります。');
        return;
    }
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
            const response = await sendRequest(type, text);
            if ($(item).find('.ext-trans-load').length === 0) return;
            setResult(response) && setScroll();
        })('GOOGLE_TRANSLATE');
        // テキストをDeepL翻訳する
        (async (type) => {
            const response = await sendRequest(type, text);
            setResult(response) && setScroll();
            $(item).find('.ext-trans-load').remove();
        })('DEEPL_TRANSLATE');
    });
};

// メッセージイベント
window.addEventListener('message', (event) => {
    // データが存在しない場合 -> キャンセル
    if (!event.data) return;
    // テキストを翻訳する
    if (event.data.type === 'TRANSLATE') {
        translate(event.data.text);
    }
});

// コピーイベント: ドキュメント
document.addEventListener('copy', () => {
    // 1回目の場合 -> コピーした時間を記録する
    const thisCopyTime = performance.now();
    if (thisCopyTime - state.lastCopyTime > 500) {
        state.lastCopyTime = thisCopyTime;
        return;
    }
    // 選択中のテキストを取得する
    let text = window.getSelection().toString();
    // Googleドライブの場合 -> テキストを整形する
    if (location.hostname === 'drive.google.com') {
        text = formatText(text);
    }
    // テキストが前回と同じ場合 -> キャンセル
    if (text === state.lastText) return;
    // テキストを翻訳する
    parent.postMessage({ type: 'TRANSLATE', text }, '*');
    state.lastCopyTime = 0;
    state.lastText = text;
});
