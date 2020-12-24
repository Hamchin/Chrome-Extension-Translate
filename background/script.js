// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // テキストをGoogle翻訳する
    if (message.type === 'GOOGLE_TRANSLATE') {
        const url = new URL(GOOGLE_TRANSLATE_API_URL);
        url.search = new URLSearchParams(message.data);
        fetch(url.toString())
            .then(response => response.ok ? response.json() : null)
            .then(data => sendResponse(data));
        return true;
    }
    // テキストをDeepL翻訳する
    if (message.type === 'DEEPL_TRANSLATE') {
        const url = new URL(DEEPL_TRANSLATE_API_URL + '/translate');
        url.search = new URLSearchParams(message.data);
        fetch(url.toString())
            .then(response => response.ok ? response.json() : null)
            .then(data => sendResponse(data));
        return true;
    }
});

// コンテキストメニュー: 選択中のテキストをDeepL翻訳する
chrome.contextMenus.create({
    type: 'normal',
    id: 'DEEPL_TRANSLATE',
    title: 'DeepL翻訳',
    contexts: ['selection']
}, () => chrome.runtime.lastError);

// クリックイベント: コンテキストメニュー
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // 選択中のテキストをDeepL翻訳する
    if (info.menuItemId === 'DEEPL_TRANSLATE') {
        const text = encodeURIComponent(info.selectionText);
        const url = `https://www.deepl.com/translator#ja/en/${text}`;
        window.open(url);
    }
});
