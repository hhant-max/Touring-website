const catchAsync = require('../utils/catchAync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

//get tour
//populatsions includes populate
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //EXECUTE QUERY
    // let apifeatures = new ApiFeatures(Tour.find(), req.query);
    // apifeatures = apifeatures.filter().sort().limiFields().paginate();

    // const query = new ApiFeatures(Tour.find(), req.query)
    //   .filter()
    //   .sort()
    //   .limitFields();
    // const tour = await query;
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      data: {
        length: doc.length,
        data: doc,
      },
    });
  });

exports.getOne = (Model, populatsQuery) =>
  catchAsync(async (req, res, next) => {
    // console.log('ready to get tour');
    // if (populationOption) {
    //   const doc = .populate('reviews');
    // } else {
    //   const doc = await Model.findById(req.params.id);
    // }
    // correct using
    let query = await Model.findById(req.params.id);
    // if (populatsQuery) {
    //   const doc = await query.populate(populatsQuery);
    // } else {
    //   const doc = await query;
    // }
    if (populatsQuery) query = query.populate(populatsQuery);
    const doc = await query;

    if (!doc) {
      return next(new AppError('your doc is not found', 404));
    }
    // console.log(tour);
    res.status(200).json({
      status: 'success',
      // data: {
      //   data: doc,
      // },
      data: doc,
    });
  });

//create
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: newDoc,
    });
  });

//update
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

//delete tour
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('no document for that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });
