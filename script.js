const mazeElement = document.getElementById("maze");
const finalScene = document.getElementById("finalScene");
const envelope = document.getElementById("envelope");
const seal = document.getElementById("seal");
const letterText = document.getElementById("letterText");
const music = document.getElementById("bgMusic");

let musicStarted = false;

let typingTimeouts = [];
let typingInProgress = false;

const size = 15;
const center = {x:7,y:7};

const maze = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
[1,0,1,0,0,0,1,0,1,0,0,0,1,0,1],
[1,0,1,1,1,0,1,0,1,1,1,0,1,0,1],
[1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
[1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
[1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
[1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// generateMaze(1,1);
// maze[center.y][center.x]=0;

let player = {x:1,y:1};
let autoPlayer = {x:size-2,y:size-2};

mazeElement.style.gridTemplateColumns =
  `repeat(${size},40px)`;

// let musicStarted=false;

/* DRAW */
function draw(){
  mazeElement.innerHTML="";
  maze.forEach((row,y)=>{
    row.forEach((cell,x)=>{
      let div=document.createElement("div");
      div.classList.add("cell");
      div.classList.add(cell===1?"wall":"path");

      if(x===center.x && y===center.y)
        div.classList.add("center");

      if(x===player.x && y===player.y)
        div.classList.add("player");

      if(x===autoPlayer.x && y===autoPlayer.y)
        div.classList.add("auto");

      mazeElement.appendChild(div);
    });
  });
}

for(let i=0;i<60;i++){
  const star=document.createElement("div");
  star.classList.add("sparkle");
  star.style.top=Math.random()*100+"vh";
  star.style.left=Math.random()*100+"vw";
  star.style.animationDelay=Math.random()*3+"s";
  document.body.appendChild(star);
}

/* PATHFINDING */
function findPath(start,end){
  let queue=[start];
  let visited=Array(size).fill().map(()=>Array(size).fill(false));
  let parent=Array(size).fill().map(()=>Array(size).fill(null));

  visited[start.y][start.x]=true;

  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];

  while(queue.length){
    let {x,y}=queue.shift();

    if(x===end.x && y===end.y){
      let path=[];
      while(true){
        path.push({x,y});
        let p=parent[y][x];
        if(!p) break;
        x=p.x; y=p.y;
      }
      return path.reverse();
    }

    for(let [dx,dy] of dirs){
      let nx=x+dx;
      let ny=y+dy;

      if(nx>=0 && ny>=0 && nx<size && ny<size &&
         !visited[ny][nx] && maze[ny][nx]===0){
        visited[ny][nx]=true;
        parent[ny][nx]={x,y};
        queue.push({x:nx,y:ny});
      }
    }
  }
  return [];
}

let autoPath = findPath(autoPlayer, center);
autoPath.shift();
let autoStep = 0;

function autoMove(){
  if(autoStep < autoPath.length){
    autoPlayer = autoPath[autoStep];
    autoStep++;
  }
}

/* MOVE */
function move(dx,dy){

  if (!musicStarted) {

  music.volume = 0;

  music.play().then(() => {

    musicStarted = true;

    const targetVolume = 0.18;   // soft volume
    const fadeDuration = 6000;   // 6 seconds fade
    const interval = 100;        // stable interval
    const steps = fadeDuration / interval;
    const volumeStep = targetVolume / steps;

    let fade = setInterval(() => {

      if (music.volume < targetVolume) {
        music.volume = Math.min(music.volume + volumeStep, targetVolume);
      } else {
        clearInterval(fade);
      }

    }, interval);

  }).catch(() => {
    // If browser blocks autoplay, do nothing
    // Prevents breaking the rest of the script
  });

}

  let nx = player.x + dx;
  let ny = player.y + dy;

  if(nx>=0 && ny>=0 && nx<size && ny<size &&
     maze[ny][nx]===0){

    player.x = nx;
    player.y = ny;

    autoMove();
    draw();
    checkMeet();
  }
}

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowUp") move(0,-1);
  if(e.key==="ArrowDown") move(0,1);
  if(e.key==="ArrowLeft") move(-1,0);
  if(e.key==="ArrowRight") move(1,0);
});

function spawnHearts(x,y){
  for(let i=0;i<30;i++){
    const heart = document.createElement("div");
    heart.innerText = "💖";
    heart.classList.add("heart");

    // Position at center cell
    heart.style.left = x + "px";
    heart.style.top = y + "px";

    // Random sideways drift
    heart.style.setProperty("--x", (Math.random()*100 - 50) + "px");

    document.body.appendChild(heart);

    setTimeout(()=>{
      heart.remove();
    },2500);
  }
}

/* LOVE SCENE */
function triggerLove(){

  // Spawn floating hearts continuously for 2 seconds
  let heartInterval = setInterval(()=>{
    const heart = document.createElement("div");

    const hearts = ["💖","💕","❤️"];
    heart.innerText = hearts[Math.floor(Math.random()*hearts.length)];

    heart.classList.add("heart");

    // Random horizontal position
    heart.style.left = Math.random() * 100 + "vw";

    // Random animation duration
    heart.style.animationDuration = (2.5 + Math.random()*1.5) + "s";

    document.body.appendChild(heart);

    setTimeout(()=>{
      heart.remove();
    },5000);

  },120);

  // Stop spawning after 2 seconds
  setTimeout(()=>{
    clearInterval(heartInterval);
  },4000);

  // Then transition scene
  setTimeout(()=>{
    document.querySelector(".mazeContainer").style.display="none";
    document.querySelector(".controls").style.display="none";
    document.querySelector(".title").style.display="none";
    finalScene.style.opacity=1;
    finalScene.style.pointerEvents="auto";
  },6000);
}

function checkMeet(){
  if(player.x===center.x && player.y===center.y &&
     autoPlayer.x===center.x && autoPlayer.y===center.y){
    triggerLove();
  }
}

/* ENVELOPE */
seal.onclick = function(){

  envelope.classList.add("open");

  setTimeout(()=>{
    envelope.classList.add("fadeOut");
  },700);

  setTimeout(()=>{
    document.getElementById("letterPage").classList.add("show");
    document.getElementById("backBtn").style.opacity = "1";
document.getElementById("backBtn").style.pointerEvents = "auto";
  },1200);

  startTyping();
};

/* TYPEWRITER */
const message = `
<p>Dear Love,</p>

<p>Today, on the auspicious day of Holi, we complete six months of our relationship, half a year of love, growth, and togetherness, with forever ahead of us.</p>

<p>Time has flown so fast. From being strangers to becoming each other’s home, we have grown together every single day with the belief that soon we will be living side by side. We were living our separate lives, and then God decided to bring us together, and since then, we have chosen each other every day despite our different struggles.

With time, even our struggles have started to feel shared. Being with you makes me forget everything else — it’s just peace and happiness when you are in my life.</p>

<p>I am truly grateful and blessed to be your man, a privilege I will cherish for all my life. I am longing for the moment when I finally get to see you and hold you in my arms.

Every day I think about the days left until I meet you. And when I look back at how quickly these six months have passed, it makes me excited because each passing day means we are one day closer to living together. That thought comforts me whenever the distance feels heavy.</p>

<p>I see the effort you put in every single day. It makes me proud of you, and at the same time it makes me worry about you. I always pray that you stay in the best of health because that matters the most to me. I pray that everything you wish to achieve comes true, and I get to be part of your journey, being your peace, your strength, and your support.</p>

<p>Thank you so much, love, for always being there and for showing me what true love feels like. Keep chasing your dreams, but also take care of yourself.</p>

<p>I am always here with you. Soon, this distance will end, and we will build our dreams together, side by side.</p>

<p>I love you ❤️</p>

<p>Yours always,</p>

<p>Akash</p>
`;

function startTyping() {

  if (typingInProgress) return; // prevent double start
  typingInProgress = true;

  letterText.innerHTML = "";
  typingTimeouts.forEach(t => clearTimeout(t));
  typingTimeouts = [];

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = message;
  const nodes = Array.from(tempDiv.childNodes);

  let paragraphIndex = 0;

  function typeParagraph() {

    if (paragraphIndex >= nodes.length) {
      typingInProgress = false;
      return;
    }

    const node = nodes[paragraphIndex];

    if (node.nodeType === 1) {
      const newElement = document.createElement(node.tagName);
      letterText.appendChild(newElement);

      let text = node.innerHTML;
      let i = 0;

      function typeChar() {
        if (i < text.length) {
          newElement.innerHTML += text.charAt(i);
          i++;
          let t = setTimeout(typeChar, 35);
          typingTimeouts.push(t);
        } else {
          paragraphIndex++;
          let t = setTimeout(typeParagraph, 500);
          typingTimeouts.push(t);
        }
      }

      typeChar();

    } else {
      paragraphIndex++;
      typeParagraph();
    }
  }

  typeParagraph();
}

draw();

window.addEventListener("DOMContentLoaded", function(){

  setTimeout(function(){
  const loader = document.getElementById("preloader");
  if(loader){
    loader.style.opacity = "0";
    setTimeout(()=>{
      loader.style.display = "none";
    },1000);
  }
},3000); // stays for 3 seconds
});

window.addEventListener("DOMContentLoaded", function(){

  const musicToggle = document.getElementById("musicToggle");

  musicToggle.addEventListener("click", function(){

    if(music.paused){
      music.play().then(()=>{
        musicToggle.innerHTML = "⏸";
      }).catch(err=>{
        console.log("Play blocked:", err);
      });

    } else {
      music.pause();
      musicToggle.innerHTML = "▶";
    }

  });

});

const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", function(){

  typingTimeouts.forEach(t => clearTimeout(t));
typingTimeouts = [];
typingInProgress = false;
letterText.innerHTML = "";

  // Hide final scene
  finalScene.style.opacity = 0;
  finalScene.style.pointerEvents = "none";

  // Reset envelope
  envelope.classList.remove("open");
  envelope.classList.remove("fadeOut");
  void envelope.offsetWidth; // 🔥 important reset

  document.getElementById("letterPage").classList.remove("show");

  // Hide button again
  backBtn.style.opacity = "0";
  backBtn.style.pointerEvents = "none";

  letterText.innerHTML = ""; // 🔥 reset typing

  // Reset player positions
  player = {x:1,y:1};
  autoPlayer = {x:size-2,y:size-2};
  autoStep = 0;
  autoPath = findPath(autoPlayer, center);
  autoPath.shift();

  // Show maze UI again
  document.querySelector(".mazeContainer").style.display="flex";
  document.querySelector(".controls").style.display="flex";
  document.querySelector(".title").style.display="block";

  draw();
});