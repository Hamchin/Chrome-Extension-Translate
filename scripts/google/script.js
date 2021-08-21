// キーダウンイベント: ドキュメント
$(document).on('keydown', (event) => {
    const source = document.querySelector('textarea');
    return translator.handleKeyDown(event, source);
});
