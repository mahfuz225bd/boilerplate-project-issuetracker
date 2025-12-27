"use strict";

const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  project: String,
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: { type: String, default: "" },
  status_text: { type: String, default: "" },
  open: { type: Boolean, default: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
});

const Issue = mongoose.model("Issue", issueSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    /* CREATE */
    .post(async (req, res) => {
      const { issue_title, issue_text, created_by } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      try {
        const issue = new Issue({
          project: req.params.project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: req.body.assigned_to || "",
          status_text: req.body.status_text || "",
        });

        const saved = await issue.save();
        res.json(saved);
      } catch {
        res.json({ error: "required field(s) missing" });
      }
    })

    /* READ */
    .get(async (req, res) => {
      const filters = { project: req.params.project };

      Object.keys(req.query).forEach((key) => {
        filters[key] =
          key === "open" ? req.query[key] === "true" : req.query[key];
      });

      const issues = await Issue.find(filters).select("-__v");
      res.json(issues);
    })

    /* UPDATE */
    .put(async (req, res) => {
      const { _id, ...updates } = req.body;

      if (!_id) return res.json({ error: "missing _id" });

      const fields = Object.keys(updates).filter(
        (k) => updates[k] !== "" && updates[k] !== undefined
      );

      if (fields.length === 0) {
        return res.json({ error: "no update field(s) sent", _id });
      }

      updates.updated_on = new Date();

      try {
        const updated = await Issue.findOneAndUpdate(
          { _id, project: req.params.project },
          updates
        );

        if (!updated) return res.json({ error: "could not update", _id });

        res.json({ result: "successfully updated", _id });
      } catch {
        res.json({ error: "could not update", _id });
      }
    })

    /* DELETE */
    .delete(async (req, res) => {
      const { _id } = req.body;

      if (!_id) return res.json({ error: "missing _id" });

      try {
        const deleted = await Issue.findOneAndDelete({
          _id,
          project: req.params.project,
        });

        if (!deleted) return res.json({ error: "could not delete", _id });

        res.json({ result: "successfully deleted", _id });
      } catch {
        res.json({ error: "could not delete", _id });
      }
    });
};
