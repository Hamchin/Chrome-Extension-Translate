// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // テキストをGoogle翻訳する
    if (message.type === 'GOOGLE_TRANSLATE') {
        (async () => {
            const url = new URL(GOOGLE_TRANSLATE_API_URL);
            url.search = new URLSearchParams({ text: message.text });
            const response = await fetch(url.toString());
            const data = response.ok ? await response.json() : null;
            sendResponse(data);
        })();
    }
    // テキストをDeepL翻訳する
    if (message.type === 'DEEPL_TRANSLATE') {
        (async () => {
            // 公式APIを利用して翻訳結果を取得する
            let response = await (async () => {
                const url = new URL('https://api-free.deepl.com/v2/translate');
                url.search = new URLSearchParams({
                    auth_key: DEEPL_AUTH_KEY,
                    text: message.text,
                    target_lang: 'JA'
                });
                const response = await fetch(url.toString());
                const data = response.ok ? await response.json() : null;
                const source = message.text;
                const target = data?.translations?.[0]?.text;
                return target ? { source, target } : null;
            })();
            // 独自APIを利用して翻訳結果を取得する
            response = response || await (async () => {
                const url = new URL(DEEPL_TRANSLATE_API_URL);
                url.search = new URLSearchParams({ text: message.text });
                const response = await fetch(url.toString());
                return response.ok ? await response.json() : null;
            })();
            sendResponse(response);
        })();
    }
    return true;
});

// コンテキストメニュー
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
