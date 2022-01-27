/*==================================================
Main system
This script includes :
- Creation of player
- Player movements
- Interaction system
==================================================*/

var overlay = document.getElementById("other_overlay");
var world = document.getElementById("world_01");
var worldoffset=1920/3; // "Camera" offset relative to player
var worldpos=worldoffset;
world.style.left="0px";

var elem_interact = document.getElementById("INTERACT_ICON");

var cameraTargetPlayer;
var enableControls;

// Creates the player, handle interactions conditions, player movement, animations, and misc (warning : it's a huge mess)
function CreatePlayer(elementID) {
	var self = this;
	
	this.elem = document.getElementById(elementID);
	// this.elem : the element assigned as the player

	this.x = -50;
	// this.x : x position of the player, relative to world element
	
	this.y = 75;
	// this.y : y position of the player, relative to world element
	
	this.speed = 5;
	// this.speed : ¨layer's speed
	
	this.curkey = false;
	// this.curkey : Current (last but active) key pressed on keyboard
	
	this.canInteract = false;
	// this.canInteract : Is the player can interact with something (don't change this value, it handles interact conditions)
	
	this.canmove = true;
	// this.canmove : enable or disable player's ability to move or interact
	
	this.endEvent = false;
	// this.endEvent : Used in the end of the game (don't change it)
	
	this.firstmove = false;
	// this.firstmove : Used for the start of the game (don't change it !!!)
	
	cameraTargetPlayer = true;
	/* ================================================== */
	
	this.elem.style.position = "absolute";
	
	setSprite(self.elem.id,ANIM_PLAYER_IDLE)
	overlay.style.backgroundImage = "url(imgs/ui/title.png)";
	
	// Updates player css, camera position, and checks if interact icon can be shown or not
	this.update = function() {
		this.elem.style.bottom = this.y+"px"; // On set via css la position Y du joueur
		this.elem.style.left = this.x+"px"; // Même chose mais pour la position X
		
		if (cameraTargetPlayer) {
			LerpWorldPos(self.x,0.02);
		}
		
		if (self.canInteract !== false) {
			elem_interact.classList.remove("ICON_FORCEHIDE");
			
			if ( interactElements[self.canInteract] == "self" ) {
				elem_interact.style.left = this.x+this.elem.offsetWidth/2+"px";
				elem_interact.style.bottom = (this.y+this.elem.offsetHeight)+"px";
			} else if (typeof interactElements[self.canInteract] == "object") {
				elem_interact.style.left = interactElements[self.canInteract].left+"px";
				elem_interact.style.bottom = interactElements[self.canInteract].bottom+"px";
			}
			
		} else {
			elem_interact.classList.add("ICON_FORCEHIDE");
			// elem_interact.classList.remove("ICON_SHOW");
		}
		var rect1 = elem_interact.getBoundingClientRect();
		var rect2 = dialogbox_dynamic.getBoundingClientRect();
		var overlap = (!(rect1.right < rect2.left || rect1.left > rect2.right) && dialogbox_dynamic.style.visibility == "visible")
		if (overlap){
			elem_interact.style.visibility = "hidden";
		} else {
			elem_interact.style.visibility = "visible";
		}
	}
	
	/* ================================================== */
	
	document.onkeydown = function() {
		self.checkKey();
	} 
	
	document.onkeyup = function(e) {
		self.curkey = false;
	}

	this.checkKey = function(e) {
		e = e || window.event;
		self.curkey = e.keyCode;
		
		if (self.canmove) {
			if (e.keyCode == '38') { 
				if (self.canInteract !== false) {
					interactFuncs[self.canInteract]();
				}
			}
		}
	}
	
	// Player movement related
	setInterval(function(){
		if (self.canmove) {
			if (self.curkey == '38') {
				// up arrow, utilisé actuellement pour interagir avec les éléments
			}
			else if (self.curkey == '37') {
				// left arrow
				if (!self.endEvent) {
					self.x-=self.speed;
					setSprite(self.elem.id,ANIM_PLAYER_WALK_LEFT)
				}
			}
			else if (self.curkey == '39') {
				// right arrow
				self.x+=self.speed;
				
				if (!self.firstmove) {
					showObjectifs();
					self.firstmove = true;
					overlay.classList.add("overlayHide")
				}
				
				if (self.endEvent) {
					setSprite(self.elem.id,ANIM_PLAYER_WALK_DEAD)
				} else {
					setSprite(self.elem.id,ANIM_PLAYER_WALK_RIGHT)
				}
				
			} else {
				setSprite(self.elem.id,ANIM_PLAYER_IDLE)
			}
		} else if (isInChoice) {
			if (self.curkey == '37') {
				fChoix1();
			}
			else if (self.curkey == '39') {
				fChoix2();
			}
		}
		self.update();
	},10);
}

// Not used, actually using sprite functions
/*
function createNPC(element,framerate,imgs) {
	var self = this;
	element = document.getElementById(element);
	
	this.element = element;
	
	this.sprites = imgs;
	
	this.cursprite = 0;
	
	setInterval(function(){
		self.element.src = self.sprites[self.cursprite];
		self.cursprite++
		if (self.cursprite > self.sprites.length) {
			self.cursprite=0;
		}
	},framerate)
}
*/

