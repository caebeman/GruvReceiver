/// <reference path="typings/globals/jquery/index.d.ts" />
/*// <reference path="../public/node_modules/spotify-web-api-js/src/typings/spotify-web-api.d.ts" /> */
/* /// <reference path="typings/index.d.ts" /> */

const NAMESPACE = 'urn:x-cast:com.gruvcast.gruvcast';
const UP_NEXT_COUNT:number = 9;
const NO_SONGS = "No songs in playlist, add more."

// import SpotifyWebApi = require("./node_modules/spotify-web-api-js/src/spotify-web-api");

enum CMD_TYPE {CMD_ADD_SONG, CMD_DELETE_SONG, CMD_UPDATE_PLAYLIST, CMD_PLAY, CMD_PAUSE, CMD_CHANGE_ADMIN,
    CMD_IMPORT_PLAYLIST, CMD_SKIP, CMD_INITIALIZE_SENDER}
class Song {
	albumName: string;
    songName: string;
    artists: Array<string>;
    previewURL: string;
    smallAlbumArtURL: string;
    largeAlbumArtURL: string;
    songID: string;

    constructor (albumName:string, songName:string, artists:Array<string>, previewURL:string, smallAlbumArt:string, largeAlbumArt:string, songID:string){
    	this.albumName = albumName;
    	this.songName = songName;
    	this.artists = artists;
    	this.previewURL = previewURL;
    	this.smallAlbumArtURL = smallAlbumArt;
    	this.largeAlbumArtURL = largeAlbumArt;
    	this.songID = songID;
    }
}

// class mAudioTrack implements AudioTrack {
// 	public enabled;
// 	public id;
// 	public kind;
// 	public language;
// 	public label;
// 	public sourceBuffer;
// }

class Message{
	cmd:CMD_TYPE;
	song: Song;
	constructor(cmd:CMD_TYPE, song:Song){
		this.cmd = cmd;
		this.song = song;
	}
}

class GruvReceiver {
	// html audio element
	private audio: HTMLMediaElement; // html audio element

	private hasFirstSong:boolean = false;
	public receiverManager: any;
	public messageBus: any;

	// use spotify user??
	private admin: any;

	// keep track of our position in the list of songs
	private counter = 0;

	// private spotify:SpotifyWebApi;
	// hold songs
	private songList: Array<Song> = new Array<Song>();

	private connectedUsers: Array<any> = new Array<any>();

	// Modify to disable debug
	private debug: boolean = true;

	constructor(private cast, private $:JQuery) {
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


		//
		this.initMediaEventListeners();


		
	}
	// determines how to handle current message based on command type
	onMessage(event:any){
		switch(event.data.command) {
		    case CMD_TYPE[CMD_TYPE.CMD_ADD_SONG]:
		    	this.addSong(event.data.song);
		    	break;
		    case CMD_TYPE[CMD_TYPE.CMD_DELETE_SONG]:
		    	this.deleteSong(event.data.song);
		    	break;
		    // case CMD_TYPE[CMD_TYPE.CMD_UPDATE_PLAYLIST]:
		    // 	this.updatePlaylist();
		    // 	break;
		    case CMD_TYPE[CMD_TYPE.CMD_PLAY]: 
		    	this.play();
		    	break;
		    case CMD_TYPE[CMD_TYPE.CMD_PAUSE]:
		    	this.pause();
		    	break;
		    // case CMD_TYPE[CMD_TYPE.CMD_CHANGE_ADMIN]:
		    // 	this.newAdmin();
		    // 	break;
    		case CMD_TYPE[CMD_TYPE.CMD_SKIP]: 
    			this.skipSong();
    			break;
    		// case CMD_TYPE[CMD_TYPE.CMD_INITIALIZE_SENDER]:
    		// 	this.initSender();
    		// 	break;
			case CMD_TYPE[CMD_TYPE.CMD_IMPORT_PLAYLIST]:
				// this is currently unused
				this.importPlaylist();
				break;
		    default:
		    	// do nothing
		}
		
	}

