const app = require("express")();
const http = require("http").createServer(app);
const PORT = require("./config/config").port;
const io = require("socket.io")(http);

let user_connect = 0;
let p_seconds = 0;
let p_miseconds = 0;
let ammoCount = 0;
let random_pos = 0;
const rollList = [];
const betsololist = [];

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

http.listen(PORT, () => {
  console.log(`Chat server on *:${PORT}`);
  playgamb();
});

startTime = () => {
  const blk_width = 100 / 10;
  let val = "";
  let bkcolor = "";
  let b_title = "";
  if (rollList.length > 9) {
    rollList.shift();
  }
  const randompos = Math.random() * (100.0 - 0.0) + 0;
  if (randompos <= blk_width || randompos > blk_width * 9) {
    rollList.push({
      val: "2.75",
      bkcolor: "rgb(248, 191, 96)",
      b_title: "bonus",
    });
    val = "2.75";
    bkcolor = "rgb(248, 191, 96)";
    b_title = "bonus";
  } else if (randompos > blk_width && randompos <= blk_width * 3) {
    rollList.push({
      val: "25.55",
      bkcolor: "rgb(41, 149, 189)",
      b_title: "",
    });
    val = "25.55";
    bkcolor = "rgb(41, 149, 189)";
    b_title = "";
  } else if (randompos > blk_width * 3 && randompos <= blk_width * 5) {
    sel_blk = "pink";
    rollList.push({
      val: "200.5",
      bkcolor: "rgb(175, 96, 248)",
      b_title: "",
    });
    val = "200.5";
    bkcolor = "rgb(175, 96, 248)";
    b_title = "";
  } else if (randompos > blk_width * 5 && randompos <= blk_width * 7) {
    sel_blk = "green";
    rollList.push({
      val: "75.84",
      bkcolor: "rgb(41, 136, 84)",
      b_title: "",
    });
    val = "75.84";
    bkcolor = "rgb(41, 136, 84)";
    b_title = "";
  } else if (randompos > blk_width * 7 && randompos <= blk_width * 9) {
    sel_blk = "white";
    rollList.push({
      val: "7.25",
      bkcolor: "#fff",
      b_title: "",
    });
    val = "7.25";
    bkcolor = "#fff";
    b_title = "";
  }
  io.emit("show-anima-card", {
    random_pos: randompos,
    rollList: rollList,
  });
  ammoCount = 0;
  io.emit("show-ammo-count", {
    ammoCount: 0,
  });
  var start = Date.now(),
    diff,
    seconds,
    miseconds,
    duration = 500;
  const ammoCountfunc = () => {
    const random_ammo = Math.floor(Math.random() * (63 - 1)) + 1;
    if (random_ammo === 1) {
      ammoCount = 6;
    } else if (random_ammo >= 2 && random_ammo <= 3) {
      ammoCount = 5;
    } else if (random_ammo >= 4 && random_ammo <= 7) {
      ammoCount = 4;
    } else if (random_ammo >= 8 && random_ammo <= 15) {
      ammoCount = 3;
    } else if (random_ammo >= 16 && random_ammo <= 31) {
      ammoCount = 2;
    } else if (random_ammo >= 32 && random_ammo <= 63) {
      ammoCount = 1;
    }
    io.emit("show-ammo-count", {
      ammoCount,
    });
    ammoCount = 0;
  };
  const timer = () => {
    diff = duration - (((Date.now() - start) / 10) | 0);
    seconds = (diff / 100) | 0;
    miseconds = diff % 100 | 0;
    miseconds = miseconds < 10 ? "0" + miseconds : miseconds;
    p_seconds = seconds;
    p_miseconds = miseconds;
    io.emit("show-play-time", { p_seconds, p_miseconds });
    if (diff <= 0) {
      clearInterval(interval);
      setTimeout(() => {
        ammoCountfunc();
      }, 2000);

      return false;
    }
  };
  timer();
  var interval = setInterval(timer, 10);
};

playgamb = () => {
  startTime();
  setInterval(startTime, 9000);
};

io.on("connection", (socket) => {
  socket.emit("connection", null);

  socket.on("get-play-time", () => {
    io.emit("show-play-time", { p_seconds, p_miseconds });
    io.emit("show-bonus-rollList", rollList);
  });

  socket.on("get-ammo-count", () => {
    io.emit("show-ammo-count", { ammoCount });
  });

  socket.on("get-anima-card", () => {
    io.emit("show-anima-card", {
      random_pos,
      rollList,
    });
  });

  socket.on("send-message", (message) => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    io.emit("disconnected", null);
  });

  socket.on("load-user-connection", () => {
    io.emit("user-connect", user_connect);
  });

  socket.on("user-connected", () => {
    user_connect++;
    io.emit("user-connect", user_connect);
  });

  socket.on("user-disconnected", () => {
    user_connect--;
    io.emit("user-connect", user_connect);
  });

  socket.on("req-get-bet-data", () => {
    io.emit("send-get-bet-data", betsololist);
  });

  socket.on("req-bet-data", (req) => {
    if (betsololist.filter((e) => e.userid === req.userid).length > 0) {
      const index = betsololist.findIndex(
        (betdata) => betdata.userid === req.userid
      );
      betsololist[index].xval = req.betcost;
      betsololist[index].diamval = req.betpayout;
    } else {
      betsololist.push({
        userlevel: req.userlevel,
        person: req.userlevel,
        xval: req.betcost,
        diamval: req.betpayout,
        uname: req.username,
        userid: req.userid,
      });
    }
    io.emit("send-bet-data", betsololist);
  });
});
