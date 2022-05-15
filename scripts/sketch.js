const room = new URLSearchParams(location.search).get("room");
console.log("room:", room);

if (room) {
  document.getElementById("room").value = room;
}

let axiom = "X"; //starting point
let treeGrowInterval = 1000;
let shared, me, participants;
let generateCheck = true;
let y = 0;
let timer = 500;
let axeGif,
  woodGif,
  appleTreeImg,
  treeAreaImg,
  threeApplesImg,
  clockImg,
  treeCountImg;
//let gameTime = 0;
//let gameBegin = false;
//let gameOver = false;
let screenMode = 0;
let gameScreenMode = 4; //screen to go to to begin game
let instruct = 0;
let lastPage = 6; //count of numer of instruction pages
let nextButtonX = 150;
let prevButtonX = 150;
let finButton;
let finButtonX = 150;
let startButton = document.getElementById("startBtn");
let roomButton = document.getElementById("roomBtn");
let roomEntry = document.getElementById("room");
let insButton = document.getElementById("insBtn");
let nextButton = document.getElementById("nextBtn");
let prevButton = document.getElementById("prevBtn");
let showButtonTemp = false;

let rules = [];
let fol_a = [];
let fol_b = [];
let fol_c = [];
// let br1 = [];
// let br2 = [];
let appleImgs = [];
let insGifs = [];
let allOfTheTrees = [];
let allOfTheChildTrees = [];
let w = [];
let h = [];
let c = [];
let cm = [];
let l = [];
let a = [];
let s = [];
let ls = [];
let n = [];
let sh = [];
let sz = []; //home screen tree gen

let bgCol = "#a7d179";
let blue = "#25399F";
let brown1 = "#584239";
let brown2 = "#6C523B";
let green1 = "#2B734E";
let green2 = "#27AB5E";
let green3 = "#1CDC5F";
let green4 = "#76E44E";
let red = "#F14037";
let yellow = "#FFDD00";
let pink = "#F0909C";

//3 types of l-systems rule systems
let shadowCol = (rules[0] = {
  X: "X",
  F: "F",
  X1: "F[+X]F[-X]+X", //method 1
  X2: "F[+X][-X]FX", //method 2
  X3: "F-[[X]+X]+F[+FX]-X", //method 3
  F1: "FF",
});

