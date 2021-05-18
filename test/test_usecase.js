process.env.NODE_ENV = "test";
const expect = require("chai").expect;
var rewire = require("rewire");
var usecases = rewire("../usecase.js");
const chai = require("chai"),
  spies = require("chai-spies");

chai.use(spies);

const { register, login, processPayment } = require("../usecase");

describe("Usecase TestSuite", () => {
  it("less than £20, use CheapPaymentGateway", (done) => {
    let creditCardNumber = "4003 3544 2337 0253",
      cardHolder = "Emily Phillips",
      expirationDate = "10/2023",
      securityCode = 276,
      amount = 19.55,
      user_id = 123;
    var spy = chai.spy();
    usecases.__set__("cheapPayment", spy);
    processPayment(
      creditCardNumber,
      cardHolder,
      expirationDate,
      securityCode,
      amount,
      user_id
    );
    expect(spy).to.have.been.called();
    done();
  });
  it("£21-500, use ExpensivePaymentGateway. if available.Otherwise, retry only once with CheapPaymentGateway.", (done) => {
    let creditCardNumber = "4003 3544 2337 0253",
      cardHolder = "Emily Phillips",
      expirationDate = "10/2023",
      securityCode = 276,
      amount = 21,
      user_id = 123;
    var spy = chai.spy();
    usecases.__set__("expensivePayment", spy);
    processPayment(
      creditCardNumber,
      cardHolder,
      expirationDate,
      securityCode,
      amount,
      user_id
    );
    expect(spy).to.have.been.called.once;
    var spy2 = chai.spy();
    usecases.__set__("expensivePayment", () => {
      return false;
    });
    usecases.__set__("cheapPayment", spy2);
    processPayment(
      creditCardNumber,
      cardHolder,
      expirationDate,
      securityCode,
      amount,
      user_id
    );
    expect(spy2).to.have.been.called.once;
    done();
  });
  it("> £500, try only PremiumPaymentGateway and retry up to 3 times in case payment does not get processed.", (done) => {
    let creditCardNumber = "4003 3544 2337 0253",
      cardHolder = "Emily Phillips",
      expirationDate = "10/2023",
      securityCode = 276,
      amount = 501,
      user_id = 123;
    var spy2 = chai.spy(function () {
      return true;
    });
    usecases.__set__("premiumPayment", spy2);
    processPayment(
      creditCardNumber,
      cardHolder,
      expirationDate,
      securityCode,
      amount,
      user_id
    );
    expect(spy2).to.have.been.called.once;
    var spy3 = chai.spy(function () {
      return false;
    });
    usecases.__set__("premiumPayment", spy3);
    processPayment(
      creditCardNumber,
      cardHolder,
      expirationDate,
      securityCode,
      amount,
      user_id
    );
    expect(spy3).to.have.been.called.exactly(3);
    done();
  });
  it("test all errors", (done) => {
    let creditCardNumber = "4003 3544 2337 0253",
      cardHolder = "Emily Phillips",
      expirationDate = "10/2023",
      securityCode = 276,
      amount = 123.55,
      user_id = 123;
    creditCardNumber = "4003 3544 2337 asdsadas";
    expect(function () {
      processPayment(
        creditCardNumber,
        cardHolder,
        expirationDate,
        securityCode,
        amount,
        user_id
      );
    }).to.throw(Error, "INVALID_CARD_NUMBER");
    creditCardNumber = "4003 3544 2337 0253";
    cardHolder = "";
    expect(function () {
      processPayment(
        creditCardNumber,
        cardHolder,
        expirationDate,
        securityCode,
        amount,
        user_id
      );
    }).to.throw(Error, "INVALID_CARD_HOLDER");
    cardHolder = "Emily Phillips";
    expirationDate = "10/2020";
    expect(function () {
      processPayment(
        creditCardNumber,
        cardHolder,
        expirationDate,
        securityCode,
        amount,
        user_id
      );
    }).to.throw(Error, "INVALID_EXPIRATION_DATE");
    expirationDate = "10/2023";
    amount = 0;
    expect(function () {
      processPayment(
        creditCardNumber,
        cardHolder,
        expirationDate,
        securityCode,
        amount,
        user_id
      );
    }).to.throw(Error, "INVALID_AMOUNT");
    done();
  });
});
