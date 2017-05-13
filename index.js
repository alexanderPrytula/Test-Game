'use strict';

const
	chance = require('chance')(),
	_ = require('lodash');

const
	config = require('./config'),
	logger = require('./logger')({level: 'info'});

class FireTower {
	constructor(range) {
		this.range = range || 
		chance.natural({max: _.get(config, 'FireTower.defaultRange')});
	}
}

class Enemy {
	constructor(options = {
		name: `Bot${chance.character()}`,
		initialDistance: chance.natural({max: _.get(config, 'Enemy.maxDefaultDistance')}),
		speed: chance.natural({max: _.get(config, 'Enemy.maxDefaultSpeed')})
	}) {
		Object.assign(this, options);
		this.currentDistance = this.initialDistance;
	}
}

class Game {
	constructor(options = {enemies: []}) {
		this.Enemies = this.initEnemies(options.enemies);
		this.FireTower = new FireTower();

		this.logCurrentState();
		this.start();
	}

	initEnemies(arr) {
		let i = arr.length;
		while (i) {
			arr[--i] = new Enemy();
		}
		return arr;	
	}

	start() {

	}

	logCurrentState() {
		logger.info('==================== Game start ====================');	
		logger.info('Tower:\n\t\tfiring range: %d', this.FireTower.range);
		logger.info('Enemies:');
		this.Enemies.forEach(enemy => {
			logger.info('\t\tname: %s\tdistance: %d\tspeed: %d',
			enemy.name,
			enemy.currentDistance,
			enemy.speed);		
		});
	}
}

new Game({
	enemies: new Array(_.get(config, 'defaultNumberOfEnemies'))
});

