class RequestError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   * @param {Error} cause
   */
  constructor(status, message, cause) {
    super(message);
    this.status = status || 500;
    this.cause = cause;
  }

  toLambdaResponse() {
    return {
      statusCode: this.status,
      body: JSON.stringify({ error: {
        ...this,
        message: this.message,
      }}),
    };
  }
}

/**
 * @param {Error} err
 * @return {RequestError}
 */
RequestError.from = (err) => {
  return err instanceof RequestError
    ? err
    : new InternalServerError(err.toString(), err);
};

class BadRequestError extends RequestError {
  /**
   * @param {string} message
   * @param {Error} cause
   */
  constructor(message, cause) {
    super(400, message, cause);
  }
}

class NotFoundError extends RequestError {
  /**
   * @param {string} message
   * @param {Error} cause
   */
  constructor(message, cause) {
    super(404, message, cause);
  }
}

class InternalServerError extends RequestError {
  /**
   * @param {string} message
   * @param {Error} cause
   */
  constructor(message, cause) {
    super(500, message, cause);
  }
}

module.exports = {
  RequestError,
  BadRequestError,
  NotFoundError,
  InternalServerError,
};