//FLORA STUFF
bush = [];
flower = [];
rockClump = [];
floraCount = 0;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "defor_2", room);
  //declaring party variables
  shared = partyLoadShared("globals");
  me = partyLoadMyShared();
  participants = partyLoadParticipantShareds();
  //loading all image assets
  for (let i = 1; i < 7; i++) {
    insGifs.push(loadImage("assets/ins_" + i + ".gif"));
  }
  for (let i = 1; i < 4; i++) {
    fol_a[i - 1] = loadImage("assets/fol_a_" + i + ".png");
    fol_b[i - 1] = loadImage("assets/fol_b_" + i + ".png");
    fol_c[i - 1] = loadImage("assets/fol_c_" + i + ".png");
    appleImgs[i - 1] = loadImage("assets/apple" + i + ".png");
  }
  for (let x = 1; x < 7; x++) {
    if (x < 4) bush[x - 1] = loadImage("assets/bush" + x + ".png");
    flower[x - 1] = loadImage("assets/flower" + x + ".png");
    rockClump[x - 1] = loadImage("assets/rockClump" + x + ".png");
  }
  appleTreeImg = loadImage("assets/appleTreeImg.png");
  treeAreaImg = loadImage("assets/treeAreaImg.png");
  threeApplesImg = loadImage("assets/threeApplesImg.png");
  clockImg = loadImage("assets/clock.png");
  treeCountImg = loadImage("assets/treeCount.png");
  axeGif = loadImage("assets/logger_axe.gif");
  woodGif = loadImage("assets/logger_wood.gif");
}
function setup() {
  createCanvas(1300, 650);
  background(green1); //BG CONTROL HERE

  partyToggleInfo(); //hide party info panel

  imageMode(CENTER);
  textFont("Nunito");
  textSize(25);
  noStroke();

  me.x = 0;
  me.y = 0;
  me.count = 0;
  me.countMax = 0;
  me.branchLength = 0;
  me.angle = 0;
  me.sentence = 0;
  me.setTree = false;
  me.treeArea = 150;
  me.folNum = floor(random(0, 3));
  me.folShape = floor(random(0, 3));
  me.appleShape = floor(random(0, 3));
  me.branchCol = floor(random(0, 2));
  me.apples = [];
  me.childtrees = [];
  if (partyIsHost()) {
    shared.loggers = [];
    shared.gameOver = false; //gameOver used where?
    shared.gameStartChk = false; //gameStartChk used in mousePressed so player can place trees only after game starts
    shared.gameTime = 0;
    shared.gameBegin = false;
    shared.floraArr = [];
    instruct = 0;
    screenMode = 0;
    shared.loggers.push({
      pos: { x: random(width), y: random(height) },
      d: { x: random(-6, 6), y: random(-6, 6) },
      step: 6,
      cutting: false,
      target: null,
      woodpicked: false,
      cutTime: 10,
      destrand: random(),
    });
  }

  //homescreen tree generation
  for (let i = 0; i < 3; i++) {
    w[i] = width / 2 + i * 100 + 200;
    h[i] = height / 2 + ((i % 2) + 1) * 100 + 100;
    c[i] = 0;
    cm[i] = int(random(2, 5));
    l[i] = random(180, 150);
    a[i] = radians(20);
    s[i] = axiom;
    ls[i] = int(random(1, 4));
    n[i] = floor(random(0, 3));
    sh[i] = floor(random(0, 3));
    sz[i] = 40;
  }
}
//All button event listener functions
startButton.addEventListener("click", function () {
  if (screenMode == 1) {
    //check to jumps to game from instructions page
    screenMode = 4; // game screen = 4
  } else screenMode++;
});
insButton.addEventListener("click", function () {
  instruct = 1;
});
nextButton.addEventListener("click", function () {
  if (instruct < 6) {
    instruct++;
  } else if (instruct == 6) {
    instruct = 0;
  }
});
prevButton.addEventListener("click", function () {
  instruct--;
});
//mousePressed + clicked functions
function mousePressed() {
  if (
    shared.gameStartChk == true &&
    screenMode == gameScreenMode &&
    me.state == "player"
  ) {
    if (me.setTree === false) {
      //setting main tree initial values
      me.x = mouseX; //location
      me.y = mouseY;
      me.count = 0; //start of l-system
      me.countMax = int(random(2, 5)); //end of l-system i.e. setting 2 to 4 branch levels
      me.branchLength = random(130, 70);
      me.angle = radians(20);
      me.sentence = axiom; //axiom = X
      me.lSystem = int(random(1, 4));
      me.setTree = true;
      me.apples = []; //test;
      // me.childtrees = []; //test
      for (let i = 0; i < 3; i++) {
        growApples();
      }
    } else {
      // me.apples.forEach((a, i) => {
      for (i = 0; i < me.apples.length; i++) {
        const a = me.apples[i];
        if (a.isDragged) {
          if (checkBoundary()) {
            removeApple(a, i);
            makeChildTree(); //rewrites first element instead of pushing
          }
        } else {
          checkMouseDist(a); //checks if mouse is close enough to move the apple
        }
      }
    }
  }
}
//mousePressed related functions start
function growApples() {
  if (me.apples.length < 3) {
    let treeHeight = treeHeightSum(me.branchLength, me.countMax);
    me.apples.push({
      x: random(me.x - 15, me.x + 25),
      y: random(me.y - (me.branchLength / 4) * 3, me.y - treeHeight),
      isDragged: false,
    });
  }
}
function treeHeightSum(length, countMax) {
  let sum = length;
  let temp = length;
  for (let i = 1; i < countMax; i++) {
    temp /= 2;
    sum += temp;
  }
  return sum;
}
function checkMouseDist(apple) {
  let appleDist = dist(mouseX, mouseY, apple.x, apple.y);
  if (appleDist <= 5) {
    // check if mouse is within apple picking up range
    apple.isDragged = true;
  }
}
function checkBoundary() {
  let xLen = abs(mouseX - me.x); //treee planting area dimensions
  let yLen = abs(mouseY - me.y);
  if (
    xLen <= me.treeArea / 2 &&
    yLen <= me.branchLength / 2 //check to plant within the tree's planting area radius
  ) {
    return true;
  }
}
function removeApple(apple, index) {
  apple.isDragged = false;
  me.apples.splice(index, 1); //remove this apple from array
}
function makeChildTree() {
  me.childtrees.push({
    x: mouseX,
    y: mouseY,
    count: 0,
    countMax: int(random(1, 3)),
    branchLength: random(40, 20),
    angle: radians(20),
    sentence: axiom,
    lSystem: int(random(1, 4)),
    setTree: true,
    folNum: floor(random(0, 3)),
    folShape: floor(random(0, 3)),
  });
}
//mousePressed related functions end
//generate tree
function recurTree(x, y, l, a, s, c, num, shape, size) {
  resetMatrix();
  push();
  translate(x, y);
  noStroke();
  for (let i = 0; i < s.length; i++) {
    let current = s.charAt(i);
    if (current == "F") {
      fill(brown1);
      rectMode(CORNER);
      if (c < 1) {
        rect(0, 0, 5, -l);
      } else {
        rect(0, 0, 2, -l);
      }
      //rect(0, 0, 5, -l);
      translate(0, -l, 1);
    } else if (current == "X") {
      for (const t of participants) {
        fill(brown1);
        rectMode(CORNER);
        if (c < 1) {
          rect(0, 0, 5, -l);
        } else {
          rect(0, 0, 2, -l);
        }
        if (num == 0) {
          image(fol_a[shape], 0, -l, size, size);
        } else if (num == 1) {
          image(fol_b[shape], 0, -l, size, size);
        } else if (num == 2) {
          image(fol_c[shape], 0, -l, size, size);
        }
      }

      translate(0, -l, 1);
    } else if (current == "+") {
      rotate(a);
    } else if (current == "-") {
      rotate(-a);
    } else if (current == "[") {
      push();
    } else if (current == "]") {
      pop();
    }
  }
  translate(0, 0);
  pop();
}
function generateNewSentence(x, y, c, cmax, l, a, s, ls, num, shape, size) {
  //console.log(x, y, c, cmax, l, a, s, ls);
  while (c < cmax) {
    l *= 0.5;
    let nextSentence = "";
    for (let i = 0; i < s.length; i++) {
      let current = s.charAt(i);
      let found = false;
      for (let j = 0; j < rules.length; j++) {
        if (current == rules[0].X) {
          found = true;
          if (ls == 1) nextSentence += rules[0].X1;
          else if (ls == 2) nextSentence += rules[0].X2;
          else nextSentence += rules[0].X3;
          break;
        } else if (current == rules[0].F) {
          found = true;
          nextSentence += rules[0].F1;
          break;
        }
      }
      if (!found) {
        nextSentence += current;
      }
    }
    s = nextSentence;
    recurTree(x, y, l, a, s, c, num, shape, size);
    c++;
  }
}
//end tree generation
function draw() {
  gameState();
  if (shared.gameStartChk == true && screenMode == gameScreenMode) {
    background(bgCol);
    drawFlora();
    if (partyIsHost()) {
      shared.gameBegin = true;
    }
    me.state == "viewer" ? viewState() : playState();
  }
}
function viewState() {
  push();
  textSize(15);
  text("you are a viewer", mouseX, mouseY);
  pop();
}
function playState() {
  drawPlayableArea();
  drawAllElements();

  // if (partyIsHost()) {
  //   shared.loggers.forEach((logger) => {
  //     stepLogger(logger);

  //     participants.forEach((p) => {
  //       if (!logger.woodpicked) {
  //         //console.log(p.trees);

  //         let treeDist;
  //         p.trees.forEach((t, index) => {
  //           treeDist = dist(logger.pos.x, logger.pos.y, t.x, t.y);
  //           if (treeDist < 30) {
  //             //console.log('close');
  //             logger.cutting = true;
  //             if (treeDist > 10) {
  //               if (logger.target == null) {
  //                 logger.target = t;
  //               } else {
  //                 logger.d.x = lerp(
  //                   logger.d.x,
  //                   (logger.target.x - logger.pos.x) / 20,
  //                   0.2
  //                 );
  //                 logger.d.y = lerp(
  //                   logger.d.y,
  //                   (logger.target.y - logger.pos.y) / 20,
  //                   0.2
  //                 );
  //               }
  //             } else if (treeDist < 10) {
  //               //console.log('hit');
  //               // if(int(millis())/1000 % 60){
  //               //   logger.cutTime--;
  //               // }

  //               //if(logger.cutTime == 0){
  //               //logger.d.x = 0;
  //               //logger.d.y = 0;
  //               p.trees.splice(index, 1);
  //               logger.target = null;
  //               //console.log(p.trees)
  //               logger.woodpicked = true;
  //               //}
  //               setTimeout(() => {
  //                 logger.cutting = false;
  //                 //logger.cutTime = 10;
  //               }, 2000);
  //             }
  //           }
  //         });
  //       }
  //     });
  //   });
  // }

  // shared.loggers.forEach((logger) => {
  //   if (!logger.woodpicked) {
  //     image(axeGif, logger.pos.x, logger.pos.y, 25, 25);
  //   } else {
  //     image(woodGif, logger.pos.x, logger.pos.y, 25, 25);
  //   }
  // });

  // //console.log(shared.loggers);
  // let randint = random();
  // if (randint < 0.003) {
  //   setTimeout(growApples(), 3000);
  // }

  // // stats
  // push();
  // fill(255, 255, 255, 200);
  // rect(width - 117, 35, 90, 75, 5);
  // fill(brown2);
  // let mins = floor(shared.gameTime / 60);
  // let secs = floor(shared.gameTime % 60);
  // if (secs < 10) {
  //   secs = "0" + secs;
  // }
  // text(mins + ":" + secs, width - 79, 60);
  // image(clockImg, width - 100, 53, 20, 20);
  // text(allOfTheChildTrees.length, width - 80, 100);
  // image(treeCountImg, width - 100, 93, 20, 20);
  // pop();
}
function drawPlayableArea() {
  push();
  fill(255, 255, 255, 100);
  me.x && me.y
    ? ellipse(me.x, me.y, me.treeArea, me.branchLength)
    : appleOnMouse();
  pop();
}
function appleOnMouse() {
  push();
  fill(255, 255, 255, 150);
  ellipse(mouseX, mouseY, me.treeArea, me.treeArea / 2); //draw initial planting area
  image(appleImgs[me.appleShape], mouseX, mouseY, 12, 12); //apple image on mouse
  pop();
}
function drawAllElements() {
  if (me.setTree == false) {
    //draw local apple moving with the mouse
    appleOnMouse();
  }
  for (const t of participants) {
    if (t.setTree == true) {
      // draw the main tree per participant
      generateNewSentence(
        t.x,
        t.y,
        t.count,
        t.countMax,
        t.branchLength,
        t.angle,
        t.sentence,
        t.lSystem,
        t.folNum,
        t.folShape,
        30
      );
      //drawing apples
      if (t.apples) {
        //check there are apples to draw
        for (i = 0; i < me.apples.length; i++) {
          //for loop because for each loop is not working
          const a = me.apples[i];
          a.isDragged //a.isDragged keeps track of whether it is selects
            ? image(appleImgs[me.appleShape], mouseX, mouseY, 12, 12) //in motion
            : image(appleImgs[me.appleShape], a.x, a.y, 12, 12); //stationary
        }
      }
      //drawing child trees
      if (t.childtrees.length) {
        console.log("draw child");
        for (let i = 0; i < t.childtrees.length; i++) {
          console.log("draw child");
          c = t.childtrees[i];
          generateNewSentence(
            c.x,
            c.y,
            c.count,
            c.countMax,
            c.branchLength,
            c.angle,
            c.sentence,
            c.lSystem,
            c.folNum,
            c.folShape,
            30
          );
        }
      }
      // draw apple selection outline
      for (const a of me.apples) {
        d = dist(mouseX, mouseY, a.x, a.y);
        if (d <= 5) {
          push();
          noFill();
          stroke(255, 230, 5);
          strokeWeight(3);
          ellipse(a.x, a.y, 17);
          pop();
        }
      }
      // console.log(t);
    }
  }
}
function stepLogger(o) {
  let rand = random();
  if (!o.cutting) {
    if (!o.woodpicked) {
      if (rand < 0.3) {
        o.d.x = lerp(o.d.x, random(-o.step, o.step), 0.2);
        o.d.y = lerp(o.d.y, random(-o.step, o.step), 0.2);
      }
    } else {
      if (o.destrand > 0.75) {
        o.d.x = lerp(o.d.x, random(-7, 7), 0.2);
        o.d.y = lerp(o.d.y, random(0, o.step), 0.2);
      } else if (o.destrand < 0.75 && o.destrand > 0.5) {
        o.d.x = lerp(o.d.x, random(0, o.step), 0.2);
        o.d.y = lerp(o.d.y, random(-7, 7), 0.2);
      } else if (o.destrand < 0.5 && o.destrand > 0.25) {
        o.d.x = lerp(o.d.x, random(-o.step, 0), 0.2);
        o.d.y = lerp(o.d.y, random(-7, 7), 0.2);
      } else {
        o.d.x = lerp(o.d.x, random(-7, 7), 0.2);
        o.d.y = lerp(o.d.y, random(-o.step, 0), 0.2);
      }
    }
  }

  o.pos.x += o.d.x;
  o.pos.y += o.d.y;

  if (o.pos.x < -20 || o.pos.x > width + 20) {
    o.d.x = -o.d.x;
    o.woodpicked = false;
  }

  if (o.pos.y < -20 || o.pos.y > height + 20) {
    o.d.y = -o.d.y;
    o.woodpicked = false;
  }
}
function addLogger() {
  if (shared.gameStartChk == true && screenMode == gameScreenMode) {
    if (partyIsHost()) {
      shared.loggers.push({
        pos: { x: random(width), y: random(height) },
        d: { x: random(-6, 6), y: random(-6, 6) },
        step: 6,
        cutting: false,
        woodpicked: false,
        cutTime: 10,
        destrand: random(),
      });
    }
  }
}
function rushScene() {
  if (shared.gameStartChk == true && screenMode == gameScreenMode) {
    if (partyIsHost()) {
      shared.loggers.forEach((logger) => {
        if (logger.step < 20) {
          logger.step += 4;
        }
      });

      for (const p of participants) {
        if (p.treeArea < 400) {
          p.treeArea += 50;
        }
      }
    }
  }
}
function gameTimer() {
  if (partyIsHost()) {
    if (shared.gameBegin && !shared.gameOver) {
      shared.gameTime++;
    }
  }

  allOfTheTrees = [];
  allOfTheChildTrees = [];
  participants.forEach((p) => {
    allOfTheTrees.push("tree");
    p.childtrees.forEach((mt) => {
      allOfTheTrees.push("tree");
      allOfTheChildTrees.push("tree");
    });
  });

  if (shared.gameTime >= 60) {
    if (allOfTheChildTrees.length == 0) {
      shared.gameOver = true;
      screenMode = 5;
    }
  }
  // console.log(gameTime, allOfTheTrees.length);
}
function gameState() {
  switch (screenMode) {
    case 0:
      instructionScreen();
      // console.log("instructions");
      break;
    case 1:
      readyScreen();
      // console.log("ready screen");
      break;
    case 3: //i think this is a bug, it doesn't work if screenmode 2
      // launchScreen();
      break;
    case 4:
      gameScreen(); //this reassigns host if the host exists the game. So the game will continue as long as atleast one player is in the room
      break;
    case 5:
      endScreen(); //not implemented
      break;
  }
}
function instructionScreen() {
  background(brown2);

  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  fill(bgCol);
  // strokeWeight(3);
  // stroke(yellow);
  rect(width / 2, 275, 500, 350);
  rect(width / 2, 475, 500, 150);
  noStroke();
  fill(green1);

  switch (instruct) {
    case 0:
      //title screen
      showButtons();
      homeScreen();
      break;
    case 1:
      //actual instructions start
      showButtons();
      image(insGifs[0], width / 2, 275, 300, 300);
      text(
        "You are a tree. Click to plant yourself in the field when the game starts.",
        width / 2,
        475,
        450
      );
      break;
    case 2:
      showButtons();
      image(insGifs[1], width / 2, 275, 300, 300);
      text(
        "Apples grow on your tree. Click to pick one up and click again to plant it.",
        width / 2,
        475,
        450
      );
      break;
    case 3:
      showButtons();
      image(insGifs[2], width / 2, 275, 300, 300);
      text(
        "You can only plant trees in your circle. The area will increase as time passes.",
        width / 2,
        475,
        450
      );
      break;
    case 4:
      showButtons();
      image(insGifs[3], width / 2, 275, 300, 300);
      text(
        "Apples will automatically grow back over time. You can have up to 3 at once.",
        width / 2,
        475,
        450
      );
      break;
    case 5:
      showButtons();
      image(insGifs[4], width / 2, 275, 350, 350);
      text(
        "There are loggers running around who will cut your trees down.",
        width / 2,
        475,
        450
      );
      break;
    case 6:
      showButtons();
      image(insGifs[5], width / 2, 275, 350, 350);
      text(
        "Grow the forest with your other tree friends and stay alive as long as you can!",
        width / 2,
        475,
        475
      );
      break;
  }
  pop();
}
function homeScreen() {
  // nextButton.html("INSTRUCTIONS");
  background(brown2);
  push();
  fill(yellow);
  textFont("Rubik Microbe");
  // textFont("Lexend Exa");
  textSize(80);
  text("A Forest Clearing", width / 2, 150);
  pop();
  for (let i = 0; i < 3; i++) {
    // console.log(w[i], h[i], c[i], cm[i], l[i], a[i], s[i], ls[i], n[i], sh[i]);
    generateNewSentence(
      w[i],
      h[i],
      c[i],
      cm[i],
      l[i],
      a[i],
      s[i],
      ls[i],
      n[i],
      sh[i],
      sz[i]
    );
  }
}
function readyScreen() {
  showButtons();
  // background(green1);
  if (shared.gameStartChk == false) {
    me.state = "player";
    for (let i = 0; i < participants.length; i++) {
      if (participants[i].state == "player") {
        image(
          appleImgs[me.appleShape],
          width / 2 - (participants.length / 2) * 100 + 100 * i,
          height / 2,
          50,
          50
        );
        textSize(20);
        fill(yellow);
        text(
          "player " + (i + 1),
          width / 2 - (participants.length / 2) * 100 + 100 * i,
          height / 2 + 20
        );
      }
    }
    if (partyIsHost()) {
      push();
      textAlign(CENTER);
      textSize(40);
      fill("#F14037");
      text("You are the HOST", width / 2, 80);
      pop();
      push();
      textSize(30);
      fill(yellow);
      text("Click 'Start Game' to launch game", prevButtonX / 2, 130);
      text(
        "Remember to wait for all the players to join before you start",
        prevButtonX / 2,
        170
      );
      text(
        "If someone tries to join after the game has started,",
        prevButtonX / 2,
        210
      );
      text("they will only be able to view the game", prevButtonX / 2, 250);
      pop();
      showButtonTemp = true;
    } else {
      push();
      textAlign(CENTER);
      textSize(40);
      fill(yellow);
      text("PLAYERS", width / 2, 80);
      textSize(30);
      text("waiting for host to launch game", width / 2, 130);
      pop();
    }
  } else if (shared.gameStartChk == true && me.state == "player") {
    screenMode = gameScreenMode;
  } else {
    push();
    textAlign(CENTER);
    textSize(40);
    fill(yellow);
    text("VIEWER", width / 2, 80);
    textAlign(LEFT);
    textSize(30);
    text("game is already in session. Join as viewer", prevButtonX / 2, 130);
    pop();
    me.state = "viewer";
    showButtonTemp = true;
  }
}
function launchScreen() {
  showButtons();
  // background(green1);
  if (shared.gameStartChk == false) {
    if (partyIsHost()) {
      text("click to launch game", 20, 30);
    } else {
      text("waiting for host to launch game", 20, 30);
    }
    for (let i = 0; i < participants.length; i++) {
      image(
        appleImgs[me.appleShape],
        width / 2 - (participants.length / 2) * 100 + 100 * i,
        height / 2,
        50,
        50
      );
    }
  } else {
    screenMode = gameScreenMode;
  }
}
function gameScreen() {
  showButtons();
  screenMode = gameScreenMode;
  shared.gameStartChk = true; //set to true = game mechanic conditions become true
}
function endScreen() {
  background(red);
  push();
  textAlign(CENTER);
  textSize(40);
  fill(yellow);
  text("WHOOP", width / 2, 80);
  textSize(30);
  text(
    "You lasted " +
      floor(shared.gameTime / 60) +
      " mins and " +
      floor(shared.gameTime % 60) +
      " secs",
    width / 2 - 300,
    130
  );
  text("Better luck next time :)", width / 2 - 300, 170);
  pop();
  for (let i = 0; i < 3; i++) {
    // console.log(w[i], h[i], c[i], cm[i], l[i], a[i], s[i], ls[i], n[i], sh[i]);
    generateNewSentence(
      w[i],
      h[i],
      c[i],
      cm[i],
      l[i],
      a[i],
      s[i],
      ls[i],
      n[i],
      sh[i],
      sz[i]
    );
  }
}
function nextFn() {
  instruct++;
  // console.log(instruct);
}
function prevFn() {
  instruct--;
  // console.log(instruct);
}
function showButtons() {
  if (screenMode == 0) {
    if (instruct == 0) {
      //title screen
      nextButton.style.visibility = "hidden";
      prevButton.style.visibility = "hidden";
      startButton.style.bottom = "auto";
      startButton.style.top = "40vh";
      startButton.style.left = "35vw";
      startButton.style.right = "auto";
      startButton.style.visibility = "visible";
      insButton.style.visibility = "visible";
      roomButton.style.visibility = "visible";
      roomEntry.style.visibility = "visible";
    } else if (instruct == lastPage) {
      //instructions last page
      insButton.style.visibility = "hidden";
      startButton.style.visibility = "hidden";
      nextButton.style.backgroundColor = "var(--red)";
      nextButton.style.color = "var(--brown1)";
      nextButton.style.border = "solid var(--brown1) 2px";
      nextButton.innerHTML = "PLAY!";
      nextButton.style.visibility = "visible";
      prevButton.style.visibility = "visible";
      roomButton.style.visibility = "hidden";
      roomEntry.style.visibility = "hidden";
    } else {
      //instructions pages
      startButton.style.visibility = "hidden";
      nextButton.style.backgroundColor = "var(--yellow)";
      nextButton.style.color = "var(--green1)";
      nextButton.style.border = "solid var(--green1) 2px";
      nextButton.innerHTML = "NEXT";
      insButton.style.visibility = "hidden";
      nextButton.style.visibility = "visible";
      prevButton.style.visibility = "visible";
      roomButton.style.visibility = "hidden";
      roomEntry.style.visibility = "hidden";
    }
  } else if (screenMode == 1 && showButtonTemp == true) {
    //ready screen
    nextButton.style.visibility = "hidden";
    prevButton.style.visibility = "hidden";
    insButton.style.visibility = "hidden";
    startButton.style.bottom = "30vh";
    startButton.style.top = "auto";
    startButton.style.left = "auto";
    startButton.style.right = "45vw";
    startButton.style.visibility = "visible";
    roomButton.style.visibility = "hidden";
    roomEntry.style.visibility = "hidden";
  } else if (screenMode > 1) {
    nextButton.style.visibility = "hidden";
    prevButton.style.visibility = "hidden";
    insButton.style.visibility = "hidden";
    startButton.style.visibility = "hidden";
    roomButton.style.visibility = "hidden";
    roomEntry.style.visibility = "hidden";
  } else {
    nextButton.style.visibility = "hidden";
    prevButton.style.visibility = "hidden";
    insButton.style.visibility = "hidden";
    startButton.style.visibility = "hidden";
    roomButton.style.visibility = "hidden";
    roomEntry.style.visibility = "hidden";
  }
}
function drawFlora() {
  let resizeX;
  let resizeY;
  // if (partyIsHost()) {
  shared.floraArr.forEach((flora) => {
    if (flora.type == "flower") {
      url = flower[flora.index];
      resizeX = 8;
      resizeY = 8;
    } else if (flora.type == "bush") {
      url = bush[flora.index];
      resizeX = 20;
      resizeY = 12;
    } else if (flora.type == "rock") {
      url = rockClump[flora.index];
      resizeX = 30;
      resizeY = 30;
    }
    image(url, flora.xPos, flora.yPos, resizeX, resizeY);
  });
  // }
}
function addFlora() {
  // if (partyIsHost()) {
  //   if (floraCount == 0) {
  //     rockClump.forEach((e) => {
  //       console.log(e);
  //       shared.floraArr.push({
  //         index: int(random(6)),
  //         type: "rock",
  //         xPos: random(width - 5),
  //         yPos: random(height - 5),
  //       });
  //     });
  //     floraCount++;
  //   }
  // }
  // console.log(shared.floraArr);
  if (partyIsHost()) {
    if (floraCount == 0) {
      rockClump.forEach((e) => {
        shared.floraArr.push({
          index: int(random(6)),
          type: "rock",
          xPos: random(width - 5),
          yPos: random(height - 5),
        });
      });
      floraCount++;
    } else {
      let tempBush = int(random(bush.length - 1));
      shared.floraArr.push({
        index: tempBush,
        xPos: random(width - 5),
        yPos: random(height - 5),
      });
      for (let i = 0; i < 2; i++) {
        let tempF = int(random(flower.length - 1));
        shared.floraArr.push({
          index: tempF,
          type: "flower",
          xPos: random(width - 5),
          yPos: random(height - 5),
        });
      }
    }
  }
  // if ((shared.floraArr.length = 111)) {
  //   shared.floraArr.splice(7, 3);
  // }
}
setInterval(() => gameTimer(), 1000);
setInterval(() => addLogger(), 15000);
setInterval(() => rushScene(), 30000);
setInterval(() => addFlora(), 5000);
