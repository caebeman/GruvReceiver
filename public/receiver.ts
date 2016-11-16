/// <reference path="typings/globals/jquery/index.d.ts" />

const NAMESPACE = 'urn:x-cast:com.gruvcast.gruvcast';


class GruvReceiver {
	// html audio element
	private mediaElement: HTMLAudioElement; // html audio element

	public receiverManager: any;
	public messageBus: any;

	// use spotify user??
	private admin: any;

	// hold songs
	private songList: Array<any> = new Array<any>();

	private connectedUsers: Array<any> = new Array<any>();

	// Modify to disable debug
	private debug: boolean = true;

	constructor(private element:HTMLElement, private cast) {
		this.mediaElement = this.element.querySelector('audio');
		this.initMediaEventListeners();

		// Set logging
		if(this.debug){
			cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.DEBUG);
			cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
		}


		// get api instances
		this.receiverManager = cast.receiver.CastReceiverManager.getInstance();
		this.messageBus = this.receiverManager.getCastMessageBus(NAMESPACE, cast.receiver.CastMessageBus.MessageType.JSON);

		
		// Init receiver handlers
		this.initReceiverListeners();

		// ....

		
		// Init message listeners
		this.initMessageListeners();


		
	}

	// audio event listeners
	initMediaEventListeners() {
		this.mediaElement.addEventListener('error', (error)	=> {
			console.log('Error');
		}); 
		this.mediaElement.addEventListener('playing', ()	=> {
			console.log('Playing');
		});
		this.mediaElement.addEventListener('pause', ()	=> {
			console.log('paused');
		});

	}
	initMessageListeners() {
		this.receiverManager.onReceiverConnected = this.onSenderConnected;
	}

	initReceiverListeners() {

	}

	


	// init our playlist queue here
	// determine who is admin
	onSenderConnected(event:any) {
		if(!this.admin){
			this.admin = event.data.userId;
		}
		this.connectedUsers.push(event.data.userId);
	}

	onSenderDisconnected() {

	}


	updateUpNext(songs:Array<any>){
		$('#upNextList').empty();
		songs.forEach(() =>{
			// put songs in display
		})

	}

	
	// other functions taht we need to define

}

/* (param: [optional type]) => {
	
})

*/