	// adds the song to the queue
	addSong(song:Song){
		// Songs won't play if they have a / at the end
		if(song.previewURL.charAt(song.previewURL.length-1) == '/'){
			song.previewURL = song.previewURL.substring(0,song.previewURL.length-1);
		}
		if(song.smallAlbumArtURL.charAt(song.smallAlbumArtURL.length-1) == '/'){
			song.smallAlbumArtURL = song.smallAlbumArtURL.substring(0,song.smallAlbumArtURL.length-1);
		}
		if(song.largeAlbumArtURL.charAt(song.largeAlbumArtURL.length-1) == '/'){
			song.largeAlbumArtURL = song.largeAlbumArtURL.substring(0,song.largeAlbumArtURL.length-1);
		}
		// add the song, and update the display
		this.songList.push(song);
		if(!this.hasFirstSong){
			$("#songInfo").show();
			this.audio.src = song.previewURL;
			this.updatePlaying();
			this.hasFirstSong = true;
		}
		this.updateUpNext();
	}	

	// create new list of songs, not including the item to be deleted.
	// update our list of songs to this new list of songs
	deleteSong(delSong:Song){
		let newList:Array<Song> = new Array<Song>();
		for(let i = 0; i < this.songList.length - 1; i++){
			if(this.songList[i].songID != delSong.songID){
				newList.push(this.songList[i])
			}
		}
		this.songList = newList;
	}


	/*
		Update our spot in the list (increment our counter)
		Update the song that will be playing
		Update our upNext
	 */
	skipSong(){
		this.counter++;
		this.updatePlaying();
		this.updateUpNext();

	}


	play(){
		this.audio.play();
	}

	pause(){
		this.audio.pause();
	}

	importPlaylist(){
		// TODO
	}

	newAdmin(){
		
	}


	// audio event listeners
	initMediaEventListeners() {
		this.audio = <HTMLMediaElement> $('#audioPlayer').get(0); 
		this.audio.autoplay = true;
		this.audio.controls = true;
		this.audio.preload = 'auto';
		this.audio.addEventListener('error', (error)	=> {
			console.log('Error');
		}); 
		this.audio.addEventListener('playing', ()	=> {
			console.log('Playing');
		});
		this.audio.addEventListener('pause', ()	=> {
			console.log('paused');
		});
		this.audio.addEventListener('ended',() => {
			console.log('ended');
			this.counter++;
			this.updateUpNext();
			this.updatePlaying();
		})

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
			this.admin = event.senderId;
		}
		this.connectedUsers.push(event.senderId);


		// TODO
		// this.messageBus.broadcast();
	}

	onSenderDisconnected(event: any) {
		console.log("exiting");
		this.receiverManager.getInstance().stop();
	}



	// update our Up Next list
	updateUpNext(){

		// get upNextList form html
		let myList = $('#upNextList');

		// empty current list
		myList.empty();

		// we only want to show the next 10 songs. Variable size so we know how long to append
		let listSize = this.songList.length >= UP_NEXT_COUNT ? UP_NEXT_COUNT : this.songList.length;

		// for each song in our list, add to Up Next
		for (let i = this.counter+1; i < listSize; i++) {

			// append to our pretty table in the html
			myList.append(
				`<tr><td class=\"albumArt wrap-text\"><img src=\"${this.songList[i].smallAlbumArtURL}\" 
alt=\"Album artwork\"></td><td class=\"songName wrap-text\">
${this.songList[i].songName}</td><td class=\"artist\">${this.songList[i]
.artists[0]}</td><td class=\"wrap-text\">${this.songList[i].albumName}</td></tr>`);
		}
	}




	// update currently playing song
	// this will also probably have a sausage in it
	// WIP
	updatePlaying() {
		// the song holding the information
		if(this.counter < this.songList.length){
			let mySong = this.songList[this.counter];

			$("#songInfo").show();
			this.audio.controls = true;

			// update album art
			$('#albumArt').prop('src', mySong.largeAlbumArtURL);

			// update artist
			$('#songTitle').text(mySong.songName);

			// update album
			$('#album').text(mySong.albumName);

			$('#artist').text(mySong.artists[0]);

			this.audio.src = mySong.previewURL;
			if (!this.hasFirstSong)
				this.audio.play();
			
		} else {
			// make own div with bigger css in different place css
			$("#songInfo").hide();
			this.audio.controls = false;

		}

	}


}

