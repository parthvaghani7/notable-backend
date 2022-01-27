# Notables Service APIs

_If this is your first time with Serverless.com framework, we recommend that you run through with a [quick introduction](https://www.serverless.com/framework/docs/providers/aws/guide/intro/) to get some hands on familiarity with it._

---

## Development

### Dependencies

- Node.js >= 12.x
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

### Workspace Setup

AWS Region: us-east-1
AWS Services: CloudFormation, Lambda, API Gateway, DynamoDB

Follow the steps below to setup your local development environment.

1. `aws configure --profile notables-api`
2. Enter the `serverless-admin` AWS user keys:
    - AWS Access Key ID
    - AWS Secret Access Key
    - Default region name: `us-east-1`
    - Default output format: `json`
3. Commit local changes, and get them code-reviewed
4. `npm install`

### Testing

Use the [Serverless invoke command](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#profile-in-place-with-the-invoke-local-command) to test lambda's locally.

- `npm run test:usersList`
- `npm run test:usersDescribe`

## Deployment

`npx serverless deploy`
