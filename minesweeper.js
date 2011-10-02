/*
	minesweeper.js
	Author: Jeff

	This file defines the two objects that bring minesweeper into life
	While it was really fun to write this code, it was late at night, and
	I was so sleepy. Some refactorings may be necessary ;)
*/
function MineSweeper(width, height, bombs){

	this._width = width;
	this._height = height;
	this._bombs = bombs;
	this.allNodes = [];
	this._squareCount = width*height - bombs;

	this._gameover = false;

}

MineSweeper.prototype = {

	get width() { return this._width; },
	set width(width) { this._width = width; },
	get height() { return this._height; },
	set height(height) { this._height = height; },
	get bombs() { return this._bombs; },
	set bombs(bombs) { this._bombs = bombs; },

	construct : function(div){
		var table = document.createElement("table");
		table.className = "ms-tb";
		for(var i = 0; i < this.height; i++){
			var tr = document.createElement("tr");
			tr.className = "ms-tr";
			this.allNodes.push([]);
			for(var j = 0; j < this.width; j++){
				var td = document.createElement("td");
				td.className = "ms-td idle mark-SAFE";
				td.cell = new Node(j, i, td, this);
				tr.appendChild(td);
				this.allNodes[i].push(td.cell);
			}
			table.appendChild(tr);
		}
		for(var y in this.allNodes)
			for(var x in this.allNodes[y])
				this.allNodes[y][x].around = Node._around( this.allNodes[y][x] );
		while(this._bombs > 0){
			var x = Math.round( Math.random() * (this.width  - 1) );
			var y = Math.round( Math.random() * (this.height  - 1) );
			if(this.allNodes[y][x].hasBombIn()) continue;
			this.allNodes[y][x].putBombIn();
			this._bombs--;
		}
		div.appendChild(table);
	},
	isGameOver: function(){ return this._gameover; },
	loseGame: function(){ 
		this._gameover = true; 
		for(var i in this.allNodes) 
			for(var j in this.allNodes)
				if(this.allNodes[i][j].hasBombIn()) Node._formatTd(this.allNodes[i][j]);
		alert("I'm sorry, you lost the game..."); 
	},
	winGame: function(){
		this._gameover = true;
		alert("Congratulations! You have won the game!!!"); 
	}

}

function Node(x, y, td, minesweeper){
	this._x = x;
	this._y = y;
	this._td = td;
	this._minesweeper = minesweeper;
	this._bomb = false;
	this._number = 0;
	this._mark = Node.SAFE;
	var _this = this;
	td.onclick = function(){ Node.reveal(_this); };
	td.onkeyup = function(e){ alert(e.which); };
	td.oncontextmenu = function(){ Node._mark(_this); return false; };
	this.revealed = false;
}

Node.SAFE = 0;
Node.DANGER = 1;
Node.DOUBT = 2;

Node._mark = function(node){
	if(node.minesweeper.isGameOver())return;
	if(node.revealed) return ;
	node._mark += 1;
	node._mark %= 3;
	Node._markTd(node); 
	return ;
}

Node._markTd = function(node){
	var mark = node.td.className;
	var state = "";
	if(node._mark == Node.SAFE) state = "SAFE";
	else if(node._mark == Node.DOUBT) state = "DOUBT";
	else if(node._mark == Node.DANGER) state = "DANGER";

	mark = mark.replace(/mark-(\w+)/, "mark-"+state);
	node.td.className = mark;
}

Node.reveal = function(node){
	if(!node) return;
	if(node._mark == Node.DANGER) return;
	if(node.minesweeper.isGameOver()) return;
	if (node.revealed) return;
	node.revealed = true;
	Node._formatTd(node);
	if(node.hasBombIn()) node.minesweeper.loseGame();
	if(node.bombsAround()) return;
	setTimeout(function(){
		for(var i in node.around){
			Node.reveal(node.around[i]);
		}
	}, 100);
}

Node._formatTd = function(node){
	if(node.hasBombIn()){
		node.td.innerHTML = "X";
		node.td.className = "ms-td bomb";
	}
	else{
		var b = node.bombsAround();
		node.td.innerHTML = (b) ? b : "";
		node.td.className = "ms-td revealed-ok number"+b;
		if( --node.minesweeper._squareCount == 0 ) node.minesweeper.winGame();
	}
}

Node._around = function(node){
	var around = [];
	if(node.x > 0){
		around.push(node.minesweeper.allNodes[node.y][node.x-1]);
		if(node.y > 0) around.push(node.minesweeper.allNodes[node.y-1][node.x-1]);
		if(node.y < node.minesweeper.height-1) around.push(node.minesweeper.allNodes[node.y+1][node.x-1]);
	}
	if(node.x < node.minesweeper.width-1){
		around.push(node.minesweeper.allNodes[node.y][node.x+1]);
		if(node.y > 0) around.push(node.minesweeper.allNodes[node.y-1][node.x+1]);
		if(node.y < node.minesweeper.height-1) around.push(node.minesweeper.allNodes[node.y+1][node.x+1]);
	}
	if(node.y > 0) around.push(node.minesweeper.allNodes[node.y-1][node.x]);
	if(node.y < node.minesweeper.height-1) around.push(node.minesweeper.allNodes[node.y+1][node.x]);
	return around;
}

Node.prototype = {

	get x() { return this._x; },
	set x(x) { this._x = x; },
	get y() { return this._y; },
	set y(y) { this._y = y; },
	get td() { return this._td; },
	set td(td) { this._td = td; },
	get minesweeper() { return this._minesweeper; },
	set minesweeper(minesweeper) { this._minesweeper = minesweeper; },

	putBombIn : function(){ 
		this._bomb = true;
		for(var i in this.around) this.around[i].putBombAround();
	},
	hasBombIn : function(){ return this._bomb; },
	bombsAround : function(){ return this._number; },
	putBombAround : function(){ this._number++; }
}
