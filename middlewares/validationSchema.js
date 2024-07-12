const { body } = require("express-validator");

const validationSchema = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("title is require")
      .isLength({ min: 2 })
      .withMessage("title at laest is 2 charcters"),
    body("price").notEmpty().withMessage("price is require"),
  ];
};

module.exports = {
  validationSchema,
};
