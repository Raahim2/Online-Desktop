class Timer {
    constructor(onUpdateCallback, onEndCallback) {
        if (typeof onUpdateCallback !== 'function' || typeof onEndCallback !== 'function') {
            throw new Error("Timer requires valid onUpdate and onEnd callback functions.");
        }
        this.onUpdate = onUpdateCallback;
        this.onEnd = onEndCallback;
        this.intervalId = null;
        this.endTime = null;
        this.duration = 0; // Store the duration for potential resets
    }

    startOrReset(durationSeconds) {
        this.stop(); // Clear any existing timer

        if (durationSeconds <= 0) {
            console.warn("Timer duration must be positive.");
            return;
        }

        this.duration = durationSeconds;
        this.endTime = Date.now() + durationSeconds * 1000;

        // Initial update call
        this.update();

        // Set interval to check every second
        this.intervalId = setInterval(() => {
            this.update();
        }, 1000);

        console.log(`Timer started for ${durationSeconds} seconds.`);
    }

    update() {
        const now = Date.now();
        const timeLeftMillis = this.endTime - now;
        const timeLeftSeconds = Math.max(0, Math.ceil(timeLeftMillis / 1000)); // Use ceil to show '1' until it truly hits 0

        this.onUpdate(timeLeftSeconds);

        if (timeLeftMillis <= 0) {
            this.stop(true); // Pass true to indicate it ended naturally
        }
    }

    stop(triggeredEnd = false) {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.endTime = null;
            if (triggeredEnd) {
                this.onEnd(); // Call the end callback only if time ran out
                console.log("Timer finished.");
            } else {
                console.log("Timer stopped manually.");
            }
        }
    }

    isRunning() {
        return this.intervalId !== null;
    }
}