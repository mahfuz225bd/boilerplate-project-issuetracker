const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");

const assert = chai.assert;
chai.use(chaiHttp);

suite("Functional Tests", function () {
  const project = "test-project";
  let issueId;

  suite("POST /api/issues/{project}", function () {
    test("Create an issue with every field", function (done) {
      chai
        .request(server)
        .post(`/api/issues/${project}`)
        .send({
          issue_title: "Full Issue",
          issue_text: "Issue with all fields",
          created_by: "Tester",
          assigned_to: "Dev",
          status_text: "In QA",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "_id");
          assert.equal(res.body.issue_title, "Full Issue");
          assert.equal(res.body.issue_text, "Issue with all fields");
          assert.equal(res.body.created_by, "Tester");
          assert.equal(res.body.assigned_to, "Dev");
          assert.equal(res.body.status_text, "In QA");
          assert.property(res.body, "created_on");
          assert.property(res.body, "updated_on");
          assert.isTrue(res.body.open);
          issueId = res.body._id;
          done();
        });
    });

    test("Create an issue with only required fields", function (done) {
      chai
        .request(server)
        .post(`/api/issues/${project}`)
        .send({
          issue_title: "Required Only",
          issue_text: "Only required fields",
          created_by: "Tester",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          done();
        });
    });

    test("Create an issue with missing required fields", function (done) {
      chai
        .request(server)
        .post(`/api/issues/${project}`)
        .send({
          issue_title: "Missing fields",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "required field(s) missing" });
          done();
        });
    });
  });

  suite("GET /api/issues/{project}", function () {
    test("View issues on a project", function (done) {
      chai
        .request(server)
        .get(`/api/issues/${project}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], "_id");
          done();
        });
    });

    test("View issues on a project with one filter", function (done) {
      chai
        .request(server)
        .get(`/api/issues/${project}?open=true`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue) => assert.isTrue(issue.open));
          done();
        });
    });

    test("View issues on a project with multiple filters", function (done) {
      chai
        .request(server)
        .get(`/api/issues/${project}?open=true&created_by=Tester`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  });

  suite("PUT /api/issues/{project}", function () {
    test("Update one field on an issue", function (done) {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({
          _id: issueId,
          issue_text: "Updated text",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            result: "successfully updated",
            _id: issueId,
          });
          done();
        });
    });

    test("Update multiple fields on an issue", function (done) {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({
          _id: issueId,
          issue_title: "Updated title",
          assigned_to: "New Dev",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });

    test("Update an issue with missing _id", function (done) {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({
          issue_title: "No ID",
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "missing _id" });
          done();
        });
    });

    test("Update an issue with no fields to update", function (done) {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({ _id: issueId })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: "no update field(s) sent",
            _id: issueId,
          });
          done();
        });
    });

    test("Update an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({
          _id: "invalidid",
          issue_text: "Fail",
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: "could not update",
            _id: "invalidid",
          });
          done();
        });
    });
  });

  suite("DELETE /api/issues/{project}", function () {
    test("Delete an issue", function (done) {
      chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send({ _id: issueId })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: "successfully deleted",
            _id: issueId,
          });
          done();
        });
    });

    test("Delete an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send({ _id: "invalidid" })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: "could not delete",
            _id: "invalidid",
          });
          done();
        });
    });

    test("Delete an issue with missing _id", function (done) {
      chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send({})
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "missing _id" });
          done();
        });
    });
  });
});
