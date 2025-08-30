export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {


    const formattedErrors = result.error?.issues?.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })) || [];

    return res.status(400).json({
      message: 'Validation error',
      errors: formattedErrors,
    });
  }

  req.body = result.data;
  next();
};
