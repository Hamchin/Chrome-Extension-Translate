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
    return text;
};

// テキストを分割する
const splitText = (text) => {
    text = text.replace(/(?<!\w\.\w\.)(?<![A-Z]\.)(?<![A-Z]\w\.)(?<![A-Z]\w\w\.)(?<![A-Z]\w\w\w\.)(?<=\.|\?|\!)\s+(?=[A-Z])/g, '\n');
    return (text === '') ? [] : text.split('\n');
};

// 複数のテキストを翻訳する
const translateTexts = async (texts, type, callback) => {
    const promises = texts.map(async (text) => {
        return await new Promise((resolve) => {
            const message = { type: type, data: { text } };
            chrome.runtime.sendMessage(message, data => resolve(data));
        });
    });
    const responses = await Promise.all(promises);
    callback(responses);
};
