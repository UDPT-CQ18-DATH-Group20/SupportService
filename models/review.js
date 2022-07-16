const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = mongoose;

const reviewSchema = Schema({
    account_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    order_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    goods_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    store_id:{
        type: Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    star: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    reply: {
        type: String,
    },
    createDate: {
        type: Date,
        default: Date.now
    }
})
reviewSchema.plugin(mongoosePaginate);



const Review = mongoose.model('Review', reviewSchema)

module.exports = Review