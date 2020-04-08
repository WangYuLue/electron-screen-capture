import React, { Component } from 'react';
import { CaptureEditor, getScreenSources } from '../utils';
import {
  remote,
  ipcRenderer,
  screen
} from 'electron';
import './index.scss';

class ScreenCapture extends Component {
  capture = new CaptureEditor()
  componentDidMount() {
    const win = remote.getCurrentWindow();
    win.hide();
    getScreenSources((dataURL) => {
      console.log(dataURL);
      win.show();
      this.startCapture(dataURL);
    })
  }

  startCapture(dataURL: string) {
    const $canvas = document.getElementById('js-canvas')
    const $bg = document.getElementById('js-bg')
    const $sizeInfo = document.getElementById('js-size-info')
    const $toolbar = document.getElementById('js-toolbar')
    const $btnClose = document.getElementById('js-tool-close')
    const $btnOk = document.getElementById('js-tool-ok')
    const $btnReset = document.getElementById('js-tool-reset')
    this.capture.init($canvas as HTMLCanvasElement, $bg, dataURL);
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
    this.capture.on('start-dragging', onDrag)
    this.capture.on('dragging', onDrag)

    const onDragEnd = () => {
      if (this.capture.selectRect) {
        ipcRenderer.send('capture-screen', {
          type: 'select',
          screenId: screen.getPrimaryDisplay().id,
        })
        const {
          r, b,
        } = this.capture.selectRect
        $toolbar.style.display = 'flex'
        $toolbar.style.top = `${b + 15}px`
        $toolbar.style.right = `${window.screen.width - r}px`
      }
    }
    this.capture.on('end-dragging', onDragEnd)

    this.capture.on('reset', () => {
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
      this.capture.reset()
    })

    let selectCapture = () => {
      if (!this.capture.selectRect) {
        return
      }
      let url = this.capture.getImageUrl()
      // remote.getCurrentWindow().hide()
      // console.log({ url });
      ipcRenderer.send('capture-screen', {
        type: 'complete',
        url,
      })
    }
    $btnOk.addEventListener('click', selectCapture)
  }

  componentWillUnmount() {
    this.capture.destroy();
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