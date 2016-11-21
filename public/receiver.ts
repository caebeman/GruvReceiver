/// <reference path="typings/globals/jquery/index.d.ts" />

const NAMESPACE = 'urn:x-cast:com.gruvcast.gruvcast';


class GruvReceiver {
	// html audio element
	private mediaElement: HTMLAudioElement; // html audio element

	public receiverManager: any;
	public messageBus: any;

	// use spotify user??
	private admin: any;
	private counter = 0;


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
		this.receiverManager.start();
		this.messageBus = this.receiverManager.getCastMessageBus(NAMESPACE, cast.receiver.CastMessageBus.MessageType.JSON);
		this.messageBus.onMessage = this.onMessage();
		
		// Init receiver handlers
		this.initReceiverListeners();

		// ....

		
		// Init message listeners
		this.initMessageListeners();


		
	}

	onMessage(event:any){
		console.log(event.data);
		var audioObj = new Audio(event.data.previewURL);
 		audioObj.play();
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



	// update our Up Next list
	updateUpNext(songs:Array<any>){

		// get upNextList form html
		let myList = $('#upNextList');

		// empty current list
		myList.empty();

		// we only want to show the next 10 songs. Variable size so we know how long to append
		let listSize = songs.length >= 10 ? 10 : songs.length;

		// for each song in our list, add to Up Next
		for (let i = 0; i < listSize; i++) {

			// append to our pretty table in the html
			myList.append(
				`<tr>	
				<td class=\"albumArt wrap-text\"><img src=\"{{songs[i].albumArt}}\" alt=\"Album artwork\"></td>
				<td class=\"songName wrap-text\">{{songs[i].name}}</td>
				<td class=\"wrap-text\">{{song[i].albumName}}</td>
				<td class=\"artist\">{{song[i].artist}}</td>
			</tr>`);
		}
	}

	// incrementer counter, queue up next playing song
	// this will have some substantial sausage in it
	songEnding(songs:Array<any>) {
		this.counter++;
		this.updatePlaying(songs);
	}


	// update currently playing song
	// this will also probably have a sausage in it
	// WIP
	/*                <div class="media-info">
	 <div class="media-artwork">
	 </div>
	 <div class="media-text">
	 <div class="media-title"></div>
	 <div class="media-subtitle"></div>
	 */
	updatePlaying(songs:Array<any>) {
		// the song holding the information
		let mySong = songs[this.counter];

		// update album art
		$('#media-artwork').css('background-image', 'url(' + mySong.albumArt + ')');

		// update artist
		$('#media-title').text(mySong.artist);

		// update album
		$('#media-subtitle').text(mySong.albumName);

	}


	
	// other functions that we need to define

	// load informatoin for songs
}

/* (param: [optional type]) => {
	
})

*/