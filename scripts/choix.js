/*==================================================
FONCTIONS DU SYSTEME DE CHOIX
Permet de faire des choix entre une proposition A et B
==================================================*/

var choicebox = document.getElementById("CHOICEBOX"),
	choicebox_text = document.getElementById("CHOICEBOX_TEXT"),
	choicebox_choice1 = document.getElementById("CHOICEBOX_CHOICE1"),
	choicebox_choice2 = document.getElementById("CHOICEBOX_CHOICE2")

var fChoix1, fChoix2;
var isInChoice = false;

// Show the choice box and sets the text relative to arguments below, also change choice1 and choice2 functions
function startChoice(maintext,choice1,choice2,choice1_act,choice2_act) {
	setSprite("player_test",ANIM_PLAYER_IDLE)
	isInChoice = true;
	player.canmove = false;
	choicebox.style.visibility = "visible";
	choicebox_text.innerHTML = maintext;
	choicebox_choice1.innerHTML = choice1;
	choicebox_choice2.innerHTML = choice2;
	
	fChoix1 = function() {
		choice1_act();
		endChoice();
	};
	
	fChoix2 = function() {
		choice2_act();
		endChoice();
	};
	
	/*
	choicebox_choice1.onclick = function(){fChoix1()};
	choicebox_choice2.onclick = function(){fChoix2()};
	*/
}

// Hide the choice box
function endChoice() {
	isInChoice = false;
	if (inDialogue) {
		player.canmove = true;
	}
	choicebox.style.visibility = "hidden";
}