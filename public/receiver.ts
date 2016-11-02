
const NAMESPACE = 'urn:x-cast:com.gruvcast.gruvcast';

export default class GruvReceiver {
	// html audio element
	private mediaElement: HTMLAudioElement; // html audio element

	public receiverManager: any;
	public messageBus: any;

	// use spotify user??
	private admin: any;

	// hold songs
	private songList: Array<any> = new Array<any>();

	constructor(private element:HTMLElement, private cast) {
		this.mediaElement = this.element.querySelector('audio');
		this.initListeners();

		this.receiverManager = cast.receiver.CastReceiverManager.getInstance();
		this.messageBus = this.receiverManager.getCastMessageBus(NAMESPACE, cast.receiver.CastMessageBus.MessageType.JSON);
		this.receiverManager.onReceiverConnected = this.onSenderConnected;
		console.log("Got receiver: " + this.messageBus);
	}

	// audio event listeners
	initListeners() {
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
	// init our playlist queue here
	// determine who is admin
	onSenderConnected(event:any) {

	}

	// other functions taht we need to define

}