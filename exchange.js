/*jslint node: true */
'use strict';

var Heap = require('heap');


var Order = function (type, price, volume) {
	this.currencyPair = { currency1: "", currency2: ""};
	this.user = {};
	this.orderType = type;
	this.volume = volume;
	this.price = price;
};

Order.prototype.toString = function ()
{
	return("order: "+ this.orderType + " "+ this.volume + "@" + this.price);
};


var invertOrder = function (a, b)
{
	return b.price - a.price;
};

var  normalOrder = function (a, b)
{
	return a.price - b.price;
};

var Exchange = function() {
	this.ordersBuy = new Heap(invertOrder);
	this.ordersSell = new Heap(normalOrder);
	this.ordersBuyStop = new Heap(invertOrder);
	this.ordersSellStop = new Heap(normalOrder);
	this.currencyPair = { currency1: "", currency2: ""};
};

Exchange.prototype.isTrade = function ()
{
	if (this.ordersBuy.size() > 0 && this.ordersSell.size() > 0)
	{
		if (this.ordersBuy.front().price >= this.ordersSell.front().price)
			return true;
		return false;
	}
};

Exchange.prototype.getNextBuy = function ()
{
	if (this.ordersBuy.size() <= 0)
		return 0;
	return this.ordersBuy.front();
};

Exchange.prototype.getNextSell = function ()
{
	if (this.ordersSell.size() <= 0)
		return 0;
	return this.ordersSell.front();
};

Exchange.prototype.addOrder = function (order)
{
	if (order.orderType == 'BUY')
	{
		/*if (order.price >= this.getNextSell())
			return false;*/
		this.ordersBuy.push(order);
	}
	else if (order.orderType  == 'SELL')
	{
		/*if (order.price <= this.getNextBuy())
			return false;*/
		this.ordersSell.push(order);
	}
	console.log("ADD ORDER : "+order);
	this.doTrade();
	//return true;
};

Exchange.prototype.helperMarket = function (type, volume)
{
	var last;
	while (volume > 0)
	{
		var next;

		if (type == 'BUY')
		{
			next = this.getNextSell();
		}
		else if (type == 'SELL')
		{
			next = this.getNextBuy();
		}
		if (next)
		{
			if (volume >= next.volume)
			{
				var tmp = new Order(type, next.price, next.volume);
				console.log('volume >= : ' + tmp);
				this.addOrder(tmp);
				this.doTrade();
				volume = volume - next.volume;
			}
			else
			{
				var tmp2 = new Order(type, next.price, volume);
				console.log('volume < : ' + tmp2);
				this.addOrder(tmp2);
				this.doTrade();
				break;
			}	
			last = next.price;
		}
		else
		{
			var tmp3 = new Order(type, last, volume);
			console.log('next is null : ' + tmp3);
			this.addOrder(tmp3);
			this.doTrade();
			break;
		}
	}
};

Exchange.prototype.doMarketOrder = function (order)
{
	console.log('Starting Market Order :\n'+order);
	if (order.orderType == 'Market BUY')
	{
		this.helperMarket('BUY', order.volume);
	}
	else if (order.orderType == 'Market SELL')
	{
		this.helperMarket('SELL', order.volume);
	}
	console.log("Execute ORDER : \n" + order);
};

Exchange.prototype.doTrade = function ()
{
	while (this.isTrade())
	{		
		
		var volumeBuy = this.ordersBuy.front().volume;
		var volumeSell = this.ordersSell.front().volume;
		console.log("\n========\nDO TRADE : \n"+this.ordersBuy.front()+"\n"+this.ordersSell.front());
		//console.log(this.ordersBuy.front());
		//console.log(this.ordersSell.front());

		if ( volumeBuy == volumeSell)
		{
			this.ordersBuy.pop();
			this.ordersSell.pop();
			console.log("full trade");
		}
		else if (volumeBuy > volumeSell)
		{
			this.ordersBuy.front().volume = volumeBuy - volumeSell;
			this.ordersSell.pop();
			console.log("left : "+this.ordersBuy.front());
		}
		else
		{
			this.ordersBuy.pop();
			this.ordersSell.front().volume = volumeSell - volumeBuy;
			console.log("left : "+this.ordersSell.front());
		}
		console.log("========\n");
		if (this.ordersSellStop.size() > 0 || this.ordersBuyStop.size() > 0)
		{
			console.log("---- Checking Stop Order ----");
			console.log('this.getNextSell().price:' + this.getNextSell().price);
			//console.log("\nthis.getNextBuy().price: "+this.getNextBuy().price +"\nthis.ordersBuyStop.front().price:"+this.ordersSellStop.front().price);
			if ((this.ordersSellStop.size() > 0) && ((this.getNextSell().price >= this.ordersSellStop.front().price) || !this.getNextBuy()))
			{
				console.log("HERE");
				currentOrder = this.ordersSellStop.pop();
				currentOrder.orderType = "Market BUY";
				this.doMarketOrder(currentOrder);
				console.log("Stop order: "+currentOrder);
			}

			if ((this.ordersBuyStop.size() > 0) && ((this.getNextBuy().price >= this.ordersBuyStop.front().price) || !this.getNextSell()))
			{
				console.log("HERE2");
				var currentOrder = this.ordersBuyStop.pop();
				currentOrder.orderType = "Market SELL";
				console.log("Stop order: "+currentOrder);
				this.doMarketOrder(currentOrder);
				
			}
			console.log("---- END ----");
		}

	}
};

Exchange.prototype.addStop = function(order) {
	if (order.orderType == 'BUY Stop')
	{
		if (order.price <= this.getNextSell())
			return false;
		this.ordersBuyStop.push(order);
	}
	else if (order.orderType  == 'SELL Stop')
	{
		if (order.price >= this.getNextBuy())
			return false;
		this.ordersSellStop.push(order);
	}
	console.log("ADD STOP ORDER : "+order);
	return true;
};

exports.Order = Order;
exports.Exchange = Exchange;

/*
var exchange = function () { 
	this.currencyPair = { currency1: "", currency2: ""};
	this.price = "";
	this.ordersBuy = [];
	this.ordersSell = [];
	this.ordersLimitBuy = [];
	this.ordersLimitSell = [];
	this.doOrder = function ()
	{

	};
	this.addMarketOrder = function (){

	};
};

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var OrderSchema = new Schema({
    body          : { type: String, required: true },
   created_by    : { type: Schema.ObjectId, ref: 'User', index: true },
   created_at    : { type: Date, default : Date.now },
   updated_at    : { type: Date }
});

var ExchangeSchema = new Schema({
    name    : { type: String, required: true, trim: true },
   created_by  : { type: Schema.ObjectId, ref: 'User', index: true },
   orders  : [OrderSchema]
});
*/