{
var cssContentArray = [];

// Function to extract inline styles from HTML elements
function extractInlineStyles() {
  var inlineStyles = [];
  var elementsWithInlineStyles = document.querySelectorAll('[style]');
  elementsWithInlineStyles.forEach(function (element) {
    var inlineStyle = element.getAttribute('style');
    if (inlineStyle) {
      inlineStyles.push(inlineStyle);
    }
  });
  return inlineStyles.join('\n'); // Concatenate inline styles with newline separator
}
var stylesheets = document.styleSheets;
for (var i = 0; i < stylesheets.length; i++) {
  var rules;
  try {
    rules = stylesheets[i].cssRules || stylesheets[i].rules;
  } catch (e) {
    console.error('Access to stylesheet rules blocked by CORS policy:', e);
    continue;
  }
  var cssText = '';
  for (var j = 0; j < rules.length; j++) {
    cssText += rules[j].cssText + '\n';
  }
  cssContentArray.push(cssText);
}


// Extract inline styles
var inlineStyles = extractInlineStyles();
cssContentArray.push(inlineStyles);

console.log('fetching gpt')
// Concatenate all CSS content
var allCSSContent = cssContentArray.join('\n'); // Concatenate CSS content with newline separator
fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'authorization': 'Bearer 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'
  },
  body: JSON.stringify({
    "model": "gpt-4-turbo-preview",
    "messages": [
      {
        "role": "system",
        "content": "You are an expert at generating css code."
      },
      {
        "role": "user",
        "content": `Generate in depth and comprehensive css code to make the following code of a website be accessible to red-green colorblind people. Increase color contrast between red and green elements by adjusting their hues, saturation, or brightness. Replace red and green color combinations with alternative colors that are easier to distinguish, such as blue and yellow. Don't rewrite the entire css only generate as little new css as possible. Use things like !important! to ensure it overrides, and ensure that the css will work properly and update the visuals of the site. Respond only with css code and nothing else in this format: <style>CODE GOES HERE</style>. Current CSS: ${allCSSContent}`
      },
    ]
  })
})
  .then(response => response.json())
  .then(data => {
    console.log('gpt loaded')
    console.log(data);

    var cssCode = data.choices[0].message.content;
    var cssCodeCleaned = cssCode.replace('<style>', '').replace('</style>', '').replace('```html', '').replace('```css', '').replace('```', '').trim();
    var styleElement = document.createElement('style');
    styleElement.textContent = cssCodeCleaned;
    document.head.appendChild(styleElement);
  })
}

