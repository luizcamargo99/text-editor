$(document).on('paste', '[contenteditable]', function (e) {
    e.preventDefault();

    if (window.clipboardData) {
        content = window.clipboardData.getData('Text');        
        if (window.getSelection) {
            const selObj = window.getSelection();
            const selRange = selObj.getRangeAt(0);
            selRange.deleteContents();                
            selRange.insertNode(document.createTextNode(content));
        }
    } else if (e.originalEvent.clipboardData) {
        content = (e.originalEvent || e).clipboardData.getData('text/plain');
        document.execCommand('insertText', false, content);
    }        
});