

// Draw the board
var canvas = document.getElementById("main_canvas");

// Graphics context
var ctx = canvas.getContext("2d");

// Colors for the different tile values
var colors = [{n:2, col:"#ff8000"},{n:4, col: "#ff4000"}, {n:8, col:"#ff0000"} ,{n:16, col: "#ffff00"}, {n:32, col: "#b32d00"},{n:64, col: "#809fff"}, {n:128, col:"#1a53ff"},
			  {n:256, col:"#CC530F"},{n:512, col:"#C50352"},{n:1024, col:"#53079B"},{n:2048, col:"#080B87"},];

//2d array representing the board
var board; 

//Array representing the free tiles on the board
var empty; 

// Current Score
var score = 0; 

// Keys the user is holding down
var keysDown = [];

// Whether or not the board has changed with a key press
var moved = false;

// Wether or not the player has lost
var isGameOver = false;

// The 2048 tile has been reached
var won = false;
var resumed = false;
var showWinScreen = false;

// The distance the tile moves every refresh
var tileMove = 5;

// Sets up the board and starting tiles
initialise();

// Starts the game loop
main();

function reset(){
	if(won && !(resumed)){
		document.getElementById("reset").innerHTML="Reset";
		showWinScreen = false;	
		resumed = true;
	}
	else{
		initialise();
	}
}

// Clears the board and places the starting two tiles
function initialise (){
	won = false; resumed = false; showWinScreen = false;
	
	//resets
	board = [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]];
	
	//place the two starting tiles
	placeTile();
	placeTile();
	
	if(score > highscore)highscore = score;
}

// if we should be placing a tile once the animation is done
var shouldPlace = false;

// The main game loop
function main() {

	//render the board and tiles
	render();
	
	moved = false;
	update();
	
	// Check if the board has changed if so we should place a tile but need to wait for the animation
	if(moved){
		shouldPlace = true;	
	}
	
	// Check if we can place the new tile
	if(doneAnimation() && shouldPlace){
		placeTile();	
		shouldPlace = false;
	}
	
	// Request to do this again ASAP
	requestAnimationFrame(main);
};

function update(modifier){
	if (38 in keysDown) { // Player holding up
		up();
	}
	if (40 in keysDown) { // Player holding down
		down();
	}
	if (37 in keysDown) { // Player holding left
		left();
	}
	if (39 in keysDown) { // Player holding right
		right();
	}

	calcScore();
	
	//Can stop checking after win
	if(!won){
		won = checkWin();
		if(won){
			document.getElementById("reset").innerHTML="Resume";
			showWinScreen = true;		
		}	
	}

	 
	isGameOver = gameOver();
}

function checkWin(){
	for(var i = 0; i < 4; i++){
		for(var j = 0; j < 4; j++){
			if(board[i][j] != null){
				if(board[i][j].value == 2048){
					return true;
				}
			}
			
		}
	}
	return false;
}

// Returns wether or not the tiles are done animating
function doneAnimation(){
	for(var i = 0; i < 4; i++){
		for(var j = 0; j < 4; j++){
			if(board[i][j] != null){
				if(board[i][j].cX != board[i][j].tX || board[i][j].cY != board[i][j].tY){
					return false;
				}	
			}
			
		}
	}
	return true;
}


// Places a tile on the board on one of the random free locations
function placeTile(){
	empty = [];
		for(var i = 0; i < 4; i++){
			for(var j = 0; j < 4; j++){
				if(board[i][j] == null){	
					empty.push({
						x:i,
						y:j
					})	
				}
			}
		}

	var	value = Math.random() < 0.5 ? 2 : 4;//set the new tile value to 2 or 4	
	
	//Pick a random free space on the board
	if(empty.length > 0){
		var index = Math.floor((Math.random() * empty.length));
		
	board[empty[index].x][empty[index].y] = {
		cX:tileX(empty[index].x),
		cY:tileY(empty[index].y),
		tX:tileX(empty[index].x),
		tY:tileY(empty[index].y),
		value:value,
		size:10,
		combining:false	
	};
		
	//Remove tile from empty
	//empty.splice(index,1);	
	}
	else{
		drawGameOverScreen();//game over
	}
}

function tileX(index){
	return 40 + (index*20) + (index*100);			
}

function tileY(index){
	return 40 + (index*20) + (index*100);
}

// Returns if a there is space on the board to place a tile
function canPlaceTile(){
	empty = [];
		for(var i = 0; i < 4; i++){
			for(var j = 0; j < 4; j++){
				if(board[i][j] == null){	
					empty.push({
						x:i,
						y:j
					})	
				}
			}
		}
		
		if(empty.length > 0){
			return true;
		}
		return false;
}

