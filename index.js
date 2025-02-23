// ==UserScript==
// @name         Anki Plugins
// @namespace    https://row248.xyz
// @version      0.1
// @description  Adds usefull anki plugins to ankiuser.net
// @author       Your Name
// @match        https://ankiuser.net/study
// @grant        GM_addStyle
// ==/UserScript==

const globalStyles = `
.anki-plugin-ai-sentence {
    display: flex;
    align-content: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
}
    
.anki-plugin-ai-sentence svg {
    width: 22px;
    height: 22px;
}
`

const playIcon = '<svg fill="#1c7eca" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60" xml:space="preserve" stroke="#1c7eca"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30 c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15 C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z"></path> <path d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30 S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"></path> </g> </g></svg>'

async function play(audioData) {
    const binaryData = atob(audioData);

    // Convert the binary data to an ArrayBuffer
    const byteArray = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }

    // Get the audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();


    // Decode the raw PCM data to an AudioBuffer
    audioContext.decodeAudioData(byteArray.buffer, function(buffer) {
      // Create a buffer source node
      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      // Connect the source node to the audio context's destination (speakers)
      source.connect(audioContext.destination);

      // Start playing the audio
      source.start(0);
    }, function(error) {
      console.error("Error decoding audio data", error);
    });
}

const playAISentence = async (word) => {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer <redacted>'
        },
        body: JSON.stringify({
          'model': 'gpt-4o-mini-audio-preview',
          'messages': [
            {
              'role': 'system',
              'content': [
                {
                  'type': 'text',
                  'text': '"I give you a word and you tell tell me example of a sentence with that word. Vary your answers but give me only one'
                }
              ]
            },
            {
              'role': 'user',
              'content': [
                {
                  'type': 'text',
                  'text': word
                }
              ]
            }
          ],
          'modalities': [
            'text',
            'audio'
          ],
          'audio': {
            'voice': 'alloy',
            'format': 'mp3'
          },
          'response_format': {
            'type': 'text'
          },
          'temperature': 1,
          'max_completion_tokens': 2048,
          'top_p': 1,
          'frequency_penalty': 0,
          'presence_penalty': 0
        })
      });

    const json = await resp.json()
    const audioData = json.choices[0].message.audio.data;

    await play(audioData)
}

setTimeout(() => {
    // add global styles
    const style = document.createElement('style');
    style.innerHTML = globalStyles
    document.head.appendChild(style);   

    // add play button
    const wordElem = document.querySelector('.pt-1');
    wordElem.insertAdjacentHTML('beforeend', `<div class="anki-plugin-ai-sentence">${playIcon}</div>`)

    document.querySelector('.anki-plugin-ai-sentence').onclick = (e) => {
        const word = document.querySelector('#qa').innerText;
        playAISentence(word)
    }
}, 1000)
