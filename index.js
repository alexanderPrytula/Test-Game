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
			chance.natural({
				max: _.get(config, 'FireTower.maxDefaultRange'),
				min: _.get(config, 'FireTower.minDefaultRange')
			});

		this.defeated = false;
	}

	get isAlive() {
		return !this.defeated;
	}

	kill() {
		this.defeated = true;
	}
}

class Enemy {
	constructor(options = {
		name: `Bot${chance.character({alpha: true})}`,
		initialDistance: chance.natural({
			max: _.get(config, 'Enemy.maxDefaultDistance'),
			min: _.get(config, 'Enemy.minDefaultDistance')
		}),
		speed: chance.natural({
			max: _.get(config, 'Enemy.maxDefaultSpeed'),
			min: _.get(config, 'Enemy.minDefaultSpeed')
		})
	}) {
		Object.assign(this, options);
		this.currentDistance = this.initialDistance;
		this.deathInfo = {};
		this.killed = false;
	}
}

class Game {
	constructor(options = {enemies: []}) {
		this.Enemies = this.initEnemies(options.enemies);
		this.FireTower = new FireTower();
		this.turn = 0;

		this.logInitialState();
		this.start();
	}

	initEnemies(arr) {
		let i = arr.length;
		while (i) {
			arr[--i] = new Enemy();
		}
		return arr;	
	}

	getAliveEnemies() {
		return this.Enemies.filter(enemy => !enemy.killed);
	}

	start() {
		do {
			this.turn++;

			this
				.getAliveEnemies()
				.forEach((enemy, i) => {
				if (enemy.currentDistance <= this.FireTower.range) {
					enemy.deathInfo = {
						turn: this.turn,
						distance: enemy.currentDistance
					};
					enemy.killed = true;
				} else {
					enemy.currentDistance -= enemy.speed;
					if (enemy.currentDistance < 0) {
						this.FireTower.kill();
						this.calculateMinRange(
							(enemy.currentDistance + enemy.speed), 
							this.getAliveEnemies()
						);
					}
				}	
			});	
		} while (this.Enemies.some(enemy => !enemy.killed) && this.FireTower.isAlive)
		
		this.logSummary(this.FireTower.isAlive);
	}

	calculateMinRange(stepBack, alive) {
		const remains = alive.filter(enemy => enemy.currentDistance > stepBack);
		if (!remains.length) {
			this.minimalRangeToWin = stepBack;
			return;
		} else {
			const steps = this.getEnemiesFullSteps(remains.map(enemy => {
				return {
					distance: enemy.currentDistance,
					speed: enemy.speed
				};
			}))
			const allSteps = _.flatten(steps).sort((a, b) => a - b);
			this.minimalRangeToWin = allSteps[_.sortedIndex(allSteps, stepBack)];
		}
	}

	getEnemiesFullSteps(enemies) {
		return enemies.map(({distance, speed}) => {
			const steps = [distance];
			while (distance >= 0) {
				steps.push(distance -= speed);
			}
			return steps;
		});
	}

	logInitialState() {
		logger.info('==================== Game start ====================');	
		logger.info('Tower:\n\t\tfiring range: %dm', this.FireTower.range);
		logger.info('Enemies:');
		this.Enemies.forEach(enemy => {
			logger.info('\t\tname: %s\tdistance: %d\tspeed: %d',
				enemy.name,
				enemy.currentDistance,
				enemy.speed
			);		
		});
	}

	logSummary(result) {
		logger.info('==================== Game end =======================');
		logger.info('Result: You %s the game', result ? 'win' : 'lose');
		if (result) {
			logger.info('Tower:\n\t\tfiring range: %dm', this.FireTower.range);
			this.Enemies.forEach(enemy => {
				logger.info('Turn %d: Kill %s at %dm', 
					enemy.deathInfo.turn,
					enemy.name,
					enemy.deathInfo.distance
				);
			});		
		} else {
			logger.info('Your minimal range to win is: %d', this.minimalRangeToWin);	
		}
	}
}

module.parent ? 
	Object.assign(exports, {
		FireTower,
		Enemy
	}) :
	new Game({enemies: new Array(_.get(config, 'defaultNumberOfEnemies'))});