function gameOver(){
	
	//Check the outside tiles
	for(var j = 0; j < 3; j++){
		if(board[3][j] == null || board[3][j+1] == null ||  board[3][j+1].value === board[3][j].value)return false;	
	}
	
	for(var i = 0; i < 3; i++){
		if(board[i][3] == null || board[i+1][3] == null ||  board[i+1][3].value === board[i][3].value)return false;
	}
	
	//check if any tiles next to each other are equal or null meaning the player has not lost
	for(i = 0; i < 3; i++){
		for(j = 0; j < 3; j++){


				//first check if any of the tiles around the current tile are null
				if(board[i][j] ==null || board[i][j+1] == null || board[i+1][j] == null ){
						return false;
				}
			
				//check if the tiles next to each other are equal
				if(board[i][j].value === board[i][j+1].value || board[i+1][j].value === board[i][j].value){
					return false;
				}	
		}	
	}
	return true;
}

function left(){
	//first move everything left
	for(var i = 1; i < 4; i++){
		var combined = false;
		for(var j = 0; j < 4; j++){
			if(board[i][j] !=null){		
				
				if(board[i-1][j] == null ){	
					moved = true;//the state of the board has changed	
					var ti = i-1;
					while(ti >= 0 && board[ti][j] == null){
							ti--;	
					}
					
					var t = {
						cX:tileX(i),
						cY:tileY(j),
						tX:tileX(ti+1),
						tY:tileY(j),
						value:board[i][j].value,	
						size:100,
						combining:false	
					};
					
					
					board[ti+1][j] = t;
					board[i][j] = null;
					
					board[ti+1][j].tX = tileX(ti+1);	
					
					if(ti >= 0 && !combined && board[ti+1][j].value === board[ti][j].value){
						board[ti][j].value = board[ti][j].value*2;
						board[ti+1][j] = null;
						
						//set the target tile values
						board[ti][j].cX = tileX(i);//added
						board[ti][j].tX = tileX(ti);
						board[ti][j].combining = true;
					}
					
				}
				else if(!combined && board[i][j].value === board[i-1][j].value){
					board[i-1][j].value = board[i-1][j].value*2;
					board[i][j] = null;
					moved = true;//the state of the board has changed
					
					//set the target and cur tile values
					board[i-1][j].cX = tileX(i);
					board[i-1][j].tX = tileX(i-1);
					board[i-1][j].combining = true;
				}			
			}
		}
	}
}

function right(){
	//first move everything right
	for(var i = 2; i >=0; i--){
		var combined = false;
		for(var j = 0; j < 4; j++){
			if(board[i][j] !=null){		
				
				if(board[i+1][j] == null ){
					moved = true;//the state of the board has changed		
					var ti = i+1;
					while(ti <= 3 && board[ti][j] == null){
							ti++;	
					}
					
					var t = {
						cX:tileX(i),
						cY:tileY(j),
						tX:tileX(ti-1),
						tY:tileY(j),
						value:board[i][j].value,	
						size:100,
						combining:false	
					};
					
					board[ti-1][j] = t;
					board[i][j] = null;	
					board[ti-1][j].tX = tileX(ti-1);
					

					
					if(ti < 4 && !combined && board[ti-1][j].value === board[ti][j].value){
						board[ti][j].value = board[ti][j].value*2;
						board[ti-1][j] = null;
						
						//set the target tile values
						board[ti][j].cX = tileX(i);
						board[ti][j].tX = tileX(ti);
						board[ti][j].combining = true;
					}
				}
				else if(!combined && board[i][j].value === board[i+1][j].value){
					board[i+1][j].value = board[i+1][j].value*2;
					board[i][j] = null;
					moved = true;//the state of the board has changed
					
					//set the target tile values
					board[i+1][j].cX = tileX(i);
					board[i+1][j].tX = tileX(i+1);
					board[i+1][j].combining = true;
				}	
				
			}
		}
	}

}

