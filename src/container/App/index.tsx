import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import './index.scss';



class App extends Component {
  onScreenCapture() {
    ipcRenderer.send('ScreenCapture:Open')
  }
  render() {
    return (
      <React.Fragment>
        <button onClick={this.onScreenCapture}>截图</button>
      </React.Fragment>
    )
  }
}

export default App;