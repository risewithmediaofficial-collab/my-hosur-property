const { validationResult } = require("express-validator");

const formatValidationErrors = (errors) => {
  return errors.map((err) => {
    const field = err.path || err.param || "Field";
    return `${field}: ${err.msg}`;
  });
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const formatted = formatValidationErrors(errorArray);
    return res.status(422).json({
      message: `Validation failed: ${formatted.join("; ")}`,
      errors: errorArray,
      errorDetails: formatted,
    });
  }
  return next();
};

module.exports = validate;
