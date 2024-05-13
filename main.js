var readline = require('readline');
const { writeFileSync, open } = require('fs');

var highscores;
open('./highscore.json', 'r+', function (err, f) {
    if (err) {
        open('./highscore.json', "w", (err) => console.error(err))
        writeFileSync("./highscore.json", JSON.stringify({scores:[]}, null, 2), 'utf8');
    }
    highscores = require("./highscore.json")
})


readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY)
    process.stdin.setRawMode(true);

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  
]

var player = {
    x: 1,
    y: 1,
    dx: 0,
    dy: 1
}
var clones = [];
var fruit = {
    x: 5,
    y: 5
}
var score = 0;
var startTime = new Date().getTime() / 1000;
var started = false;
var running;

function start() {
    clearInterval(running)
    console.log("press any key that doesn't have a function")
    started = false;
    player.x = 1;
    player.y = 1;
    player.dx = 0;
    player.dy = 1;
}

process.stdin.on('keypress', (chunk, key) => {
    if(!started) {
        started = true;
        running = setInterval(() => {
            Update()
        }, 300)                    
    }
    if (key && key.name == 'q') process.exit();
    else {
        switch (key.name) {
            case "d":
                player.dx = 1;
                player.dy = 0;
                break;
            case "a":
                player.dx = -1;
                player.dy = 0;
                break;
            case "s":
                player.dx = 0;
                player.dy = 1;
                break;
            case "w":
                player.dx = 0;
                player.dy = -1;
                break;
            case "r":
                start()
                break;
        }
    }
});

const getEmoji = (d) => {
    switch(d) {
        case 0:
            return "⬜";
        case 1:
            return "⬛"
        case 2:
            return "😀"
        case 3:
            return "🟡"
        case 4:
            return "🟢"
    }
}

const DrawEndScreen = () => {
    console.clear()
        
        console.log("                               ")
        console.log("                               ")
        console.log("                               ")
        console.log("                               ")
        console.log("            you lost           ")
        console.log("                               ")
        console.log("                               ")
        console.log("                               ")
        console.log("                               ")
    
    for (var i = 0; i < highscores.scores.length; i++) {
        if(highscores.scores[i].score < score) {
            console.log("         new highscore!         ")
            break;
        }
    }
    console.log(" i  |    scores          ")
    console.log("__________________________")
    for (var i = 0; i < highscores.scores.length; i++) {
        if(i == highscores.scores.length-1) console.log(` ${i+1}  |  score ${highscores.scores[i].score}     |  ${Math.floor(highscores.scores[i].time)} seconds <--- current score`)
            else console.log(` ${i+1}  |  score ${highscores.scores[i].score}     |  ${Math.floor(highscores.scores[i].time)} seconds`)
    }
    console.log("\n");
    console.log("press r to restart.");
    console.log("press q to quit.");
}

const end = ()=> {
    // END
    clearInterval(running)
    var endTime = new Date().getTime() / 1000;
    highscores.scores.push({score, time: endTime-startTime})
    
    running = setInterval(() => {
        DrawEndScreen();
    }, 500)
        
    try {
        writeFileSync("./highscore.json", JSON.stringify(highscores, null, 2), 'utf8');
    } catch (error) {
        console.log('An error has occurred saving scores ', error);
    }
    

}

const addClone =() => {
    if(clones.length == 0) {
        clones.push({
            x: player.x - player.dx, y: player.y - player.dy,
            prevX: 0, prevY: 0
        })
    }else {
        clones.push({
            x: clones[clones.length-1].x - player.dx, 
            y: clones[clones.length-1].y - player.dy,
            prevX: 0,
            prevY: 0,
        })
    }
    score++;
}

const UpdatePlayer = () => {
    map[player.y][player.x] = 0;

    for (let i = 0; i < clones.length; i++) {
        map[clones[i].y][clones[i].x] = 0
        clones[i].prevX =clones[i].x;
        clones[i].prevY =clones[i].y;
        if(clones[i].x == fruit.x && clones[i].y == fruit.y) {
            map[fruit.y][fruit.x] = 0
            fruit.x = Math.floor(Math.random() * 7)+1    
            fruit.y = Math.floor(Math.random() * 7)+1 
            addClone()
        }
        if(i == 0) {
            clones[i].x = player.x
            clones[i].y = player.y
        }else {
            clones[i].x = clones[i-1].prevX
            clones[i].y = clones[i-1].prevY
        }
        
        map[clones[i].y][clones[i].x] = 3
    }
    
    if(player.x == fruit.x &&
        player.y == fruit.y) 
    {
        // GOT THE FRUIT
        map[fruit.y][fruit.x] = 0
        fruit.x = Math.floor(Math.random() * 7)+1    
        fruit.y = Math.floor(Math.random() * 7)+1 
        addClone()
    }else if(player.x + player.dx < 9 && player.x + player.dx >= 1 &&
        player.y + player.dy < 9 && player.y + player.dy >= 1 &&
        map[player.y + player.dy][player.x + player.dx] !== 3) 
    {
        // MOVE PLAYER
        player.x += player.dx;
        player.y += player.dy;
    }else {
        end()
    }
    map[player.y][player.x] = 2;
}

function Update() {
    console.clear();
    try {
        UpdatePlayer()
        console.log(`SCORE - ${score}`)
        map[fruit.y][fruit.x] = 4;
        for (let i = 0; i < map.length; i++) {
            let row = "";
            for (let x = 0; x < map[i].length; x++) {
                row += getEmoji(map[i][x])
            }
            console.log(row)
        }
        console.log("press a,s,w,or d to move")
        console.log("press q to leave")
    }catch(err){
        console.log(err)
        clearInterval(running)
        process.exit()
    }
    
}

start()