const playAudio = (url) => {
  loader.style.display = 'none'; // stop loading
  audioElement.src = url
  audioElement.play()
}

const executeUserRequest = (req, user_input) => {
  chrome.runtime.sendMessage({ action: req, user_input: user_input }, response => {
      const text = response?.text;
      text && textToSpeech(text);
    })
}

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
const recordButton = document.getElementById('recordButton');
const micIcon = recordButton.querySelector('.mic-icon');
const micShadow = recordButton.querySelector('.mic-shadow');
const audioElement = document.getElementById('audio');
const loader = recordButton.querySelector('.loader');

recordButton.addEventListener('click', () => {
  if (!isRecording) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          
          document.querySelector('.loader').style.display = 'block';

          loader.style.display = 'block';

          const form = new FormData();
          form.append('file', audioBlob, 'audio.wav');
          form.append('do_sample', 'true');
          form.append('repetition_penalty', '0.9');
          form.append('temperature', '0.9');
          form.append('top_k', '50');
          form.append('top_p', '0.9');

          const options = {
            method: 'POST',
            headers: {
              accept: 'application/json',
              authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjE4ZGIzN2I0MmU5ZTU4OTllNzI1OWM4NzZhZWUwZjAzIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDItMTdUMDg6MTk6MjAuMzg3NzExIn0.XMGqFSpcgakTSAD2TSnSdnWdO15jQhMwErctkp8PUTo'
            },
            body: form
          };

          // First request to MonsterAPI for speech to text conversion
          fetch('https://api.monsterapi.ai/v1/generate/speech2text-v2', options)
            .then(response => response.json())
            .then(data => {
              const processId = data.process_id;
              console.log('Initial request success data:', data);

              // Function to repeatedly check the status of the transcription
              const checkStatus = () => {
                const options2 = {
                  method: 'GET',
                  headers: {
                    accept: 'application/json',
                    authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjE4ZGIzN2I0MmU5ZTU4OTllNzI1OWM4NzZhZWUwZjAzIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDItMTdUMDg6MTk6MjAuMzg3NzExIn0.XMGqFSpcgakTSAD2TSnSdnWdO15jQhMwErctkp8PUTo'
                  }
                };
                fetch(`https://api.monsterapi.ai/v1/status/${processId}`, options2)
                  .then(response => response.json())
                  .then(response => {
                    console.log("Process ID:", response.process_id);
                    console.log("Status:", response.status);

                    if (response.status === "COMPLETED" || response.status === "FAILED") {
                      clearInterval(statusInterval); // Stop checking
                      if (response.status === "COMPLETED") {
                        console.log("Transcription Completed:", response.result);
                        const user_input = response.result.text
                        const jsonString = `
                          {
                            "user_requests": ["adhd", "dyslexia", "colorblind", "explainPage", "magnifyPage", "unMagnifyPage", "reportIssue"],
                            "assistant_response": "A friendly and brief response to the user in second person tone acknowledging what changes you are making to the website based on the user's accessibility needs. Keep in mind you are a friendly accessibility assistant, so this is your response to the user to keep them informed. For instance, if they mentioned something beyond the scope of your capabilities that you can't do, inform them. Speak in singular second person tone. You don't need to greet the person here because this is a continuation of the conversation. Also if they haven't mentioned any disabilities or only one or two, you should ask them if they have any of those other disabilities. Because the user doesn't know what you can do unless you tell them. But also don't say too much try to keep it conversational and encourage questions to keep the user engaged because remember that after this response you will go back and forth again this isn't your final interaction. If the user has requested a command, say something similar to like stand by, I am implementing that right now. Only for if the user activates the explainPage command, make your response in this section brief and quick because the explainPage command will also activate speaking and then you will interupt each other. ", 
                          }`;
                        const promptText = `You are an AI web accessibility assistant and you are tasked with interpreting the user’s most recent statement to you. The user most likely either gave you a brief description of any accessibility needs they may have, and you must take note of that and let them know that you are now changing websites to accomodate that disability. And/or, the user will be asking for a command for you to do a specific action on the current website, and you must also take note of this. Then, you will be generating a JSON object which encodes all this information. Here is what the user said, and you must strictly adhere to this in order to determine which values to give for the JSON fields: "${user_input}”. 
                        If the user didn't clearly mention any of the fields, don't fill them in.
                        If none of the potential values in the JSON are mentioned, then don’t fill in anything. Similarly, if only one or two is mentioned, then only include those, not all. Then you must generate a response to the user explaining what you did and be friendly and asking them any followup questions if you have them. For context, here is some description on what the tools will do for each disability. For dyslexia, you will make the text all websites render in a dyslexia friendly font. For adhd, you will highlight/bold text and paragraphs according to the bionic reading method which will make it significantly easier to stay focused and engaged. For colorblindness, you will change the contrast and colors on websites to make things more visually perceivable for the user. 
                        In terms of commands, magnifyPage and unMagnifyPage are obvious. explainPage however will use AI to fully explain the current part of the site to the user and how the user can interact with it and such. ReportIssue allows the user to raise an accessibility complaint with the owners of the site so that the site owners can comprehensively address it. Also, if the user has a specific question about the current website, activate the explainPage command, which will be able to answer specific questions about the site. And make sure all commands/user_info is written down precisely as it is here.
                        The other commands are also explanatory if the user mentions those disabilities then pick them. Otherwise, absolutely do not infer anything not mentioned by the user, and also do not mention in your responses any capabilities that I haven't discussed, as you won't be able to do them. And if the user does request a command, in your response tell them that you will carry out the command shortly. Be logical, think through your ideas, and output in the following JSON format only: \`\`\`${jsonString}\`\`\``;

                        const options = {
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
                                "content": "You are an extremely helpful and capable AI web accessibility assistant."
                              },
                              {
                                "role": "user",
                                "content": promptText
                              },
                            ]
                          })
                        }
                        fetch('https://api.openai.com/v1/chat/completions', options)
                          .then(response => response.json())
                          .then(data => {
                            const response = data.choices[0].message.content;
                            const cleanedJson = JSON.parse(response.replace('```json', '').replace('```', '').trim())
                            console.log('loaded gpt response', cleanedJson);
                            const {assistant_response, user_requests} = cleanedJson;
                            textToSpeech(assistant_response);
                            user_requests.forEach(req => {
                              executeUserRequest(req, user_input);
                            }); 
                            
                          }).catch(error =>  { console.error('Error during initial transcription request:', error); });
                      }  
                    }
                  })
                  .catch(error => {
                    console.error('Error during status check:', error);
                    clearInterval(statusInterval); // Stop checking on error
                    loader.style.display = 'none';
                  });
              };
              
              // Start checking the status every 500 milliseconds
              const statusInterval = setInterval(checkStatus, 2000);
            
            })
            .catch(error => {
              console.error('Error during initial transcription request:', error);
              loader.style.display = 'none'; 
            });

          // audioElement.play();
          micIcon.src = 'images/mic-23.png'; // Change back to mic icon
          recordButton.classList.add('no-animation');
          recordButton.classList.remove('recording'); // Stop the animation
          micShadow.style.display = 'none'; // Hide the shadow
          isRecording = false;

        };

        mediaRecorder.start();
        micIcon.src = 'images/stop-button.png'; // Change to stop icon
        recordButton.classList.remove('no-animation');
        recordButton.classList.add('recording'); // Start the animation
        micShadow.style.display = 'block'; // Show the shadow

        isRecording = true;
      })
      .catch(error => {
        console.error('Error accessing the microphone:', error);
      });
  } else {
    // Stop the recording
    mediaRecorder.stop();
  }
});


