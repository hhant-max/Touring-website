class ApiFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    // 1A)filter
    const queryObj = { ...this.reqQuery };
    const excluedQuery = ['page', 'sort', 'limit', 'fields'];

    excluedQuery.forEach((el) => delete queryObj[el]);
    //1B) advanced fiter
    // how query look like in MongoDB
    // { duration: { g$te: 5 }, difficulty: 'easy' }
    // quer returns
    // {} duration:{ gte: '5' }, difficulty: 'easy' }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\bgte|lte|gt|lt\b/g, (el) => `$${el}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //2) sorting
    // { difficulty: 'easy', sort: 'price,duration' }
    // MDB: {'price duration'}
    // url: sort=price,ratingsAverage
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) PAGNATION select a certain page
    const page = this.reqQuery.page * 1 || 1;
    const limit = this.reqQuery.limit * 1 || 100;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;

// exports.checkId = (req, res, next, val) => {
//   console.log(val);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'not found',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   // const body = tours.find
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({ status: 'fail', message: 'not valid body' });
//   }

//   next();
// };

/*
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
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
*/
