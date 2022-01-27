const aws = require('aws-sdk');

const response = require('../lib/response');
const { BadRequestError, NotFoundError, RequestError } = require('../lib/errors');

const ddb = new aws.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });
aws.config.update({ region: process.env.REGION });

const collections = {
  list: async () => {
    try {
      const collections = await ddb.scan({
        TableName: process.env.COLLECTION_TABLE,
        ProjectionExpression: 'slug',
      }).promise();
      return { ...response, body: JSON.stringify(collections.Items) };
    } catch (err) {
      return { ...response, ...RequestError.from(err).toLambdaResponse() };
    }
  },
  create: async (event) => {
    const hasHostHeader = event.headers && event.headers.Host && event.headers.Host.length;

    try {
      const data = JSON.parse(event.body);
      if (!data || !data.slug) {
        return new BadRequestError('Missing required `slug` property').toLambdaResponse();
      }
      const { slug } = data;

      const extantCollection = await ddb.get({
        TableName: process.env.COLLECTION_TABLE,
        Key: { slug },
      }).promise();
      if (extantCollection.Item) {
        delete response.headers['Content-Type'];
        delete response.body;
        if (hasHostHeader) {
          response.headers.Location = `https://${event.headers.Host}/${process.env.STAGE}/collections`;
        }
        return { ...response, statusCode: 303 };
      }

      const collection = {
        TableName: process.env.COLLECTION_TABLE,
        Item: { slug },
      };
      await ddb.put(collection).promise();
      if (hasHostHeader) {
        response.headers.Location = `https://${event.headers.Host}/${process.env.STAGE}/collections`;
      }
      return {
        ...response,
        statusCode: 201,
        body: JSON.stringify({ slug }),
      };
    } catch (err) {
      console.error(err);
      return { ...response, ...RequestError.from(err).toLambdaResponse() };
    }
  },
  delete: async (event) => {
    try {
      if (!event.pathParameters || !event.pathParameters.slug) {
        throw new BadRequestError('Missing required `slug` path parameter');
      }
      const { slug } = event.pathParameters;
      const collection = {
        TableName: process.env.COLLECTION_TABLE,
        Key: { slug },
      }
      const extantCollection = await ddb.get(collection).promise();
      if (!extantCollection.Item) throw new NotFoundError();
      await ddb.delete(collection).promise();
      delete response.headers['Content-Type'];
      delete response.body;
      return { ...response, statusCode: 204 };
    } catch (err) {
      console.error(err);
      return { ...response, ...RequestError.from(err).toLambdaResponse() };
    }
  }
};

module.exports = collections;
