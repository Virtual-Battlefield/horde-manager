/**
 * Will start a buffer
 * in other word, will do an action after X ms if nothing happen to disturb the wait. Otherwise, will wait until the perform action ends
 */
export class Buffer {
	milisecond: number;
	timeout: number | null;

	constructor(milisecond = 500) {
		this.milisecond = milisecond;
		this.timeout = null;
	}

	start(callBack: () => void) {
		if (this.timeout != null) clearTimeout(this.timeout);

		// console.log("start buffer!");
		this.timeout = setTimeout(() => {
			// console.log("resolve");
			this.timeout = null;
			callBack();
		}, this.milisecond);
	}

	cancel() {
		if (this.timeout == null) return;
		clearTimeout(this.timeout);
		this.timeout = null;
		// console.log("cancel buffer");
	}
}
