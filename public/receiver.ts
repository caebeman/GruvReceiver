/// <reference path="typings/globals/jquery/index.d.ts" />
/*// <reference path="../public/node_modules/spotify-web-api-js/src/typings/spotify-web-api.d.ts" /> */
/* /// <reference path="typings/index.d.ts" /> */

const NAMESPACE = 'urn:x-cast:com.gruvcast.gruvcast';
const UP_NEXT_COUNT:number = 10;
const NO_SONGS = "No songs in playlist, add more."

// import SpotifyWebApi = require("./node_modules/spotify-web-api-js/src/spotify-web-api");

enum CMD_TYPE {CMD_ADD_SONG, CMD_DELETE_SONG, CMD_UPDATE_PLAYLIST, CMD_PLAY, CMD_PAUSE, CMD_CHANGE_ADMIN,
    CMD_IMPORT_PLAYLIST, CMD_SKIP, CMD_INITIALIZE_SENDER, CMD_END_SESSION}
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


class Message{
	public command: string;
	public song: Song;
	public newAdmin: String;
	public isAdmin: boolean;
	public updatedPlaylist: Array<Song>;


	constructor(cmd: CMD_TYPE, songList:Array<Song>=null){
		this.command = CMD_TYPE[cmd];
		this.updatedPlaylist = songList;
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
		// Init receiver handlers
		this.initConnectionListeners();

		// ....

		
		// Init message listeners
		this.initMessageListeners();


		//
		this.initMediaEventListeners();
		// need to call this after delcaring our namespace
		this.receiverManager.start();



		


		
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
		    case CMD_TYPE[CMD_TYPE.CMD_PLAY]: 
		    	this.play();
		    	break;
		    case CMD_TYPE[CMD_TYPE.CMD_PAUSE]:
		    	this.pause();
		    	break;
    		case CMD_TYPE[CMD_TYPE.CMD_SKIP]: 
    			this.skipSong();
    			break;
			case CMD_TYPE[CMD_TYPE.CMD_IMPORT_PLAYLIST]:
				this.importPlaylist(event.data.updatedPlaylist);
				break;
			case CMD_TYPE[CMD_TYPE.CMD_END_SESSION]:
				console.log("End session");
				this.receiverManager.stop();
				break;
		    default:
		    	// do nothing
		    	// the message must have gotten corrupted some how
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
			// needs to be set here, is checked in updatePlaying
			this.hasFirstSong = true;
		}
		this.updateUpNext();
		this.sendPlayList();
	}	

	// create new list of songs, not including the item to be deleted.
	// update our list of songs to this new list of songs
	deleteSong(delSong:Song){
		if(this.counter == this.songList.length - 1){
			this.skipSong();
		} else {
			let newList:Array<Song> = new Array<Song>();
			for(let i = 0; i < this.songList.length; i++){
				if(this.songList[i].songID != delSong.songID){
					newList.push(this.songList[i])
				}
			}
			this.songList = newList;
			this.sendPlayList();
			this.updateUpNext();
		}
	}


	/*
		Update our spot in the list (increment our counter)
		Update the song that will be playing
		Update our upNext
	 */
	skipSong(){
		this.counter++;
		if(this.counter == this.songList.length){
			this.audio.pause();
			this.hasFirstSong = false;
		}
		this.updatePlaying(); 
		this.updateUpNext();
		this.sendPlayList();
	}


	play(){
		this.audio.play();
	}

	pause(){
		this.audio.pause();
	}

	importPlaylist(songs:Array<Song>){
		// TODO
		// use event.data.
		for( let i = 0; i < songs.length; i++ ){
			let song:Song = songs[i];
			if(song.previewURL.charAt(song.previewURL.length-1) == '/'){
				song.previewURL = song.previewURL.substring(0,song.previewURL.length-1);
			}
			if(song.smallAlbumArtURL.charAt(song.smallAlbumArtURL.length-1) == '/'){
				song.smallAlbumArtURL = song.smallAlbumArtURL.substring(0,song.smallAlbumArtURL.length-1);
			}
			if(song.largeAlbumArtURL.charAt(song.largeAlbumArtURL.length-1) == '/'){
				song.largeAlbumArtURL = song.largeAlbumArtURL.substring(0,song.largeAlbumArtURL.length-1);
			}	
			songs[i] = song;
		}

		
		// add the song, and update the display
		this.songList = this.songList.concat(songs);
		let song:Song = this.songList[this.counter];

		if(!this.hasFirstSong){
			$("#songInfo").show();
			this.audio.src = song.previewURL;
			this.updatePlaying();
			// needs to be set here, is checked in updatePlaying
			this.hasFirstSong = true;
		}
		this.updateUpNext();
		this.sendPlayList();
	}

	changeAdmin(){
		/*
			2

			need to test to see how often device disconnect from cc
			might need some fancy shit to make sure admin doesn't lose priviledges randomly

			pick the best one based on how cc sessions work, 2nd is probably easier

			Proposed Solns:

			1:
				Send message to curAdmin trying to remove admin 
				curAdmin can either respond withtin ~10 second or new admin is selected
					what happens if admin is disconnected right when message is sent? 
						retry after a second or 2?
					do messages get queued for after reconnect?
						no need to retry
						this is what we hopefor
				send message to new Admin telling them their new status

			2:
				admin sends message everytime they reconnect saying they are still admin
				if they disconnect and dont send a message for 30 seconds choose new admin
					how choose new admin, want a way to select

				need to check if disconnect when phone is off how to get aroudn that
					if phone is 'sleeping' can still send messages saying they need admin


			
		*/

		let newAdmin = this.receiverManager.getSenders()[1];
		let m: Message = new Message(CMD_TYPE.CMD_CHANGE_ADMIN);
		// m.isAdmin = false;
		// this.messageBus.send(this.admin, m);
		// m.isAdmin = true;
		this.messageBus.send(newAdmin, m);
	}


	// audio event listeners
	initMediaEventListeners() {
		this.audio = <HTMLMediaElement> $('#audioPlayer').get(0); 
		this.audio.autoplay = true;
		this.audio.controls = true;
		this.audio.preload = 'auto';
		this.audio.addEventListener('error', (error) => {
			console.log('Error');
			this.counter++;
			this.updateUpNext();
			this.updatePlaying();
			this.sendPlayList();
			// need to reset this so we add a new song it updates the song to play as well as the display
			if(this.counter == this.songList.length){
				this.hasFirstSong = false;
			}
		}); 
		this.audio.addEventListener('playing', () => {
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
			this.sendPlayList();
			// need to reset this so we add a new song it updates the song to play as well as the display
			if(this.counter == this.songList.length){
				this.hasFirstSong = false;
			}
		});

	}

	initMessageListeners() {
		this.messageBus.onMessage = (event) => this.onMessage(event);
	}

	initConnectionListeners() {
		this.receiverManager.onSenderConnected = (event) => this.onSenderConnected(event);
		this.receiverManager.onSenderDisconnected = (event) => this.onSenderDisconnected(event);
		this.receiverManager.onShutdown = (event) => this.onShutdown(event);
	}


	songEndingListener() {

	}

	


	// init our playlist queue here
	// determine who is admin
	onSenderConnected(event:any) {
		let m: Message = new Message(CMD_TYPE.CMD_INITIALIZE_SENDER, this.songList.slice(this.counter));
		console.log("Sender connected: " + event.senderId);
		console.log("Current Admin: " + this.admin);
		// wait a bit before sending the message
		setTimeout(()=>{}, 3000);
		console.log("Current time: " + new Date());
		if(!this.admin || this.admin == event.senderId){
			m.isAdmin = true;
			this.messageBus.send(event.senderId, m);
			this.admin = event.senderId;
		} else {
			this.messageBus.send(event.senderId, m);
		}
		
	}

	onSenderDisconnected(event: any) {
		console.log("sender disconnected # connected: " + this.receiverManager.getSenders().length);
		// only exit if we have no senders left and the last sender chose to disconnect
		if(this.receiverManager.getSenders().length === 0 
			&& event.reason === this.cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER){
			this.receiverManager.stop();
		}
		if(this.admin == event.senderId){
			this.admin = this.receiverManager.getSenders()[0];
			let m = new Message(CMD_TYPE.CMD_CHANGE_ADMIN, this.songList.slice(this.counter));
			m.isAdmin = true;
			this.messageBus.send(this.admin, m);
		}
		// TODO change this later for actual admin logic
		// if(event.senderId == this.admin){
		// 	// this.admin = null;
		// }
		// this.receiverManager.stop();
	}


	onShutdown(event: any) {
		event.preventDefault();
		console.log("Trying to shutdown");
		return;
	}

	sendPlayList() {
		let m: Message = new Message(CMD_TYPE.CMD_UPDATE_PLAYLIST, this.songList.slice(this.counter));
		this.messageBus.broadcast(m);
	}

	// update our Up Next list
	updateUpNext(){

		// get upNextList form html
		let myList = $('#upNextList');

		// empty current list
		myList.empty();

		// we only want to show the next 10 songs. Variable size so we know how long to append
		let listSize = ((this.songList.length - this.counter) >= UP_NEXT_COUNT)	 ? UP_NEXT_COUNT : this.songList.length - this.counter;

		// for each song in our list, add to Up Next
		for (let i = this.counter+1; i < this.counter + listSize; i++) {

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
			$('#noSongs').text('');
			this.audio.src = mySong.previewURL;

			if(this.hasFirstSong)
				this.audio.play();
			
		} else {
			// make own div with bigger css in different place css
			$("#songInfo").hide();
			$('#albumArt').prop('src', 'css/assets/not_playing.png');
			$('#noSongs').text(NO_SONGS);
			this.audio.controls = false;


		}

	}


}

