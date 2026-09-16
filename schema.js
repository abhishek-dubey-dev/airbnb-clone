const joi = require("joi");

module.exports.listingSchema = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  location: joi.string().required(),
  country: joi.string().required(),
  price: joi.number().required().min(1),
  image: joi.alternatives().try(
    joi.string().uri(),
    joi.object({ filename: joi.string().required(), url: joi.string().uri().required() }),
  ).optional().allow(null),
  geometry: joi.object({
    type: joi.string().valid("Point").optional(),
    coordinates: joi.array().items(joi.number()).length(2).optional(),
  }).optional(),
});

module.exports.reviewSchema = joi.object({
  review: joi.object({
    comment: joi.string().required(),
    rating: joi.number().required().min(1).max(5),
  }).required(),
});