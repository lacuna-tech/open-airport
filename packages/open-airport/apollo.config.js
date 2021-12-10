const path = require('path')
module.exports = {
  client: {
    service: {
      name: 'mds-gql',
      localSchemaFile: path.resolve(__dirname, '../../schema.gql')
    }
  }
}
