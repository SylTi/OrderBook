/*jslint node: true,mocha:true */
'use strict';

var should = require('should');
var exchange = require("./exchange").Exchange;
var order = require("./exchange").Order;

describe("Exchange", function() {
	var myexchange = new exchange();
	before(function(done)
	{
		var order1 = new order("BUY", 0.5, 100);
		var order2 = new order("BUY", 0.49, 50);
		var order3 = new order("BUY", 1, 10);
		var order4 = new order("SELL", 0.5, 30);
		var order5 = new order("SELL", 2, 100);
		var order6 = new order("SELL", 1, 200);

		myexchange.addOrder(order1);
		myexchange.addOrder(order2);
		myexchange.addOrder(order3);
		myexchange.addOrder(order4);
		myexchange.addOrder(order5);
		myexchange.addOrder(order6);

		done();
	});
	it('should add and execute a market BUY order', function (done) {

		myexchange.ordersSell.front().price.should.equal(1);
		myexchange.ordersSell.front().volume.should.equal(200);

		myexchange.doMarketOrder(new order('Market BUY', 0, 400));
		myexchange.getNextSell().should.equal(0);
		done();
	});
	it('should execute a market SELL order', function (done) {
		myexchange.doMarketOrder(new order('Market SELL', 0, 140));
		myexchange.getNextBuy().volume.should.equal(40);
		myexchange.getNextBuy().price.should.equal(0.5);
		done();
	});
	it('should add a buy stop order', function (done) {
		myexchange.addStop(new order('BUY Stop', 0.5, 10));
		done();
	});
	it('should trigger stop buy', function (done) {
		myexchange.doMarketOrder(new order('Market SELL', 0, 60));
		myexchange.ordersBuy.front().price.should.equal(0.49);
		myexchange.ordersBuy.front().volume.should.equal(20);
		myexchange.ordersBuyStop.size().should.equal(0);
		myexchange.ordersSell.size().should.equal(0);
		done();
	});
	it('should add and trigger stop sell', function (done) {
		var order4 = new order("SELL", 0.5, 30);
		var order5 = new order("SELL", 2, 100);
		var order6 = new order("SELL", 1, 200);

		myexchange.addOrder(order4);
		myexchange.addOrder(order5);
		myexchange.addOrder(order6);

		myexchange.addStop(new order('SELL Stop', 0.6, 20));
		myexchange.doMarketOrder(new order('Market BUY', 0, 100));
		myexchange.ordersBuy.size().should.equal(1);
		myexchange.ordersSell.size().should.equal(2);
		myexchange.ordersBuyStop.size().should.equal(0);
		myexchange.ordersSellStop.size().should.equal(0);
		myexchange.ordersSell.front().price.should.equal(1);
		myexchange.ordersSell.front().volume.should.equal(110);
		done();
	});
});