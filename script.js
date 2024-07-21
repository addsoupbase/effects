import { Effect, Special, Strange } from './effects.js'
export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');
window.a = Effect
window.images = []
Object.defineProperty(window, 'update', { get: () => Effect.Update.call(Effect) })
window.animating = false;
update
 let mediaRecorder;
let recordedChunks = []
Effect.start()
window.gif =  function () {
    //window.animating = true
    Effect.empty()
    Effect.start()
    const stream = canvas.captureStream(60)
    mediaRecorder = new MediaRecorder(stream,{ mimeType: 'video/webm; codecs=vp8' });
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        // Create a download link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation.webm';
       /// a.click();
       let video = document.createElement('video')
       video.src = url
      // document.body.appendChild(video)
      window.open(url)
    };

    mediaRecorder.start()
}
window.stop = () => {
    mediaRecorder.stop()
}