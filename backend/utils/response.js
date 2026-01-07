// API Response utility functions

const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

const sendSuccessResponse = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

const sendErrorResponse = (res, message, statusCode = 400) => {
  return sendResponse(res, statusCode, false, message);
};

const sendCreatedResponse = (res, message, data = null) => {
  return sendResponse(res, 201, true, message, data);
};

const sendNotFoundResponse = (res, message = "Resource not found") => {
  return sendResponse(res, 404, false, message);
};

const sendUnauthorizedResponse = (res, message = "Unauthorized access") => {
  return sendResponse(res, 401, false, message);
};

const sendForbiddenResponse = (res, message = "Forbidden access") => {
  return sendResponse(res, 403, false, message);
};

const sendServerErrorResponse = (res, message = "Internal server error") => {
  return sendResponse(res, 500, false, message);
};

// Pagination utility
const getPaginationData = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Build pagination response
const buildPaginationResponse = (data, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage,
      hasPreviousPage,
    },
  };
};

module.exports = {
  sendResponse,
  sendSuccessResponse,
  sendErrorResponse,
  sendCreatedResponse,
  sendNotFoundResponse,
  sendUnauthorizedResponse,
  sendForbiddenResponse,
  sendServerErrorResponse,
  getPaginationData,
  buildPaginationResponse,
};
