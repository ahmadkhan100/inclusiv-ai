{
const cssRules = `

@font-face {
    font-family: 'OpenDyslexic3';
    src: url(${chrome.runtime.getURL('./assets/fonts/OpenDyslexic3-Bold.ttf')});
    font-weight: bold;
}

  
@font-face {
    font-family: 'OpenDyslexic3';
    src: url(${chrome.runtime.getURL('./assets/fonts/OpenDyslexic3-Regular.ttf')});
    font-weight: normal;
}

* {
    font-family: 'OpenDyslexic3', sans-serif !important;
}
`;

// Create a <style> element
const styleElement = document.createElement('style');

// Set the CSS content
styleElement.textContent = cssRules;
}

// Append the <style> element to the <head> of the document
document.head.appendChild(styleElement);

