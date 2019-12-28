import React, { Component } from 'react';
import FlvJs from 'flv.js';
import PropTypes from 'prop-types';


const PROPS_KEYS = ['type', 'url', 'isLive', 'enableStashBuffer', 'stashInitialSize', 'hasAudio', 'hasVideo'];
const PROPS_FUNC_KEYS = ['handleError', 'onLoading', 'onPlay'];

class ReactFlvPlayer extends Component {

  flvPlayer;

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount() {

    const { enableWarning, enableError } = this.props;

    FlvJs.LoggingControl.enableError = enableError || false;
    FlvJs.LoggingControl.enableWarn = enableWarning || false;

    this.attach.apply(this, [].concat(PROPS_KEYS, PROPS_FUNC_KEYS).map(k => this.props[k]));
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (PROPS_KEYS.filter(k => nextProps[k] !== this.props[k]).length > 0) {
      this.detach();

      if (this.props.onLoading) {
        this.props.onLoading();
      }

      this.attach.apply(this, PROPS_KEYS.map(k => nextProps[k]));
    }
    if (nextProps.handleError !== this.props.handleError) {
      if (this.props.handleError) {
        this.flvPlayer.off('error', this.props.handleError);
      }
      if (nextProps.handleError) {
        this.flvPlayer.on('error', nextProps.handleError);
      }
    }
    if (nextProps.onPlay !== this.props.onPlay) {
      if (this.props.onPlay) {
        this.myRef.current.removeEventListener('play', this.props.onPlay);
      }
      if (nextProps.onPlay) {
        this.myRef.current.addEventListener('play', nextProps.onPlay);
      }
    }
  }

  attach(type, url, isLive, enableStashBuffer, stashInitialSize, hasAudio, hasVideo, handleError, onLoading, onPlay) {
    // 组件挂载后，拿到Ref进行操作
    if (FlvJs.isSupported() && this.myRef.current) {
      if (onLoading) {
        onLoading();
      }
      this.flvPlayer = FlvJs.createPlayer({
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
      if (handleError) {
        this.flvPlayer.on('error', handleError);
      }
      if (onPlay) {
        this.myRef.current.addEventListener('play', onPlay)
      }
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
  onLoading: PropTypes.func,
  onPlay: PropTypes.func
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
  autoPlay: false,
  controls: undefined,
  controlsList: undefined,
  loop: false,
  muted: false,
  poster: undefined,
  isMuted: false,
  handleError: (err)=>{console.log(err)},
  enableWarning: false,
  enableError: false
};

export default ReactFlvPlayer;
