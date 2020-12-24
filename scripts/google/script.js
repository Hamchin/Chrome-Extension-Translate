// キーダウンイベント: ドキュメント
$(document).on('keydown', (e) => {
    const source = document.querySelector('textarea');
    return translator.handleKeyDown(e, source);
});
