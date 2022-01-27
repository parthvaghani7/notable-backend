const aws = require('aws-sdk');

const response = require('../lib/response');
const { BadRequestError, NotFoundError, RequestError } = require('../lib/errors');

const ddb = new aws.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });
aws.config.update({ region: process.env.REGION });

const users = {
  signUp: async (event) => {
    if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') return event;

    const username = event.request.userName || event.userName;
    if (!username) return event;

    // https://www.serverless.com/framework/docs/providers/aws/events/cognito-user-pool/

    try {
      const user = {
        TableName: process.env.USER_TABLE,
        Item: {
          username: username,
          email: event.request.userAttributes.email,
        }
      };
      await ddb.put(user).promise();
      console.log(`Created user: ${username}`);
    } catch (err) {
      console.error(err);
    }

    return event;
  },
  list: async () => {
    try {
      const users = await ddb.scan({
        TableName: process.env.USER_TABLE,
        ProjectionExpression: 'username, email, bio, social, #permissions',
        ExpressionAttributeNames: {
          '#permissions': 'permissions',
        },
      }).promise();
      return { ...response, body: JSON.stringify(users.Items) };
    } catch (err) {
      return { ...response, ...RequestError.from(err).toLambdaResponse() };
    }
  },
  describe: async (event) => {
    try {
      if (!event.pathParameters || !event.pathParameters.email) {
        throw new BadRequestError('Missing required `email` path parameter');
      }
      const { email } = event.pathParameters;
      const result = await ddb.get({
        TableName: process.env.USER_TABLE,
        Key: { email },
      }).promise();
      if (!result.Item) throw new NotFoundError();

      return { ...response, body: JSON.stringify(result.Item) };
    } catch (err) {
      return { ...response, ...RequestError.from(err).toLambdaResponse() };
    }
  },
  update: async (event) => {
    try {
      const email = (event.pathParameters && event.pathParameters.email)
      if (!email) throw new BadRequestError('Missing required `email` path parameter');

      if (!event.body) throw new BadRequestError('Missing request payload');
      const data = JSON.parse(event.body);

      const user = await ddb.get({
        TableName: process.env.USER_TABLE,
        Key: { email },
      }).promise();
      if (!user.Item) throw new NotFoundError('User not found');

      let UpdateExpression = 'set';
      const ExpressionAttributeValues = {};
      const ExpressionAttributeNames = {};

      Object.keys(data).forEach(key => {
        UpdateExpression = `${UpdateExpression} #${key} = :${key},`;
        ExpressionAttributeValues[`:${key}`] = data[key];
        ExpressionAttributeNames[`#${key}`] = key;
      });
      const index = UpdateExpression.length - 1;
      UpdateExpression = UpdateExpression.substr(0, index);

      if (Object.keys(ExpressionAttributeNames).length === 0) return {
        ...response, body: JSON.stringify(user.Item),
      };

      const update = await ddb.update({
        TableName: process.env.USER_TABLE,
        Key: { email },
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames,
      }).promise();

      return { ...response, body: JSON.stringify({
        ...user.Item,
        ...data,
      }) };
    } catch (err) {
      return { ...response, ...RequestError.from(err).toLambdaResponse() };
    }
  },
};

module.exports = users;