var interactID = 0;
var interactFuncs = [];
var interactElements = [];

// Create interactions:
/*
@ply : the player
@type : The type of interaction position (is it static position or relative to an npc position)
@arg : Depends on the type (position + radius OR element to track)
@func : The function to execute if player interact with this
*/
function interact(ply,type,arg,func) {
	var self = this;
	
	self.id = interactID;
		
	// TYPE POS : If the player is close to 'arg' position
	// arg[0] == center of position ; arg[1] == radius
	if (type == 'pos') {
		
		interactElements[interactID] = "self";
		
			self.interval = setInterval(function(){
				if (document.getElementById("world_0"+arg[2]).style.visibility == "visible") {
					if (ply.x > arg[0]-arg[1] && ply.x < arg[0]+arg[1]) {
						ply.canInteract = self.id;
					} else if (ply.canInteract == self.id) {
						ply.canInteract = false;
					}
				}
			}
					,10);
	} else if(type == 'npc') {
		arg = document.getElementById(arg)
		
		interactElements[interactID] = {
			left: parseInt(arg.style.left)+arg.offsetWidth/2,
			bottom: parseInt(arg.style.bottom)+arg.offsetHeight
		}
		
		self.interval = setInterval(function(){
			if (arg.parentNode.style.visibility == "visible") {
				if (ply.x > parseInt(arg.style.left)-50-arg.offsetWidth/2 && ply.x < parseInt(arg.style.left)-arg.offsetWidth/2+parseInt(arg.style.width)+50) {
					ply.canInteract = self.id;
				} else if (ply.canInteract == self.id) {
					ply.canInteract = false;
				}
			}
		},10);	
	}
	
	interactFuncs[interactID] = func;
	interactID++
}

/*==================================================
Fonctions caméra
==================================================*/

// Makes "camera" position smooth
function LerpWorldPos(lerpPos,lerpSpeed) {
	var pos = 0;
	worldpos = lerp(worldpos,lerpPos,lerpSpeed); // On update la position du world (la caméra)
	if (worldpos < 0) {
		world.style.left = "0px"
	} else if (worldpos > 19947-window.innerWidth) {
		world.style.left = -(19947-window.innerWidth-worldoffset)+"px";
		pos = 19947-window.innerwidth;
	} else {
	pos = worldpos-worldoffset
	world.style.left = "-"+pos+"px"; // On applique la valeur ci-dessus via css
	}
	parralaxWorldPos(pos,"world0"+currentWorld+"_parralax")
}

// Function to create the background parralax
function parralaxWorldPos(pos,element) {
	element = document.getElementById(element);
	if (pos < 0) {
		element.style.left = "0px"
	} else {
		element.style.left = pos*.83+"px";
	}
}

var cameraInterval;
var cameraTimeout;
// Makes camera look at a position instead of the player (for a given time)
function cameraLookAt(pos,time,lerpSpeed) {
	cameraTargetPlayer = false;
	clearInterval(cameraInterval)
	clearTimeout(cameraTimeout)
	
	cameraInterval = setInterval(function(){
		LerpWorldPos(pos,lerpSpeed)
	},5)
	cameraTimeout = setTimeout(function(){
		clearInterval(cameraInterval);
		cameraTargetPlayer = true
	},time)
}

var WORLD_TRAVELERS = document.getElementById("WORLD_TRAVELERS").innerHTML; 
document.getElementById("WORLD_TRAVELERS").innerHTML = "";

// Set le joueur et d'autres éléments dans un autre world
var currentWorld = 1;

// Handle world traveling : change what is shown, move certains elements in other divs and re assign some elements (because they got removed and inserted somewhere else)
function travel(worldID) {
	document.getElementById("world_0"+currentWorld).style.visibility = "hidden"; // Cache le world d'avant
	document.getElementById("world_0"+worldID).style.visibility = "visible"; // Cache le world d'avant

	document.getElementById("world_0"+currentWorld+"_init").innerHTML = "";
	document.getElementById("world_0"+worldID+"_init").innerHTML = WORLD_TRAVELERS;
	world = document.getElementById("world_0"+worldID);
	dialogbox_dynamic = document.getElementById('DIALOGBOX_DYNAMIC');
	elem_interact = document.getElementById("INTERACT_ICON");
	
	if (typeof ANIM_INTERACT !== "undefined" ) {
		setSprite("INTERACT_ICON",ANIM_INTERACT)
	}
	
	currentWorld = worldID;
	if (typeof player !== "undefined") {
		player.elem = document.getElementById("player_test");
		player.canInteract = false;
	}
}

var transition_overlay = document.getElementById("transition_overlay");
// Cool fade in and out animation for traveling
function playerTravel(ply,worldID) {
	transition_overlay.style.backgroundColor = "black"
	ply.canmove = false;
	setTimeout(function(){
	transition_overlay.style.backgroundColor = "transparent"
	ply.x = 0;
	worldpos = 0;
	ply.canmove = true;
	travel(worldID)	
	},2500)
}

travel(1)