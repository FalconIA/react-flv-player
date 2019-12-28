import React, { Component } from 'react';
import flvjs from './flv.min';
import PropTypes from 'prop-types';


const PROPS_KEYS = ['type', 'url', 'isLive', 'enableStashBuffer', 'stashInitialSize', 'hasAudio', 'hasVideo', 'handleError', 'handleLoadingComplete'];

class ReactFlvPlayer extends Component {

  flvPlayer;

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount() {

    const { enableWarning, enableError } = this.props;

    flvjs.LoggingControl.enableError = enableError || false;
    flvjs.LoggingControl.enableWarn = enableWarning || false;

    this.attach.apply(this, PROPS_KEYS.map(k => this.props[k]));
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (PROPS_KEYS.filter(k => nextProps[k] !== this.props[k]).length > 0) {
      this.detach();
      this.attach.apply(this, PROPS_KEYS.map(k => nextProps[k]));
    }
  }

  attach(type, url, isLive, enableStashBuffer, stashInitialSize, hasAudio, hasVideo, handleError, handleLoadingComplete) {
    // 组件挂载后，拿到Ref进行操作
    if (flvjs.isSupported() && this.myRef.current) {
      this.flvPlayer = flvjs.createPlayer({
        type,
        isLive,
        url,
        hasAudio,
        hasVideo
      }, {
        enableStashBuffer,
        stashInitialSize
      });

      this.flvPlayer.attachMediaElement(this.myRef.current); // 将这个DOM付给第三方库
      this.flvPlayer.load();
      this.flvPlayer.play();
      this.flvPlayer.on('error', (err) => {
        // console.log(err);
        handleError(err);
      });
      this.flvPlayer.on('loading_complete', (ev) => {
        handleLoadingComplete(ev);
      });
    }
  };

  detach() {
    if (this.flvPlayer) {
      this.flvPlayer.unload()
      this.flvPlayer.detachMediaElement();
      this.flvPlayer.destroy()
    }
  };

  render() {
    const { height, width, autoPlay, controls, controlsList, loop, muted, poster, isMuted } = this.props;
    return (
      <div>
        <video
          autoPlay={autoPlay}
          controls={controls}
          controlsList={controlsList}
          loop={loop}
          muted={muted || isMuted}
          poster={poster}
          ref={this.myRef}
          style={{height, width}}
        />
      </div>
    );
  }
}

ReactFlvPlayer.propTypes = {
  type: PropTypes.string,
  url: PropTypes.string.isRequired,
  isLive: PropTypes.bool,
  hasAudio: PropTypes.bool,
  hasVideo: PropTypes.bool,
  enableStashBuffer: PropTypes.bool,
  stashInitialSize: PropTypes.number,
  height: PropTypes.string,
  width: PropTypes.string,
  autoPlay: PropTypes.bool,
  controls: PropTypes.bool,
  controlsList: PropTypes.string,
  loop: PropTypes.bool,
  muted: PropTypes.bool,
  poster: PropTypes.string,
  isMuted: PropTypes.bool,
  enableWarning: PropTypes.bool,
  enableError: PropTypes.bool,
  handleError: PropTypes.func,
  handleLoadingComplete: PropTypes.func
};

ReactFlvPlayer.defaultProps = {
  type: 'flv',
  isLive: true,
  hasAudio: true,
  hasVideo: true,
  enableStashBuffer: true,
  stashInitialSize: 128,
  height: '100%',
  width: '100%',
  isMuted: false,
  handleError: (err)=>{console.log(err)},
  enableWarning: false,
  enableError: false
};

export default ReactFlvPlayer;
