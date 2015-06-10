var ArrayBuffer = function(_name, _output) {
    this.name = _name;
    this.buffer = [];
    this.bufferLength = 1000;
    this.pushedFirstItem = false;
    this.output = _output;
    this.flushCount = 0;

    this.push = function(value) {

        this.buffer.push(value);

        if (this.buffer.length === this.bufferLength) {
            this.flush();
        }
    };

    this.flush = function() {
        this.flushCount++;
        if (this.pushedFirstItem) {
            this.output.write(',');
            this.output.write(this.buffer.join(','));
        }
        else {
            this.output.write(this.name + ':[');
            this.output.write(this.buffer.join(','));
        }
        this.pushedFirstItem = true;
        this.buffer.length = 0;
    };

    this.end = function() {
        this.flush();
        this.output.write(']');
    };
};

module.exports = ArrayBuffer;