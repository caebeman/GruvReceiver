'use strict';


/**
 * Creates the namespace
 */
var gruvplayer = gruvplayer || {};

var NAMESPACE = 'urn:x-cast:com.gruvcast.gruvcast';


gruvplayer.CastPlayer = function(element) {

  /**
   * The debug setting to control receiver, MPL and player logging.
   * @private {boolean}
   */
  this.debug_ = gruvplayer.DISABLE_DEBUG_;
  if (this.debug_) {
    cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.DEBUG);
    cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
  }

  /**
   * The DOM element the player is attached.
   * @private {!Element}
   */
  this.element_ = element;

  /**
   * The current type of the player.
   * @private {gruvplayer.Type}
   */
  this.type_;

  // this.setType_(gruvplayer.Type.UNKNOWN, false);

  /**
   * The current state of the player.
   * @private {gruvplayer.State}
   */
  this.state_;

  /**
   * Timestamp when state transition happened last time.
   * @private {number}
   */
  this.lastStateTransitionTime_ = 0;

  // this.setState_(gruvplayer.State.LAUNCHING, false);

  /**
   * The id returned by setInterval for the screen burn timer
   * @private {number|undefined}
   */
  this.burnInPreventionIntervalId_;

  /**
   * The id returned by setTimeout for the idle timer
   * @private {number|undefined}
   */
  this.idleTimerId_;

  /**
   * The id of timer to handle seeking UI.
   * @private {number|undefined}
   */
  this.seekingTimerId_;

  /**
   * The id of timer to defer setting state.
   * @private {number|undefined}
   */
  this.setStateDelayTimerId_;

  /**
   * Current application state.
   * @private {string|undefined}
   */
  this.currentApplicationState_;

  /**
   * The DOM element for the inner portion of the progress bar.
   * @private {!Element}
   */
  // this.progressBarInnerElement_ = this.getElementByClass_(
      // '.controls-progress-inner');

  /**
   * The DOM element for the thumb portion of the progress bar.
   * @private {!Element}
   */
  // this.progressBarThumbElement_ = this.getElementByClass_(
      // '.controls-progress-thumb');

  /**
   * The DOM element for the current time label.
   * @private {!Element}
   */
  // this.curTimeElement_ = this.getElementByClass_('.controls-cur-time');

  /**
   * The DOM element for the total time label.
   * @private {!Element}
   */
  // this.totalTimeElement_ = this.getElementByClass_('.controls-total-time');

  /**
   * The DOM element for the preview time label.
   * @private {!Element}
   */
  // this.previewModeTimerElement_ = this.getElementByClass_('.preview-mode-timer-countdown');

  /**
   * Handler for buffering-related events for MediaElement.
   * @private {function()}
   */
  // this.bufferingHandler_ = this.onBuffering_.bind(this);

  /**
   * Media player to play given manifest.
   * @private {cast.player.api.Player}
   */
  this.player_ = null;

  /**
   * Media player used to preload content.
   * @private {cast.player.api.Player}
   */
  this.preloadPlayer_ = null;

  /**
   * Text Tracks currently supported.
   * @private {?gruvplayer.TextTrackType}
   */
  this.textTrackType_ = null;

  /**
   * Whether player app should handle autoplay behavior.
   * @private {boolean}
   */
  this.playerAutoPlay_ = false;

  /**
   * Whether player app should display the preview mode UI.
   * @private {boolean}
   */
  this.displayPreviewMode_ = false;

  /**
   * Id of deferred play callback
   * @private {?number}
   */
  this.deferredPlayCallbackId_ = null;

  /**
   * Whether the player is ready to receive messages after a LOAD request.
   * @private {boolean}
   */
  this.playerReady_ = false;

  /**
   * Whether the player has received the metadata loaded event after a LOAD
   * request.
   * @private {boolean}
   */
  this.metadataLoaded_ = false;

  /**
   * The media element.
   * @private {HTMLMediaElement}
   */
  this.mediaElement_ = /** @type {HTMLMediaElement} */
      (this.element_.querySelector('audio'));
  this.mediaElement_.addEventListener('error', this.onError_.bind(this), false);
  this.mediaElement_.addEventListener('playing', this.onPlaying_.bind(this),
      false);
  this.mediaElement_.addEventListener('pause', this.onPause_.bind(this), false);
  // this.mediaElement_.addEventListener('ended', this.onEnded_.bind(this), false);
  // this.mediaElement_.addEventListener('abort', this.onAbort_.bind(this), false);
  // this.mediaElement_.addEventListener('timeupdate', this.onProgress_.bind(this),
  //     false);
  // this.mediaElement_.addEventListener('seeking', this.onSeekStart_.bind(this),
  //     false);
  // this.mediaElement_.addEventListener('seeked', this.onSeekEnd_.bind(this),
  //     false);


  /**
   * The cast receiver manager.
   * @private {!cast.receiver.CastReceiverManager}
   */
  this.receiverManager_ = cast.receiver.CastReceiverManager.getInstance();
  this.receiverManager_.onReady = this.onReady_.bind(this);
  // this.receiverManager_.onSenderDisconnected =
  //     this.onSenderDisconnected_.bind(this);
  // this.receiverManager_.onVisibilityChanged =
  //     this.onVisibilityChanged_.bind(this);
  // this.receiverManager_.setApplicationState(
  //     gruvplayer.getApplicationState_());


  /**
   * The remote media object.
   * @private {cast.receiver.MediaManager}
   */
  this.mediaManager_ = new cast.receiver.MediaManager(this.mediaElement_);


  this.messageQueue = this.receiverManager_.getCastMessageBus(NAMESPACE, cast.receiver.CastMessageBus.MessageType.STRING);
  this.messageQueue.onMessage = function(event){
    console.log(event.data);
    var audioObj = new Audio('https://p.scdn.co/mp3-preview/3480aa91abfa040232eb93dd507586f424196024');
    audioObj.play();
  }
  
  // /**
  //  * The original load callback.
  //  * @private {?function(cast.receiver.MediaManager.Event)}
  //  */
  // this.onLoadOrig_ =
  //     this.mediaManager_.onLoad.bind(this.mediaManager_);
  // this.mediaManager_.onLoad = this.onLoad_.bind(this);

  // /**
  //  * The original editTracksInfo callback
  //  * @private {?function(!cast.receiver.MediaManager.Event)}
  //  */
  // this.onEditTracksInfoOrig_ =
  //     this.mediaManager_.onEditTracksInfo.bind(this.mediaManager_);
  // this.mediaManager_.onEditTracksInfo = this.onEditTracksInfo_.bind(this);

  // /**
  //  * The original metadataLoaded callback
  //  * @private {?function(!cast.receiver.MediaManager.LoadInfo)}
  //  */
  // this.onMetadataLoadedOrig_ =
  //     this.mediaManager_.onMetadataLoaded.bind(this.mediaManager_);
  // this.mediaManager_.onMetadataLoaded = this.onMetadataLoaded_.bind(this);

  // /**
  //  * The original stop callback.
  //  * @private {?function(cast.receiver.MediaManager.Event)}
  //  */
  // this.onStopOrig_ =
  //     this.mediaManager_.onStop.bind(this.mediaManager_);
  // this.mediaManager_.onStop = this.onStop_.bind(this);

  // /**
  //  * The original metadata error callback.
  //  * @private {?function(!cast.receiver.MediaManager.LoadInfo)}
  //  */
  // this.onLoadMetadataErrorOrig_ =
  //     this.mediaManager_.onLoadMetadataError.bind(this.mediaManager_);
  // this.mediaManager_.onLoadMetadataError = this.onLoadMetadataError_.bind(this);

  // /**
  //  * The original error callback
  //  * @private {?function(!Object)}
  //  */
  // this.onErrorOrig_ =
  //     this.mediaManager_.onError.bind(this.mediaManager_);
  // this.mediaManager_.onError = this.onError_.bind(this);

  // this.mediaManager_.customizedStatusCallback =
  //     this.customizedStatusCallback_.bind(this);

  // this.mediaManager_.onPreload = this.onPreload_.bind(this);
  // this.mediaManager_.onCancelPreload = this.onCancelPreload_.bind(this);
};



