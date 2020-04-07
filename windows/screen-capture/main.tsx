import React, { Component } from 'react';
import { desktopCapturer, remote } from 'electron';
import { dataURLtoImage, imagetoCanvas } from './utils';
import './index.scss';

class ScreenCapture extends Component {
  componentDidMount() {
    const win = remote.getCurrentWindow();
    win.hide();
    const display = remote.screen.getPrimaryDisplay();
    desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: display.size
    }, async (error, sources) => {
      if (!error) {
        const dataURL = sources[0].thumbnail.toDataURL();
        const image = await dataURLtoImage(dataURL);
        const canvas = await imagetoCanvas(image);
        this.updateCanvas(canvas);
        win.show();
      }
    });
  }

  updateCanvas(canvas: HTMLCanvasElement) {
    console.log(canvas);
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(canvas);
  }
  render() {
    return (
      <div id='capture-container'>
        <div id='canvas-container'></div>
        <div className='capture-bg'></div>
      </div>
    )
  }
}

export default ScreenCapture;