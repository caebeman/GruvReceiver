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

	// html audio event listeners
	this.mediaElement_ = (this.element_.querySelector('audio'));
	this.mediaElement_.addEventListener('error', this.onError_.bind(this), false);
	this.mediaElement_.addEventListener('playing', this.onPlaying_.bind(this),
			false);
	this.mediaElement_.addEventListener('pause', this.onPause_.bind(this), false);

	/**
	 * The cast receiver manager.
	 * @private {!cast.receiver.CastReceiverManager}
	 */
	this.receiverManager_ = cast.receiver.CastReceiverManager.getInstance();
	this.receiverManager_.onReady = this.onReady_.bind(this);


	/**
	 * The remote media object.
	 * @private {cast.receiver.MediaManager}
	 */
	this.mediaManager_ = new cast.receiver.MediaManager(this.mediaElement_);


	this.messageQueue = this.receiverManager_.getCastMessageBus(NAMESPACE, cast.receiver.CastMessageBus.MessageType.STRING);
	this.messageQueue.onMessage = function(event){
		console.log(event.data);
		// temporary, play music when we get a message
		var audioObj = new Audio('https://p.scdn.co/mp3-preview/3480aa91abfa040232eb93dd507586f424196024');
		audioObj.play();
	}
	
 
};



gruvplayer.CastPlayer.prototype.onError_ = function(error) {
	console.log('onError');
};
/**
 * Called when media has started playing. We transition to the
 * PLAYING state.
 *
 * @private
 */
gruvplayer.CastPlayer.prototype.onPlaying_ = function() {
	console.log('onPlaying');
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
};


gruvplayer.CastPlayer.prototype.onReady_ = function() {
	console.log('onReady');
};

gruvplayer.CastPlayer.prototype.start = function() {
	this.receiverManager_.start();
};