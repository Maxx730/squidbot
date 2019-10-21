const slackbot = require('slackbots');
const axios = require('axios');
let users = new Array();
const phrases = [
	'gimmeammo'
];

const items = [
	'grenade',
	'potion',
	'ammunition'
]

//Revive dead people every 5 minutes.
setInterval(() => {
	users.map(user => {
		if(user.health === 0) {
			user.health = 30;
			bot.postMessageToChannel(TARGET_ROOM,`:angel: ${user.name} has been revived.`)
		}
	});
},300000)

const TARGET_ROOM = 'squid';

function findUser(id) {
	let foundUser = null;
	users.map(user => {
		if(user.id === id) {
			foundUser = user;
		}
	});

	return foundUser;
}

function findUserByName(name) {
	let foundUser = null;
	users.map(user => {
		if(user.name === name) {
			foundUser = user;
		}
	});

	return foundUser;
}

function formatHealth() {
	let healthString = '';

	users.map(user => {
		healthString += `*${user.name}:* ${user.health > 0 ? ':heart:' : ':skull:'} :small_orange_diamond: ${user.health}\n`;
	});

	return healthString;
}

function finishName(arr) {
	let fixedName = '';

	for(let i = 3;i < arr.length;i++) {
		if(i === 3) {
			fixedName = arr[i];
		} else {
			fixedName += ` ${arr[i]}`;
		}
	}

	return fixedName;
}

function addPoints(winner,amt) {
	users.map(user => {
		if(user.id === winner.id){
			user.score += amt;
		}
	});
}

function damageUser(name,amt,attacker,callback) {
	users.map(user => {
		if(user.name === name) {
			user.health - amt < 0 ? user.health = 0 : user.health -= amt;
			if(user.health > 0) {
				bot.postMessageToChannel(TARGET_ROOM,`${user.name} suffered ${amt} points of damage.`)
			} else {
				bot.postMessageToChannel(TARGET_ROOM,`:skull:  ${user.name} has died...`);
				if(callback) {
					callback();
				}
			}
		}
	});
}

function checkPhraes(text,user) {
	let amount = 0;
	phrases.map(phrase => {
		if(text.indexOf(phrase) > -1) {
			amount++;
			user.ammo++;
		}
	});

	if(amount > 0) {
		if(amount > 1) {
			bot.postMessageToChannel(TARGET_ROOM,`*${user.name}* recieved ${amount} rounds of ammunition.`);
		} else {
			bot.postMessageToChannel(TARGET_ROOM,`*${user.name}* recieved a round of ammunition.`);
		}
	}
}

function calculateDamage(rangeStart,rangeEnd) {
	return Math.ceil(Math.random() * rangeStart) + rangeEnd;
}

function hasAmmo(user) {
	if(user.ammo > 0) {
		return true;
	} else {
		bot.postMessageToChannel(TARGET_ROOM,`Sorry *${user.name}*, you are out of ammunition.`);
		return false;
	}
}

function isAlive(user) {
	if(user.health > 0) {
		return true;
	} else {
		bot.postMessageToChannel(TARGET_ROOM,`*${user.name}* is dead, dead men cannot shoot.`)
		return false;
	}
}

function targetAlive(target) {
	if(target.health > 0) {
		return true;
	} else {
		bot.postMessageToChannel(TARGET_ROOM,`*${target.name}* is already dead...`);
		return false;
	}
}

