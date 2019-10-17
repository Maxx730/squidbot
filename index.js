const slackbot = require('slackbots');
const axios = require('axios');
let users = new Array();
const phrases = [
	'And now that your holes are in bloom...',
	'Nigglety Nigglety Nog, the cat buttfucked the frog...',
	'You are the squirting queeeeen!',
	'JOHNNY BRANMUFFINZZZZZ',
	'Ill pinch their dicks with this LOBSTA',
	'You N! You stupid N!',
	'ITS THE BALOON DILDO JAMBOREE, EVERYONES FAVORITE TIME OF YEAR'
]

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
		healthString += `*${user.name}:* :heart: :small_orange_diamond: ${user.health}\n`;
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

function damageUser(name,amt) {
	users.map(user => {
		if(user.name === name) {
			user.health -= amt;
		}
	});
}

function getAction(cmd,callback) {
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
						bot.postMessageToUser('max.kinghorn',`Shooting ${found.name}...`);

						setTimeout(() => {
							damageUser(found.name,10);
						},500);
					} else {
						bot.postMessageToUser('max.kinghorn','User does not exist.');
					}
				} else {
					bot.postMessageToUser('max.kinghorn','Target not specified.');
				}
			break;
		}
	} else {
		bot.postMessageToUser('max.kinghorn','No action to do.');
	}
}

function showItem(cmd) {
	if(cmd.split(' ').length > 2) {
		switch(cmd.split(' ')[2]) {
			case 'health':
				bot.postMessageToUser('max.kinghorn',formatHealth())
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
						bot.postMessageToUser('max.kinghorn',`*${found.name}*\nHealth: ${found.health}`);
					} else {
						bot.postMessageToUser('max.kinghorn','User does not exist.');
					}
				} else {
					bot.postMessageToUser('max.kinghorn','Username required.')
				}
			break;
		}
	}
}

const bot = new slackbot({
	token: 'xoxb-798237783552-785504416946-yoblznDa3NgxeVeTwZcGrUr1',
	name: 'Squidbot'
});

bot.on('start',() => {
	bot.getUsers()._value.members.map(member => {
		if(member.profile.real_name !== 'SquidBot' && member.profile.real_name !== 'Slackbot') {
			users.push({
				id: member.id,
				name: member.profile.real_name,
				health: 100
			});
		}
	});
});

bot.on('message',(data) => {
	switch(data.type) {
		case 'user_typing':
			return;
		case 'message':
			if(data.text.indexOf('SB: show') > -1) {
				showItem(data.text);
			} else if(data.text.indexOf('SB: action') > -1) {
				getAction(data.text);
			}
		break;
	}
})