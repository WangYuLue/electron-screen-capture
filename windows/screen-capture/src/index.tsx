import React, { Component } from 'react';
import { CaptureEditor } from '../utils';
import {
  desktopCapturer,
  remote,
  ipcRenderer,
  screen
} from 'electron';
import './index.scss';

const fs = require('fs');

let currentWindow = remote.getCurrentWindow()

const getCurrentScreen = () => {
  let { x, y } = currentWindow.getBounds()
  return screen.getAllDisplays().filter((d: any) => d.bounds.x === x && d.bounds.y === y)[0]
}

const currentScreen = getCurrentScreen()

class ScreenCapture extends Component {
  componentDidMount() {
    const win = remote.getCurrentWindow();
    win.hide();
    const display = getCurrentScreen();
    desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: display.size
    }, async (error, sources) => {
      win.show();
      if (!error) {
        const dataURL = sources[0].thumbnail.toDataURL();
        this.startCapture(dataURL);
      }
    });
  }

  startCapture(dataURL: string) {
    const $canvas = document.getElementById('js-canvas')
    const $bg = document.getElementById('js-bg')
    const $sizeInfo = document.getElementById('js-size-info')
    const $toolbar = document.getElementById('js-toolbar')

    const $btnClose = document.getElementById('js-tool-close')
    const $btnOk = document.getElementById('js-tool-ok')
    const $btnReset = document.getElementById('js-tool-reset')
    let capture = new CaptureEditor($canvas as HTMLCanvasElement, $bg, dataURL)
    let onDrag = (selectRect: any) => {
      $toolbar.style.display = 'none'
      $sizeInfo.style.display = 'block'
      $sizeInfo.innerText = `${selectRect.w} * ${selectRect.h}`
      if (selectRect.y > 35) {
        $sizeInfo.style.top = `${selectRect.y - 30}px`
      } else {
        $sizeInfo.style.top = `${selectRect.y + 10}px`
      }
      $sizeInfo.style.left = `${selectRect.x}px`
    }
    capture.on('start-dragging', onDrag)
    capture.on('dragging', onDrag)

    const onDragEnd = () => {
      if (capture.selectRect) {
        ipcRenderer.send('capture-screen', {
          type: 'select',
          screenId: currentScreen.id,
        })
        const {
          r, b,
        } = capture.selectRect
        $toolbar.style.display = 'flex'
        $toolbar.style.top = `${b + 15}px`
        $toolbar.style.right = `${window.screen.width - r}px`
      }
    }
    capture.on('end-dragging', onDragEnd)

    ipcRenderer.on('capture-screen', (e: any, data: any) => {
      const { type, screenId } = data;
      if (type === 'select') {
        if (screenId && screenId !== currentScreen.id) {
          capture.disable()
        }
      }
    })

    capture.on('reset', () => {
      $toolbar.style.display = 'none'
      $sizeInfo.style.display = 'none'
    })

    $btnClose.addEventListener('click', () => {
      ipcRenderer.send('capture-screen', {
        type: 'close',
      })
      window.close()
    })

    $btnReset.addEventListener('click', () => {
      capture.reset()
    })

    let selectCapture = () => {
      if (!capture.selectRect) {
        return
      }
      let url = capture.getImageUrl()
      // remote.getCurrentWindow().hide()
      console.log({ url });

      ipcRenderer.send('capture-screen', {
        type: 'complete',
        url,
      })

    }
    $btnOk.addEventListener('click', selectCapture)

  }

  componentWillUnmount() {

  }


  render() {
    return (
      <React.Fragment>
        <div id="js-bg" className="bg"></div>
        <div id="js-mask" className="mask"></div>
        <canvas id="js-canvas" className="image-canvas"></canvas>
        <div id="js-size-info" className="size-info"></div>
        <div id="js-toolbar" className="toolbar">
          <div id="js-tool-reset">reset</div>
          &nbsp; &nbsp; &nbsp; &nbsp;
          <div id="js-tool-close">close</div>
          &nbsp; &nbsp; &nbsp; &nbsp;
          <div id="js-tool-ok">ok</div>
        </div>
      </React.Fragment>
    )
  }
}

export default ScreenCapture;