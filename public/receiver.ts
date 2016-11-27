/// <reference path="typings/globals/jquery/index.d.ts" />

const NAMESPACE = 'urn:x-cast:com.gruvcast.gruvcast';


class GruvReceiver {
	// html audio element
	private mediaElement: HTMLMediaElement; // html audio element

	public receiverManager: any;
	public messageBus: any;

	// use spotify user??
	private admin: any;

	// keep track of our position in the list of songs
	private counter = 0;


	// hold songs
	private songList: Array<any> = new Array<any>();

	private connectedUsers: Array<any> = new Array<any>();

	// Modify to disable debug
	private debug: boolean = true;

	constructor(private element:HTMLElement, private cast) {
		this.mediaElement = <HTMLMediaElement>this.element.querySelector('audioPlayer');

		// Set logging
		if(this.debug){
			cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.DEBUG);
			cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
		}


		// get api instances
		this.receiverManager = cast.receiver.CastReceiverManager.getInstance();
		this.messageBus = this.receiverManager.getCastMessageBus(NAMESPACE, cast.receiver.CastMessageBus.MessageType.JSON);
		// need to call this after delcaring our namespace
		this.receiverManager.start();



		
		// Init receiver handlers
		this.initConnectionListeners();

		// ....

		
		// Init message listeners
		this.initMessageListeners();


		
	}

	onMessage(event:any){
		console.log(event.data);
		// var audioObj = new Audio(event.data.previewURL);
		let audio: any = $('#audioPlayer').get(0); 
		audio.src = event.data.song.previewUrl;
		// audio = <HTMLMediaElement> a
		audio.play();
 		// audioObj.play();
	}

	// audio event listeners
	initMediaEventListeners() {
		// this.mediaElement.addEventListener('error', (error)	=> {
		// 	console.log('Error');
		// }); 
		// this.mediaElement.addEventListener('playing', ()	=> {
		// 	console.log('Playing');
		// });
		// this.mediaElement.addEventListener('pause', ()	=> {
		// 	console.log('paused');
		// });

	}

	initMessageListeners() {
		this.messageBus.onMessage = (event) => this.onMessage(event);
	}

	initConnectionListeners() {
		this.receiverManager.onSenderConnected = (event) => this.onSenderConnected(event);
		this.receiverManager.onSenderDisconnected = (event) => this.onSenderDisconnected(event);
	}


	songEndingListener() {

	}

	


	// init our playlist queue here
	// determine who is admin
	onSenderConnected(event:any) {
		console.log("Sender connected");
		if(!this.admin){
			this.admin = event.data.userId;
		}
		// this.connectedUsers.push(event.data.userId);
	}

	onSenderDisconnected(event: any) {
		console.log("exitting");
		this.receiverManager.getInstance().stop();
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
	 </div>
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



/*
	need to use:
		() => {}
	for callback functions so this scope is correct

	redo all stuff from class monday

	$('audio').get(0).play();


*/