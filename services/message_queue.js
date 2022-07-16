const amqp = require("amqplib/callback_api");
const reviewService = require("../services/reviewService");

var amqpConn = null;
const EXCHANGE = "support_service";
const BINDING_KEY = "add_comment";
const QUEUE = "new_comment";
const DURABLE = false;

const USER = "freshshop";
const PASS = "udpt17";
const HOST = "localhost";
const PORT = "5672";

exports.start = start;

function start() {
  amqp.connect(
    `amqp://${USER}:${PASS}@${HOST}:${PORT}/` + "?heartbeat=60",
    function (err, conn) {
      if (err) {
        console.error("[AMQP]", err.message);
        return setTimeout(start, 100);
      }

      conn.on("error", function (err) {
        if (err !== "Connection closing") {
          console.error("[AMQP] error", err.message);
        }
      });

      conn.on("close", function () {
        console.error("[AMQP] reconnecting");
        return setTimeout(start, 100);
      });

      console.log("[AMQP] connected");
      amqpConn = conn;

      whenConnecting();
    }
  );
}

function whenConnecting() {
  startNewItemQueue();
}

function startNewItemQueue() {
  amqpConn.createChannel(function (err, channel) {
    if (closeOnError(err)) return;

    channel.on("error", function (err) {
      console.error("[AMQP] channel eror", err.message);
    });

    channel.on("close", function () {
      console.log("[AMQP] connection closed");
    });

    channel.prefetch(1);

    channel.assertExchange(EXCHANGE, "direct", {
      durable: DURABLE,
    });

    channel.assertQueue(
      QUEUE,
      {
        durable: DURABLE,
      },
      function (err, q) {
        if (closeOnError(err)) return;

        channel.bindQueue(q.queue, EXCHANGE, BINDING_KEY);

        channel.consume(q.queue, processMessage, { noAck: false });
        console.log('"comment" queue started');

        async function processMessage(msg) {
          var content = JSON.parse(msg.content.toString());
          var order_id = content.order_id;
          var goods_id = content.goods_id;
          var star = Number(content.star);
          var comment = content.comment;
          var account_id = content.account_id;
          const flag = await reviewService.addComment(order_id, goods_id, star, comment, account_id);
          try {
            if (flag === true) {
              channel.ack(msg);
              console.log("Item has been add comment");
            } else {
              console.log('Invalid message to "comment" queue!');
              channel.reject(msg, false);
            }
          } catch (e) {
            closeOnError(e);
          }
        }
      }
    );
  });
}

function closeOnError(err) {
  if (!err) return false;

  console.log("[AMQP] error", err);
  amqpConn.close();
  return true;
}
