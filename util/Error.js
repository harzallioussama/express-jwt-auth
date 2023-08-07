class error extends Error {
  // this.message = message ;
  constructor(status, message, statusCode) {
    super(message);
    this.status = status;
    this.statusCode = statusCode;
    this.op = true;
  }
}

module.exports = error;
