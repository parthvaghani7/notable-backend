const mime = require('mime-types');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

module.exports = {
  statusCode: 200,
  headers: {
    ...corsHeaders,
    'Content-Type': mime.lookup('json'),
  },
  body: {},
};