const textToSpeechMonster = (text) => {

  const form = new FormData();
  form.append('prompt', text);
  form.append('sample_rate', '25000');
  form.append('speaker', 'en_speaker_6');
  form.append('text_temp', '0.5');
  form.append('wave_temp', '0.5');


  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjE4ZGIzN2I0MmU5ZTU4OTllNzI1OWM4NzZhZWUwZjAzIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDItMTdUMDg6MTk6MjAuMzg3NzExIn0.XMGqFSpcgakTSAD2TSnSdnWdO15jQhMwErctkp8PUTo'
    },
    body: form,
  }

  fetch('https://api.monsterapi.ai/v1/generate/sunoai-bark', options)
    .then(response => response.json())
    .then(data => {
      const processId = data.process_id;
      console.log('Initial request success data:', data);

      //repeatedly check the status of the transcription
      const checkStatus = () => {
        const options2 = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjE4ZGIzN2I0MmU5ZTU4OTllNzI1OWM4NzZhZWUwZjAzIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDItMTdUMDg6MTk6MjAuMzg3NzExIn0.XMGqFSpcgakTSAD2TSnSdnWdO15jQhMwErctkp8PUTo'
          }
        };

        fetch(`https://api.monsterapi.ai/v1/status/${processId}`, options2)
          .then(response => response.json())
          .then(response => {
            console.log("Process ID:", response.process_id);
            console.log("Status:", response.status);

            if (response.status === "COMPLETED" || response.status === "FAILED") {
              clearInterval(statusInterval); // Stop checking
              if (response.status === "COMPLETED") {
                console.log("Transcription Completed:", response.result);
                const audio_file = response.result.output[0]
                playAudio(audio_file);
              }
            }
          })
          .catch(error => {
            console.error('Error during status check:', error);
            clearInterval(statusInterval); // Stop checking on error
          });
      };

      // Start checking the status every 0.5 seconds
      const statusInterval = setInterval(checkStatus, 2000);
    })
    .catch(error => {
      console.error('Error during initial transcription request:', error);
    })
}

const textToSpeechOpenAI = (text) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': 'Bearer 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'
    },
    body: JSON.stringify({ model: 'tts-1', input: text, voice: "shimmer" })
  }

  fetch('https://api.openai.com/v1/audio/speech', options)
    .then(response => response.blob())
    .then(blob => {

      const audioUrl = URL.createObjectURL(blob)
      playAudio(audioUrl)

    })
    .catch(error => {
      console.error('Error during initial transcription request:', error);
    })
}

// choose provider
const textToSpeech = textToSpeechOpenAI

textToSpeech("What's good treehacker, Inky here, your AI accessibility assistant. What can I do for you today?")