gruvplayer.CastPlayer.prototype.onError_ = function(error) {
  console.log('onError');
  // var self = this;
  // sampleplayer.transition_(self.element_, sampleplayer.TRANSITION_DURATION_,
  //     function() {
  //       self.setState_(sampleplayer.State.IDLE, true);
  //       self.onErrorOrig_(error);
  //     });
};
/**
 * Called when media has started playing. We transition to the
 * PLAYING state.
 *
 * @private
 */
gruvplayer.CastPlayer.prototype.onPlaying_ = function() {
  console.log('onPlaying');
  // this.cancelDeferredPlay_('media is already playing');
  // var isAudio = this.type_ == sampleplayer.Type.AUDIO;
  // var isLoading = this.state_ == sampleplayer.State.LOADING;
  // var crossfade = isLoading && !isAudio;
  // this.setState_(sampleplayer.State.PLAYING, crossfade);
};


/**
 * Called when media has been paused. If this is an auto-pause as a result of
 * buffer underflow, we transition to BUFFERING state; otherwise, if the media
 * isn't done, we transition to the PAUSED state.
 *
 * @private
 */
gruvplayer.CastPlayer.prototype.onPause_ = function() {
  console.log('onPause');
  // this.cancelDeferredPlay_('media is paused');
  // var isIdle = this.state_ === sampleplayer.State.IDLE;
  // var isDone = this.mediaElement_.currentTime === this.mediaElement_.duration;
  // var isUnderflow = this.player_ && this.player_.getState()['underflow'];
  // if (isUnderflow) {
  //   this.log_('isUnderflow');
  //   this.setState_(sampleplayer.State.BUFFERING, false);
  //   this.mediaManager_.broadcastStatus(/* includeMedia */ false);
  // } else if (!isIdle && !isDone) {
  //   this.setState_(sampleplayer.State.PAUSED, false);
  // }
  // this.updateProgress_();
};


gruvplayer.CastPlayer.prototype.onReady_ = function() {
  console.log('onReady');
  // this.setState_(sampleplayer.State.IDLE, false);
  // var audioObj = new Audio('https://p.scdn.co/mp3-preview/3480aa91abfa040232eb93dd507586f424196024');
  // audioObj.play();
};

gruvplayer.CastPlayer.prototype.start = function() {
  this.receiverManager_.start();
};