// ロードイベント
$(document).ready(() => {
    // 翻訳ボタン
    const button = $('<button>', { class: 'ext-trans-btn ext-hidden' });
    const icon = $('<div>', { class: 'ext-trans-icon' });
    const iconUrl = chrome.extension.getURL('img/icon128.png');
    $(icon).css('background-image', `url(${iconUrl})`);
    $(icon).appendTo(button);
    $(button).appendTo('body');
    // 翻訳モーダル
    const modal = $('<div>', { class: 'ext-trans-modal ext-hidden' });
    $(modal).appendTo('body');
});

// マウスアップイベント
$(document).on('mouseup', async () => {
    await new Promise(resolve => setTimeout(resolve, 1));
    // 選択中のテキストを取得する
    const selection = window.getSelection();
    if (selection.toString().trim() === '') return;
    // 翻訳ボタンを設置する
    const button = $('.ext-trans-btn');
    const selectionRects = selection.getRangeAt(0).getClientRects();
    if (selectionRects.length === 0) return;
    const lastRect = selectionRects[selectionRects.length - 1];
    $(button).css('top', window.pageYOffset + lastRect.y + lastRect.height);
    $(button).css('left', window.pageXOffset + lastRect.x + lastRect.width);
    $(button).removeClass('ext-hidden');
});

// マウスダウンイベント
$(document).on('mousedown', (e) => {
    // 翻訳ボタンが存在する場合
    const button = $('.ext-trans-btn');
    if ($(button).hasClass('ext-hidden') === false) {
        // ボタンをクリックした場合 -> テキストを保持する
        if ($(e.target).closest(button).length > 0) {
            const text = window.getSelection().toString();
            $(button).data('text', text);
        }
        // ボタン外をクリックした場合 -> ボタンの非表示
        else {
            $(button).addClass('ext-hidden');
            $(button).data('text', '');
        }
    }
    // 翻訳モーダルが存在する場合
    const modal = $('.ext-trans-modal');
    if ($(modal).hasClass('ext-hidden') === false) {
        // モーダル外をクリックした場合 -> モーダルの非表示
        if ($(e.target).closest(modal).length === 0) {
            $(modal).addClass('ext-hidden');
            $(modal).empty();
        }
    }
});

// クリックイベント: 翻訳ボタン
$(document).on('click', '.ext-trans-btn', () => {
    if (chrome.app === undefined) return;
    if (chrome.app.isInstalled === undefined) return;
    // 翻訳ボタン
    const button = $('.ext-trans-btn');
    setTimeout(() => $(button).addClass('ext-hidden'), 1);
    // タイムスタンプを記録する
    const modal = $('.ext-trans-modal');
    const timestamp = Date.now();
    $(modal).data('timestamp', timestamp);
    // テキストを分割する
    const text = $(button).data('text') || '';
    const texts = text.split('\n').map(s => s.trim()).filter(s => s !== '');
    // テンプレートを表示する
    $(modal).empty();
    $(modal).removeClass('ext-hidden');
    texts.forEach((text) => {
        const item = $('<div>', { class: 'ext-trans-item' });
        $('<div>', { class: 'ext-load' }).appendTo(item);
        $('<p>', { class: 'ext-trans-source', text: text }).appendTo(item);
        $('<p>', { class: 'ext-trans-target', text: '' }).appendTo(item);
        $(item).appendTo(modal);
    });
    $(modal).scrollTop(0);
    // コールバック
    const callback = (responses) => {
        // チェック
        if ($(modal).hasClass('ext-hidden')) return;
        if (timestamp !== $(modal).data('timestamp')) return;
        // 各結果を表示する
        responses.forEach((response, i) => {
            if (response === null) return;
            const { source, target } = response;
            const item = $('.ext-trans-item')[i];
            $(item).find('.ext-trans-source').text(source);
            $(item).find('.ext-trans-target').text(target);
        });
    };
    // 各テキストをGoogle翻訳する
    translateTexts(texts, 'GOOGLE_TRANSLATE', callback);
    // 各テキストをDeepL翻訳する
    translateTexts(texts, 'DEEPL_TRANSLATE', (responses) => {
        callback(responses);
        $('.ext-trans-item').find('.ext-load').remove();
    });
});
