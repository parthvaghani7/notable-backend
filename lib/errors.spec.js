const assert = require('assert');
const errors = require('./errors');

const err = new errors.RequestError();
const badRequest = new errors.BadRequestError();
const notFound = new errors.NotFoundError();
const internalServerError = new errors.InternalServerError();

assert(err.status === 500);
assert(badRequest.status === 400);
assert(notFound.status === 404);
assert(internalServerError.status === 500);

assert(err.toLambdaResponse().statusCode === 500);
assert(badRequest.toLambdaResponse().statusCode === 400);
assert(notFound.toLambdaResponse().statusCode === 404);
assert(internalServerError.toLambdaResponse().statusCode === 500);
