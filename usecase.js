const { query } = require("./db/mysql");
const { passwordStrength } = require("check-password-strength");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var valid = require("card-validator");
const Transaction = require("./db/models/transaction");

validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

cheapPayment = (
  creditCardNumber,
  cardHolder,
  expirationDate,
  securityCode,
  amountInt
) => {
  return true;
};

expensivePayment = (
  creditCardNumber,
  cardHolder,
  expirationDate,
  securityCode,
  amountInt
) => {
  return true;
};

premiumPayment = (
  creditCardNumber,
  cardHolder,
  expirationDate,
  securityCode,
  amountInt
) => {
  return true;
};

processPayment = (
  creditCardNumber,
  cardHolder,
  expirationDate,
  securityCode,
  amount,
  user_id
) => {
  const numberValidation = valid.number(creditCardNumber);
  if (!numberValidation.isPotentiallyValid) {
    throw new Error("INVALID_CARD_NUMBER");
  }
  const holderValdation = valid.cardholderName(cardHolder);
  if (!holderValdation.isValid) {
    throw new Error("INVALID_CARD_HOLDER");
  }
  const expiryValidation = valid.expirationDate(expirationDate);
  if (!expiryValidation.isPotentiallyValid) {
    throw new Error("INVALID_EXPIRATION_DATE");
  }
  const amountInt = amount;
  if (amountInt < 1) {
    throw new Error("INVALID_AMOUNT");
  }

  let result = false;
  if (amountInt < 20) {
    result = cheapPayment(
      creditCardNumber,
      cardHolder,
      expirationDate,
      securityCode,
      amountInt
    );
  } else if (amountInt >= 20 && amountInt <= 500) {
    result = expensivePayment(
      creditCardNumber,
      cardHolder,
      expirationDate,
      securityCode,
      amountInt
    );
    if (!result) {
      result = cheapPayment(
        creditCardNumber,
        cardHolder,
        expirationDate,
        securityCode,
        amountInt
      );
    }
  } else if (amountInt > 500) {
    let tries = 0;
    while (tries < 3) {
      result = premiumPayment(
        creditCardNumber,
        cardHolder,
        expirationDate,
        securityCode,
        amountInt
      );
      if (result) {
        break;
      }
      tries += 1;
    }
  }

  const maskedNuber = "************" + creditCardNumber.substr(-4);
  const transaction = new Transaction({
    mysql_user_id: user_id,
    creditCardNumber: maskedNuber,
    amount: amountInt.toString(),
    completed: result,
  });
  transaction.save();

  return result;
};

login = async (email, password, accessTokenSecret, refreshTokenSecret) => {
  const user = await query("SELECT * from users WHERE email = ?", [email]);
  if (user.length > 0) {
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      throw new Error("LOGIN_FAILED");
    }
    const accessToken = jwt.sign({ user_id: user[0].id }, accessTokenSecret, {
      expiresIn: "20m",
    });
    const refreshToken = jwt.sign({ user_id: user[0].id }, refreshTokenSecret);
    return { accessToken: accessToken, refreshToken: refreshToken };
  } else {
    throw new Error("LOGIN_FAILED");
  }
};

register = async (email, password) => {
  if (!validateEmail(email)) {
    throw new Error("INVALID_EMAIL");
  }
  const data = await query("SELECT email author FROM users WHERE email = ?", [
    email,
  ]);
  if (data.length > 0) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }
  if (passwordStrength(password).id < 2) {
    throw new Error("WEAK_PASSWORD");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const insertQuery = await query(
    "INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())",
    [email, hashedPassword]
  );
  if (insertQuery.affectedRows < 1) {
    throw new Error("PROBLEM_WITH_QUERY");
  }
};

module.exports = {
  register,
  login,
  processPayment,
};
