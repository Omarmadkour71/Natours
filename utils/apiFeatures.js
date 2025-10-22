class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // a Mongoose Query (e.g., Tour.find())
    this.queryString = queryString; // the raw req.query object from Express
  }

  filter() {
    const queryObj = { ...this.queryString };
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|lte|gt|lt)\b/g,
      (el) => `$${el}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitField() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
