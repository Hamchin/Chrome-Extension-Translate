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
        const url = new URL('https://api-free.deepl.com/v2/translate');
        url.search = new URLSearchParams({
            auth_key: DEEPL_AUTH_KEY,
            text: message.data.text,
            target_lang: 'JA'
        });
        fetch(url.toString())
            .then(response => response.ok ? response.json() : null)
            .then(data => {
                const source = message.data.text;
                const target = data?.translations?.[0]?.text;
                sendResponse(target ? { source, target } : null);
            });
        return true;
        // const url = new URL(DEEPL_TRANSLATE_API_URL);
        // url.search = new URLSearchParams(message.data);
        // fetch(url.toString())
        //     .then(response => response.ok ? response.json() : null)
        //     .then(data => sendResponse(data));
        // return true;
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