function up(){
	//first move everything up
	for(var i = 0; i < 4; i++){
		var combined = false;
		for(var j = 1; j <=3; j++){
			if(board[i][j] !=null){		
				
				if(board[i][j-1] == null ){
					moved = true;//the state of the board has changed		
					var tj = j-1;
					while(tj >= 0 && board[i][tj] == null){
							tj--;	
					}
					
					var t = {
						cX:tileX(i),
						cY:tileY(j),
						tX:tileX(i),
						tY:tileY(tj+1),
						value:board[i][j].value,	
						size:100,
						combining:false	
					};
					
					board[i][tj+1] = t;
					board[i][j] = null;	
					
					board[i][tj+1].tY = tileY(tj+1);
					
					if(tj >= 0 && !combined && board[i][tj+1].value === board[i][tj].value){
						board[i][tj].value = board[i][tj].value*2;
						board[i][tj+1] = null;
						
						//set the target tile values
						board[i][tj].cY = tileY(j);//added
						board[i][tj].tY = tileY(tj);
						board[i][tj].combining = true;
					}
				}
				else if(!combined && board[i][j].value === board[i][j-1].value){
					board[i][j-1].value = board[i][j-1].value*2;
					board[i][j] = null;
					moved = true;//the state of the board has changed
					
					
					//set the target tile values
					board[i][j-1].cY = tileY(j);
					board[i][j-1].tY = tileY(j-1);
					board[i][j-1].combining = true;
				}		
			}
		}
	}
}

function calcScore(){
	var curScore = 0;
	for(var i = 0; i < 4; i++ ){
		for(var j = 0; j < 4; j++ ){
			if(board[i][j] != null){
				curScore+=board[i][j].value;	
			}
		}
	}	
	score = curScore;
}

function down(){
	//first move everything down
	for(var i = 0; i < 4; i++){

		for(var j = 2; j >= 0; j--){
					var combined = false;
			if(board[i][j] !=null){		
				
				if(board[i][j+1] == null ){
					moved = true;//the state of the board has changed		
					var tj = j+1;
					while(tj <= 3 && board[i][tj] == null){
							tj++;	
					}
					
					var t = {
						cX:tileX(i),
						cY:tileY(j),
						tX:tileX(i),
						tY:tileY(tj-1),
						value:board[i][j].value,	
						size:100,
						combining:false	
					};
					
					
					board[i][tj-1] = t;//new location of tile
					board[i][j] = null;	
					
					board[i][tj-1].tY = tileY(tj-1);
					
					if(tj < 4 && !combined && board[i][tj-1].value === board[i][tj].value){
						board[i][tj].value = board[i][tj].value*2;
						board[i][tj-1] = null;
						
						//set the target tile values
						board[i][tj].cY = tileY(j);//added
						board[i][tj].tY = tileY(tj);
						board[i][tj].combining = true;
					}
				}		
				else if(!combined && board[i][j].value === board[i][j+1].value){
					board[i][j+1].value = board[i][j+1].value*2;
					board[i][j] = null;
					moved = true;//the state of the board has changed
					
					//set the target tile values
					board[i][j+1].cY = tileY(j);
					board[i][j+1].tY = tileY(j+1);
					board[i][j+1].combining = true;
				}	
			}
		}
	}
}

function render(){
	ctx.beginPath();
	drawBoard();
	ctx.stroke();
	drawTilesAnimated();
	drawScore();
	
	if(showWinScreen){
		drawWinScreen();	
	}
	if(isGameOver)drawGameOverScreen();
}

var aniSpeed = 30;
var sizeIncrease = 10;

// Colors 
var tileBackground = "#C2CAD1";
var background = "#9FA5AB";
var black = "#000000";
var white = "#FFFFFF";

