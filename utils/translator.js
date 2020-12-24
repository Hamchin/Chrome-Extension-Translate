// オブジェクト: 翻訳
const translator = {};

// テキストを整形する
translator.formatText = function (text) {
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
    return text;
};

// テキストを分割する
translator.splitText = function (text) {
    text = text.replace(/(?<!\w\.\w\.)(?<![A-Z]\.)(?<![A-Z]\w\.)(?<![A-Z]\w\w\.)(?<![A-Z]\w\w\w\.)(?<=\.|\?|\!)\s+(?=[A-Z])/g, '\n');
    return text ? text.split('\n') : [];
};

// テキストを翻訳する
translator.translateText = function (text, type) {
    return new Promise((resolve) => {
        if (chrome.app?.isInstalled === undefined) resolve(null);
        const message = { type: type, data: { text } };
        chrome.runtime.sendMessage(message, data => resolve(data));
    });
};

// 翻訳ページにおけるキーダウン時の実行関数
translator.handleKeyDown = function (event, source) {
    // エスケープキーの場合 -> フォーカスを解除する
    if (event.key === 'Escape') {
        $(':focus').blur();
        return true;
    }
    // フォーカスされている場合 -> キャンセル
    if ($(':focus').length > 0) {
        return true;
    }
    // エンターキーの場合
    if (event.key === 'Enter') {
        // シフトキー付きの場合 -> テキストを整形する
        if (event.shiftKey) {
            const text = $(source).val();
            const formattedText = translator.formatText(text);
            const sentences = translator.splitText(formattedText);
            $(source).val(sentences.join('\n\n'));
        }
        // テキストエリアへフォーカスする
        $(source).focus();
        return false;
    }
    return true;
};
