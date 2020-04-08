import {
  screen,
  desktopCapturer
} from 'electron';
const os = require('os');

function getScreenSources(callback: (str: string) => void) {
  document.body.style.opacity = '0'
  let oldCursor = document.body.style.cursor
  document.body.style.cursor = 'none'

  const handleStream = (stream: MediaStream) => {
    document.body.style.cursor = oldCursor
    document.body.style.opacity = '1'
    // Create hidden video tag
    let video: any;
    video = document.createElement('video')
    video.autoplay = 'autoplay'
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;'
    // Event connected to stream

    let loaded = false
    video.onplaying = () => {
      if (loaded) return;
      loaded = true
      // Set video ORIGINAL height (screenshot)
      video.style.height = video.videoHeight + 'px' // videoHeight
      video.style.width = video.videoWidth + 'px' // videoWidth

      // Create canvas
      let canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      let ctx = canvas.getContext('2d')
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      if (callback) {
        // Save screenshot to png - base64
        callback(canvas.toDataURL('image/png'))
      } else {
        // console.log('Need callback!')
      }

      // Remove hidden video tag
      video.remove()
      try {
        stream.getTracks()[0].stop()
      } catch (e) {
        // nothing
      }
    }
    video.srcObject = stream
    document.body.appendChild(video)
  }

  const handleError = (e: any) => {
    // console.log(e)
  }

  if (os.platform() === 'win32') {
    desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1, height: 1 },
    }, async () => {
      try {
        const config: any = {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: screen.getPrimaryDisplay().id,
              minWidth: 1280,
              minHeight: 720,
              maxWidth: 8000,
              maxHeight: 8000,
            },
          },
        }
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia(config)
        handleStream(stream)
      } catch (e) {
        handleError(e)
      }
    })
  } else {
    const config: any = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: `screen:${screen.getPrimaryDisplay().id}`,
          minWidth: 1280,
          minHeight: 720,
          maxWidth: 8000,
          maxHeight: 8000,
        },
      },
    }
    navigator.mediaDevices.getUserMedia(config).then((e) => {
      handleStream(e)
    }).catch(handleError)
  }
}

export {
  getScreenSources
} 
