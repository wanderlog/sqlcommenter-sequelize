# sqlcommenter-sequelize

sqlcommenter is a plugin/middleware/wrapper to augment SQL statements from Sequelize.js
with comments that can be used later to correlate user code with SQL statements.

It supports Node v6 and above to use ES6 features.

This version of the plugin is a minimal specific implementation of the google-cloud 
sqlcommenter plugin. See the original documentation here: https://google.github.io/sqlcommenter/node/sequelize/

### Installation
```shell
yarn add wanderlog/sqlcommenter-sequelize
```

### Usage
```javascript
const Sequelize = requrie('sequelize');
const {wrapSequelize} = require('wanderlog/sqlcommenter-sequelize');

const db = new Sequelize({...});
wrapSequelize(db);
```
