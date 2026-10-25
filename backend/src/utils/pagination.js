'use strict';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPaginationResponse = (page, limit, total) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
});

module.exports = { parsePagination, buildPaginationResponse };
