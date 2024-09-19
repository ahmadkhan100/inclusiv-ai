{
minWordLength = 4,     // Minimum word length
minTextLength = 20,    // Minimum text length
boldRatio     = 0.4,   // Bold ratio (percentage of letters per word)
doAdhd = true;
const insertTextBefore = (text, node, bold) => {
    if (bold) {
        let span = document.createElement('span');
        span.className = 'bread';
        span.appendChild(document.createTextNode(text));

        node.parentNode.insertBefore(span, node);
    } else {
        node.parentNode.insertBefore(document.createTextNode(text), node);
    }
}
const processNode = root => {
    let walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
            return (
                node.parentNode.nodeName !== 'INPUT' &&
                node.parentNode.nodeName !== 'NOSCRIPT' &&
                node.parentNode.nodeName !== 'SCRIPT' &&
                node.parentNode.nodeName !== 'STYLE' &&
                node.parentNode.nodeName !== 'TEXTAREA' &&
                node.parentNode.nodeName !== 'TITLE' &&
             (node.parentNode.nodeName === 'A' ||
                node.parentNode.nodeName === 'EM' ||
                node.parentNode.nodeName === 'STRONG' ||
                node.nodeValue.length  >= minTextLength)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    let node;
    while (node = walker.nextNode()) {
        let text = node.nodeValue;
        let wStart = -1, wLen = 0, eng = null;

        for (let i = 0; i <= text.length; i++) {   // We use <= here because we want to include the last character in the loop
            let cEng = i < text.length ? /[\p{Letter}\p{Mark}]/u.test(text[i]) : false;

            if (i == text.length || eng !== cEng) {
                // State flipped or end of string
                if (eng && wLen >= minWordLength) {
                    let word = text.substring(wStart, wStart + wLen);
                    let numBold = Math.ceil(word.length * boldRatio);
                    let bt = word.substring(0, numBold), nt = word.substring(numBold);
                    insertTextBefore(bt, node, true);
                    insertTextBefore(nt, node, false);
                } else if (wLen > 0) {
                    let word = text.substring(wStart, wStart + wLen);
                    insertTextBefore(word, node, false);
                }
                wStart = i;
                wLen = 1;
                eng = cEng;
            } else {
                wLen++;
            }
        }

        node.nodeValue = '';    // Can't remove the node (otherwise the tree walker will break) so just set it to empty
    }
};

document.head.appendChild(document.createElement('style')).textContent = `
    span.bread {
        display: contents !important;
        font-weight: bold !important;
    }
`;

if (doAdhd){
let breadNode = 'body'
let node = document.querySelector(breadNode);
processNode(node);
}
}
