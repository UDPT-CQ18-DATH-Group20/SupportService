
const Review = require("../models/review")
var axios = require('axios');


module.exports = {
    findCommentByProduct: async (req, res, next) => {

        const page = req.body.page || 1

        const myCustomLabels = {
            totalDocs: 'itemCount',
            docs: 'itemsList',
            limit: 'perPage',
            page: 'currentPage',
            totalPages: 'pageCount',
            pagingCounter: 'slNo',
        };

        const options = {
            page: page,
            limit: 5,
            customLabels: myCustomLabels,
        };
        Review.paginate({ goods_id: req.body.goods_id }, options, function (err, result) {
            res.send(result);
        });
    },
    findCommentByStore: async (req, res) => {
        req.user._id
        var config = {
            method: 'get',
            url: "http://host.docker.internal:3001/api/store",
            headers: { 
                'Authorization': 'Bearer '+ req.token
            } 
            
        };
        const store = (await axios(config)).data
        const reviews = await Review.find({ store_id: store._id });
        res.send(reviews)
    },
    createComment: async (req, res) => {

        const { order_id, goods_id, star, comment } = req.body
        const account_id = req.user._id
        console.log(req.body)
        //check order_id vs goods_id
        //
        //--------------------------
        let review = await Review.findOne({ order_id: order_id, goods_id: goods_id })
        if (!review) {
            review = new Review()
            //find productdetail
            var config = {
                method: 'get',
                url: 'http://host.docker.internal:3001/api/goods/' + goods_id,
            };
            const product = (await axios(config)).data
            var config = {
                method: 'get',
                url: 'http://host.docker.internal:3000/users/get/' + account_id,
            };
            const account = (await axios(config)).data
            review.order_id = order_id
            review.goods_id = goods_id
            review.star = star
            review.comment = comment
            review.account_id = account_id
            review.name = account.account_info.name
            review.store_id = product.store_id._id
            await review.save()

        }
        var config = {
            method: 'post',
            url: "http://host.docker.internal:3003/orders/update/comment",
            headers: { 
                'Authorization': 'Bearer '+ req.token
            },
            data:{
                order_id:order_id,
                goods_id:goods_id
            }
        };
        const order = (await axios(config)).data
        //const review = new Review({ account_id, order_id, goods_id, star, comment })
        
        res.send(review);
    },
    replyComment: async (req, res) => {
        try {
            const { comment_id, reply } = req.body
            console.log(comment_id)

            const review = await Review.findById(comment_id)
            if (!review) {
                throw new Error();
            }
            review.reply = reply
            await review.save()
            res.send(review);
        } catch (error) {
            res.status(400).send("Thông tin không hợp lệ")
        }
    }
};