function getAction(cmd,requester) {
	if(cmd.split(' ').length > 2) {
		switch(cmd.split(' ')[2]) {
			case 'shoot':
				if(cmd.split(' ').length > 3) {
					let name = null;
					if(cmd.split(' ').length > 4) {
						name = finishName(cmd.split(' '));
					} else {
						name = cmd.split(' ')[3];
					}


					if(findUserByName(name)) {
						let found = findUserByName(name);
						if(targetAlive(found) && hasAmmo(requester) && isAlive(requester)) {
							bot.postMessageToChannel(TARGET_ROOM,`${found.name} :small_orange_diamond: :gun: :small_orange_diamond: ${requester.name}`);
							setTimeout(() => {
								requester.ammo--;
								damageUser(found.name,calculateDamage(6,4),requester);
							},500);
						}
					} else {
						bot.postMessageToChannel(TARGET_ROOM,'User does not exist.');
					}
				} else {
					bot.postMessageToChannel(TARGET_ROOM,'Target not specified.');
				}
			break;
			case 'grenade':
				if(requester.items.grenade > 0){
					bot.postMessageToChannel(TARGET_ROOM,`${requester.name} hurled a grenade.`);
					setTimeout(() => {
						requester.items.grenade--;
						users.map(user => {
							if(user.id !== requester.id) {
								damageUser(user.name,calculateDamage(16,4),requester);
							}
						});
					},500)
				} else {
					bot.postMessageToChannel(TARGET_ROOM,`*${requester.name}* is out of grenades.`)
				}
			break;
			case 'jihad':
				if(requester.health > 0) {
					bot.postMessageToChannel(TARGET_ROOM,`*${requester.name}* yells ALOHA SNACKBAR`);
					setTimeout(() => {
						users.map(user => {
							damageUser(user.name,calculateDamage(160,400),requester);
						});
					},500)
				} else {
					bot.postMessageToChannel(TARGET_ROOM,`*${requester.name}* is dead, unable to explode.`);
				}
			break;
			case 'potion':
				if(requester.items.potion > 0) {
					bot.postMessageToChannel(TARGET_ROOM,`*${requester.name}* used a potion. :tropical_drink:`);
					requester.items.potion--;
					requester.health += 30;
				}
			break;
			case 'kys':
				if(requester.health > 0) {
					bot.postMessageToChannel(TARGET_ROOM,`*${requester.name}* killed themself.`);
					setTimeout(() => {
						damageUser(requester.name,calculateDamage(160,400),requester);
					},500)
				} else {
					bot.postMessageToChannel(TARGET_ROOM,`*${requester.name}* already offed themself.`)
				}
			break;
			case 'whip':
				if(cmd.split(' ').length > 3) {
					let name = null;
					if(cmd.split(' ').length > 4) {
						name = finishName(cmd.split(' '));
					} else {
						name = cmd.split(' ')[3];
					}
	
	
					if(findUserByName(name)) {
						bot.postMessageToChannel(TARGET_ROOM,`*${requester.name}* started whipping the shit out of *${name}*`)
						let whipLoop = setInterval(() => {
							bot.postMessageToChannel(TARGET_ROOM,`*CRACK*`);
							damageUser(name,calculateDamage(5,4),requester,() => {
								clearTimeout(whipLoop);
							});
						},3000);
					} else {
						bot.postMessageToChannel(TARGET_ROOM,'User does not exist.');
					}
				} else {
					bot.postMessageToChannel(TARGET_ROOM,'Target not specified.');
				}
			break;
		}
	} else {
		bot.postMessageToChannel(TARGET_ROOM,'No action to do.');
	}
}

function showItem(cmd) {
	if(cmd.split(' ').length > 2) {
		switch(cmd.split(' ')[2]) {
			case 'health':
				bot.postMessageToChannel(TARGET_ROOM,formatHealth())
			break;
			case 'user':
				if(cmd.split(' ').length > 3) {
					let name = null;
					if(cmd.split(' ').length > 4) {
						name = finishName(cmd.split(' '));
					} else {
						name = cmd.split(' ')[3];
					}

					if(findUserByName(name)) {
						let found = findUserByName(name);
						bot.postMessageToChannel(TARGET_ROOM,`*${found.name}*\nHealth: ${found.health}\nAmmo: ${found.ammo}\n*Items*\nGrenades: ${found.items.grenade}\nPotions: ${found.items.potion}`);
					} else {
						bot.postMessageToChannel(TARGET_ROOM,'User does not exist.');
					}
				} else {
					bot.postMessageToChannel(TARGET_ROOM,'Username required.')
				}
			break;
		}
	}
}

const bot = new slackbot({
	token: 'xoxb-798237783552-785504416946-9OFTrcrveYhgN9hC399AvAS3',
	name: 'Squidbot'
});

bot.on('start',() => {
	bot.getUsers()._value.members.map(member => {
		if(member.profile.real_name !== 'Polly' && member.profile.real_name !== 'SquidBot' && member.profile.real_name !== 'Slackbot') {
			users.push({
				score:0,
				id: member.id,
				name: member.profile.real_name,
				health: 50,
				ammo: 10,
				items: {
					grenade: 1,
					potion: 1
				}
			});
		}
	});
});

bot.on('message',(data) => {
	switch(data.type) {
		case 'user_typing':
			return;
		case 'message':      
			//Verify that the user is part of this group and can
			//run commands.
			if(findUser(data.user)) {
				console.log(findUser(data.user).name)
				//Check if the user used any of the phrases
				checkPhraes(data.text,findUser(data.user));

				if(data.text.indexOf('sb show') > -1) {
					showItem(data.text);
				} else if(data.text.indexOf('sb action') > -1) {
					getAction(data.text,findUser(data.user));
				}
			}
		break;
	}
})