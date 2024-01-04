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

const chai = require('chai');
const { wrapSequelize } = require('../index');
const { makeMinimalUsefulStacktrace } = require('../util');

const expect = chai.expect;

const createFakeSequelize = () => {
    return {
        dialect: {
            Query: {
                prototype: {
                    run: (sql, _options) => {
                        return Promise.resolve(sql);
                    },
                    sequelize: {
                        config: {
                            database: 'fake',
                            client: 'fakesql',
                        },
                        options: {
                            databaseVersion: 'fakesql-server:0.0.X',
                            dialect: 'fakesql',
                            timezone: '+00:00',
                        },
                    },
                },
            },
        },
    };
};

describe('Comments for Sequelize', () => {
    const fakeSequelize = createFakeSequelize();

    before(() => {
        wrapSequelize(fakeSequelize);
    });

    describe('Cases', () => {
        it('should add comment to generated sql', (done) => {
            const want = `SELECT * FROM foo /*stacktrace='${makeMinimalUsefulStacktrace().replace(
                /[^\w.:/\\\-\s\n]/g,
                '',
            )}'*/`;
            const query = 'SELECT * FROM foo';

            fakeSequelize.dialect.Query.prototype.run(query).then((sql) => {
                expect(sql).equals(want);
            });

            done();
        });

        it('should NOT affix comments to statements with existing comments', (done) => {
            const q = [
                'SELECT * FROM people /* existing */',
                'SELECT * FROM people -- existing',
            ];

            Promise.all([
                fakeSequelize.dialect.Query.prototype.run(q[0]),
                fakeSequelize.dialect.Query.prototype.run(q[1]),
            ]).then(([a, b]) => {
                expect(a).to.equal(q[0]);
                expect(b).to.equal(q[1]);
            });

            done();
        });

        it('chaining and repeated calls should NOT indefinitely chain SQL', (done) => {
            const sql = 'SELECT * FROM foo';

            fakeSequelize.dialect.Query.prototype
                .run(sql)
                .then((a) => fakeSequelize.dialect.Query.prototype.run(a))
                .then((b) => fakeSequelize.dialect.Query.prototype.run(b))
                .then((c) => fakeSequelize.dialect.Query.prototype.run(c))
                .then((d) => {
                    expect(d.match(/\/\*/g) ?? []).to.have.length(1);
                    expect(d.match(/SELECT \* FROM foo/g) ?? []).to.have.length(1);
                })
                .then(done, done);
        });
    });
});
