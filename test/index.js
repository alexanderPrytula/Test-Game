'use strict';

const
	should = require('should');

const
	config = require('../config'),
	{FireTower, Enemy} = require('../index');	

describe('Tower initialization', function() {
	const tower = new FireTower();

	it('Should verify that the Tower instance is properly created', function() {
		tower.should.be.ok();
		tower.should.have.property('range').which.is.a.Number()
			.within(config.FireTower.minDefaultRange, config.FireTower.maxDefaultRange);
		tower.should.have.property('defeated').which.is.a.Boolean();
	});
});

describe('Enemy initialization', function() {
	const enemy = new Enemy();

	it('Should verify that the Enemy instance is properly created', function() {
		enemy.should.be.ok();
		enemy.should.have.property('name').which.is.a.String();
		enemy.should.have.property('initialDistance').which.is.a.Number()
			.within(config.Enemy.minDefaultDistance, config.Enemy.maxDefaultDistance);
		enemy.should.have.property('speed').which.is.a.Number()
			.within(config.Enemy.minDefaultSpeed, config.Enemy.maxDefaultSpeed)
		enemy.should.have.property('currentDistance').equal(enemy.initialDistance);
		enemy.should.have.property('deathInfo').which.is.a.Object().and.be.empty();
		enemy.should.have.property('killed').which.is.a.Boolean();
	});
});