function drawTilesAnimated(){
	for(var i = 0; i < 4; i++){
		for(var j = 0; j < 4; j++){
			if(board[i][j] != null){
				if(board[i][j].size < 100){
					var xD = (40 + (i*20) + (i*100) + 50) - board[i][j].size/2;
					var yD = (40 + (j*20) + (j*100) + 50) - board[i][j].size/2; 
				
					//Set tile Color 
					ctx.fillStyle = "#00FF00";
					for(var ic = 0; ic < colors.length; ic++){
						if(board[i][j].value == colors[ic].n){
						ctx.fillStyle = colors[ic].col;
						}
					}
				
					ctx.fillRect(xD, yD,board[i][j].size,board[i][j].size);
					board[i][j].size +=10;
				}
				else{
					
				if(board[i][j].cX > board[i][j].tX){// Should move left
					board[i][j].cX = board[i][j].cX-aniSpeed;
				}
				if(board[i][j].cX < board[i][j].tX){// Should move right
					board[i][j].cX = board[i][j].cX + aniSpeed;
				}
				if(board[i][j].cY > board[i][j].tY){// Should move down
					board[i][j].cY = board[i][j].cY - aniSpeed;
				}
				if(board[i][j].cY < board[i][j].tY){// Should move up
					board[i][j].cY = board[i][j].cY + aniSpeed;
				}
					ctx.fillStyle = "#00FF00";
				for(var ic = 0; ic < colors.length; ic++){
					if(board[i][j].value == colors[ic].n){
						ctx.fillStyle = colors[ic].col;
					}
				}
				
					ctx.font = "30px Arial";
					//ctx.fillStyle = "#000000";
					
					// Check if two tiles are being combines
					if(board[i][j].combining){
						
						// If the two tiles are now over top of each other just draw one and set combining to false
						if(board[i][j].cY == board[i][j].tY && board[i][j].cX == board[i][j].tX){
							board[i][j].combining = false;
							
						for(var ic = 0; ic < colors.length; ic++){
							if(board[i][j].value == colors[ic].n){
								ctx.fillStyle = colors[ic].col;
							}
						}	
							ctx.fillRect(board[i][j].cX, board[i][j].cY,100,100);
							ctx.fillStyle = white;
									
							var width = ctx.measureText(""+board[i][j].value).width/2;
							ctx.fillText(""+board[i][j].value,board[i][j].cX+50-width,board[i][j].cY+55);
						}
						//they do not overlap yet so draw both tiles
						else{
							for(var ic = 0; ic < colors.length; ic++){
									if(board[i][j].value/2 == colors[ic].n){
										ctx.fillStyle = colors[ic].col;
								}
							}	
							ctx.fillRect(board[i][j].cX, board[i][j].cY,100,100);
							ctx.fillRect(board[i][j].tX, board[i][j].tY,100,100);
							
							ctx.fillStyle = white;
							width = ctx.measureText(""+board[i][j].value).width/2;
							ctx.fillText(""+board[i][j].value/2,board[i][j].cX+50-width,board[i][j].cY+55);
							ctx.fillText(""+board[i][j].value/2,board[i][j].tX+50-width,board[i][j].tY+55);
						}
					}
					else{//the tiles are not combining so can just draw one
					
						for(var ic = 0; ic < colors.length; ic++){
							if(board[i][j].value == colors[ic].n){
								ctx.fillStyle = colors[ic].col;
							}
						}
						ctx.fillRect(board[i][j].cX, board[i][j].cY,100,100);
						ctx.fillStyle = white;
						width = ctx.measureText(""+board[i][j].value).width/2;
						ctx.fillText(""+board[i][j].value,board[i][j].cX+50-width,board[i][j].cY+55);	
					}
				}	
			}
		}
	}
}

function drawBoard(){
	//set Color to red 
	ctx.fillStyle = background;
	ctx.fillRect(20,20,500,500);
	
	ctx.strokeStyle=white;
	ctx.rect(20,20,500,500);
	ctx.fillStyle = tileBackground;

	var x,y;
	for(x = 40; x < 420; x+=120){
		for(y = 40; y < 420; y+=120){
			ctx.fillRect(x,y,100,100);
		}
	}	
}

function drawGameOverScreen(){
	//set Color to red 
	ctx.fillStyle = "#FF0000";
	ctx.globalAlpha=0.5;
	ctx.fillRect(20,20,500,500);
	ctx.globalAlpha=1;
	
	ctx.font = "64px Arial";
	ctx.fillStyle = black;
	var width = ctx.measureText("Game Over").width;
	ctx.fillText("Game Over",270-(width/2),250+40);
}

function drawWinScreen(){
	//set Color to green 
	ctx.fillStyle = "#00FF0D";
	ctx.globalAlpha=0.5;
	ctx.fillRect(20,20,500,500);
	ctx.globalAlpha=1;
	
	ctx.font = "64px Arial";
	ctx.fillStyle = black;
	var width = ctx.measureText("You Win!!").width;
	ctx.fillText("You Win!!",270-(width/2),250+40);
}

var highscore = 0;

function drawScore(){
	ctx.fillStyle = "#2B2C2E";
	ctx.fillRect(540,20,150,100);
	
	ctx.fillStyle = black;
	ctx.rect(540,20,150,100);
	
	ctx.fillStyle = "#2B2C2E";
	ctx.fillRect(540,140,150,100);
	
	ctx.fillStyle = black;
	ctx.rect(540,140,150,100);
	

	ctx.fillStyle = white;
	var width = ctx.measureText(""+score).width;
	ctx.fillText(""+score,615-(width/2),80);
	
	width = ctx.measureText(""+highscore).width;
	ctx.fillText(""+highscore,615-(width/2),200);
	
}

// Handle keyboard controls
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
	//update(5);
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);