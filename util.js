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

/**
 * Inspects the provided sql statement for existing comments.
 * 
 * @param {String} sql The SQL string to inspect
 * @return {Boolean} true if a comment exists, false otherwise
 */
exports.hasComment = (sql) => {

    if (!sql)
        return false;

    // See https://docs.oracle.com/cd/B12037_01/server.101/b10759/sql_elements006.htm
    // for how to detect comments.
    const indexOpeningDashDashComment = sql.indexOf('--');
    if (indexOpeningDashDashComment >= 0)
        return true;

    const indexOpeningSlashComment = sql.indexOf('/*');
    if (indexOpeningSlashComment < 0)
        return false;

    // Check if it is a well formed comment.
    const indexClosingSlashComment = sql.indexOf('*/');

    /* c8 ignore next */
    return indexOpeningSlashComment < indexClosingSlashComment;
}

/**
 * Create a stacktrace summary context useful for figuring out where
 * Sequelize queries originate.
 */
exports.makeMinimalUsefulStacktrace = () => {
    const stacktrace = new Error().stack;

    // Most Sequelize queries contain something of the form "at Function.{query}",
    // e.g. "at Function.findAll". This is a hint to help us find useful
    // context.
    const indexOfUsefulInfoForQuery = stacktrace.lastIndexOf('node_modules/');
    let minimalUsefulStacktrace = stacktrace.slice(
        indexOfUsefulInfoForQuery >= 0
            ? indexOfUsefulInfoForQuery
            : stacktrace.indexOf('at'),
    );

    // Only get about 4 lines of context
    minimalUsefulStacktrace = minimalUsefulStacktrace
        .split('\n')
        .slice(1, 5)
        .map((stackLine) => stackLine.trim())
        .join('\n');

    return minimalUsefulStacktrace;
}
