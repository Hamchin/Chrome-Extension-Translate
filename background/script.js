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

// コンテキストメニュー
chrome.contextMenus.create({
    type: 'normal',
    id: 'TRANSLATE',
    title: '選択中のテキストを翻訳する',
    contexts: ['selection']
}, () => chrome.runtime.lastError);

// クリックイベント: コンテキストメニュー
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'TRANSLATE') {
        chrome.tabs.sendMessage(tab.id, 'TRANSLATE');
    }
});
