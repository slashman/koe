var expect = require("chai").expect;
var combat = require("../combat/CombatService.js");
var model = require('../model');

beforeEach(function() {
	model.init();
	//simulate a user connecting using a fake socket
	model.sockets['somefakesocketid'] = {
		lastActiveSocket: 'somefakesocketid',
		lastAction: false, // valid timeframe
		color: '#1869c2',
		username: 'testUser',
		soldiers: 10
	};
});

describe("CombatService", function(){
   describe("#executeCombatStack()", function(){
   		it("should not return null or undefined", function(){
   			var user = {
				lastActiveSocket: 'somefakesocketid',
				lastAction: false, // valid timeframe
				color: 'red',
				username: 'testUser',
				soldiers: 10
			};
   			var attack = {
				user: user,
				model: model,
				target: {x: 1, y: 1}
			}

			var result = combat.executeCombatStack(attack);
			console.log(result);
			expect(result).to.not.equal(null);
			expect(result).to.not.equal(undefined);
		});
   });
   describe("#executeCombatStack()", function(){
   		it("should return false due to spamming", function(){
   			var user = {
				lastActiveSocket: 'somefakesocketid',
				lastAction: new Date().getTime() - 500,
				color: 'red',
				username: 'testUser',
				soldiers: 10
			};
   			var attack = {
				user: user,
				model: model,
				target: {x: 1, y: 1}
			}

			var result = combat.executeCombatStack(attack);
			console.log(result);
			expect(result).to.equal(false);
		});
   });
   describe("#executeCombatStack()", function(){
   		it("should return false due to adjacent conquered fiefs not found", function(){
   			var user = {
				lastActiveSocket: 'somefakesocketid',
				lastAction: new Date().getTime() - 2000, // valid timeframe
				color: 'red',
				username: 'testUser',
				soldiers: 10
			};
   			var attack = {
				user: user,
				model: model,
				target: {x: 1, y: 1}
			}

			var result = combat.executeCombatStack(attack);
			console.log(result);
			expect(result).to.equal(false);
		});
   });
   describe("#executeCombatStack()", function(){
   		it("should return false if attack power is not enough", function(){
   			var user = {
				lastActiveSocket: 'somefakesocketid',
				lastAction: false, // first action
				color: 'red',
				username: 'testUser',
				soldiers: 0 // not enough attack power
			};
   			var attack = {
				user: user,
				model: model,
				target: {x: 1, y: 1}
			}

			var result = combat.executeCombatStack(attack);
			console.log(result);
			expect(result).to.equal(false);
		});
   });
});