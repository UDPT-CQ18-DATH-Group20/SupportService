const Review = require('../models/review')
exports.addComment = async function (order_id, goods_id, star, comment, account_id) {
    const review = Review.findOne({ order_id: order_id, goods_id: goods_id })
    if (!review) {
        review.star = star
        review.comment = comment
        review.account_id = account_id
        await review.save()
        return true
    }
    return false
};