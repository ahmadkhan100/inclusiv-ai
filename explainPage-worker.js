const response = 'This page is a basic page with no special features.';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.action === 'explainPage') {
        const user_input = message?.user_input;
        chrome.tabs.captureVisibleTab().then((screenshotDataUrl) => {
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + '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'
                },
                body: JSON.stringify({
                  "model": "gpt-4-vision-preview",
                  "max_tokens": 2000,
                  "messages": [
                    {
                        "role": "user",
                        "content": [
                          {"type": "text", "text": `You are a web accessibility partner. Based on the screenshot of the website, describe what is on this website for someone who's vision impaired, and how they can navigate it and what they can do with it. Consider the user's request from you: ${user_input}. If the user's input has a specific question based on the site, be sure to first answer that and accomodate the request. In general, be succint with your language, but explain things in depth and comprehensively so they can fully understand the website. Explain the name of the site, the purpose, how to use it, and more. Imagine you are describing it to a blind person. Speak with conviction, even if you are unsure. Do not use words such as "seems" or "appears" or "likely" and so on. Speak with authority and clarity, even if it's not genuine. Aim to keep the entire thing around 3-4 sentences. Speak in second person tone, directly to the user. At the end, be friendly and maybe ask if they have any more questions.`},
                          {
                            "type": "image_url",
                            "image_url": {
                              "url": screenshotDataUrl,
                            },
                          },
                        ],
                      }
                  ]
                })
              })
              .then(response => response.json())
              .then(data => {    
                var response = data.choices[0].message.content;

                sendResponse({
                    text: response,
                })

            })


            
        });
    } else {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var activeTab = tabs[0];
    chrome.scripting
      .executeScript({
        target : {tabId : activeTab.id},
        files : [`scripts/${message.action}.js`],
      })
      .then(() => console.log("injected a function"));
  });

  }
    return true;
  });



