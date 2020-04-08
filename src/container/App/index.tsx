import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { dataURLtoImage } from '@utils';
import './index.scss';

class App extends Component {
  componentDidMount() {
    ipcRenderer.on('ScreenCapture:Complete', async (e: any, data: { url: string }) => {
      console.log(data);

      const img = await dataURLtoImage(data.url);
      const constainer$ = document.getElementById('image-container');
      constainer$.innerHTML = '';
      constainer$.appendChild(img);
    });
  }
  onScreenCapture() {
    ipcRenderer.send('ScreenCapture:Open');
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners('ScreenCapture:Complete');
  }
  render() {
    return (
      <React.Fragment>
        <button onClick={this.onScreenCapture}>截图</button>
        <div id='image-container'></div>
      </React.Fragment>
    );
  }
}

export default App;