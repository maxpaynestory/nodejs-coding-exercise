const express = require("express");
const api = express();
const request = require("request");
const { register, login, processPayment } = require("./usecase");
const jwt = require("express-jwt");
require("dotenv").config();

const appjwt = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

api.post("/processpayment", appjwt, async (req, res) => {
  const body = req.body;
  if (!body.creditCardNumber) {
    return res.status(400).send("creditCardNumber is missing");
  }
  if (!body.cardHolder) {
    return res.status(400).send("cardHolder is missing");
  }
  if (!body.expirationDate) {
    return res.status(400).send("expirationDate is missing");
  }
  if (!body.securityCode) {
    return res.status(400).send("securityCode is missing");
  }
  if (!body.amount) {
    return res.status(400).send("amount is missing");
  }
  try {
    await processPayment(
      body.creditCardNumber,
      body.cardHolder,
      body.expirationDate,
      body.securityCode,
      body.amount,
      req.user.user_id
    );
    return res.status(200).send('');
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

api.post("/login", async (req, res) => {
  const body = req.body;
  if (!body.email) {
    return res.status(400).send("email not provided");
  }
  if (!body.password) {
    return res.status(400).send("password is missing");
  }
  try {
    const token = await login(
      body.email,
      body.password,
      process.env.JWT_SECRET,
      process.env.REFRESH_SECRET
    );
    return res.json(token);
  } catch (err) {
    return res.status(404).send(err.message);
  }
});

api.post("/register", async (req, res) => {
  if (!req.body.email) {
    return res.status(400).send("email not provided");
  }
  if (!req.body.password) {
    return res.status(400).send("password is missing");
  }
  if (!req.body.password_confirmation) {
    return res.status(400).send("password_confirmation is missing");
  }
  if (req.body.password_confirmation !== req.body.password) {
    return res.status(400).send("Please confirm password");
  }
  try {
    await register(req.body.email, req.body.password);
    return res.status(200).send("");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = api;
