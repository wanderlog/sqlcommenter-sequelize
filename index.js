// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// This is a pared down version of the Google sqlcommenter-sequelize plugin,
// meant to comment just some relevant stacktrace.
//
// The original documentation can be found here:
// https://google.github.io/sqlcommenter/node/sequelize/
//
// The original project can be found here:
// https://github.com/google/sqlcommenter/tree/master/nodejs/sqlcommenter-nodejs/packages/sqlcommenter-sequelize

const {hasComment, makeMinimalUsefulStacktrace} = require('./util');

/**
 * Adds a comment about the stacktrace. Helps to figure out where a
 * SQL query originates.
 *
 * @param {Object} sequelize
 * @return {void}
 */
exports.wrapSequelize = (sequelize) => {

    /* c8 ignore next 2 */
    if (sequelize.___alreadySQLCommenterWrapped___)
        return;

    const run = sequelize.dialect.Query.prototype.run;

    // Please don't change this prototype from an explicit function
    // to use arrow functions lest we'll get bugs with not resolving "this".
    sequelize.dialect.Query.prototype.run = function(sql, sql_options) {

        // If a comment already exists, do not insert a new one.
        // See internal issue #20.
        if (hasComment(sql)) // Just proceed with the next function ASAP
            return run.apply(this, [sql, sql_options]);

        // Allow only alphanumeric, periods, slashes, dashes, underscores,
        // spaces, newlines. The main concern is preventing injection of '*/
        // within the stacktrace.
        const commentStr = `stacktrace='${makeMinimalUsefulStacktrace().replace(/[^\w.:/\\\-\s\n]/g, '')}'`;

        if (commentStr && commentStr.length > 0)
            sql = `${sql} /*${commentStr}*/`;

        return run.apply(this, [sql, sql_options]);
    };

    // Finally mark the object as having already been wrapped.
    sequelize.___alreadySQLCommenterWrapped___ = true;
}