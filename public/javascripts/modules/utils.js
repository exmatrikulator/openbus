(function(){
	
	OpenBus.Utils = {};
	
	OpenBus.Utils.Tpl = (function()
	{
		var parse = function(data, tpl)
		{
			for(var key in data){
				tpl = tpl.replace('#{' + key + '}', data[key]);
			}
			return tpl;
		};

		return{
			parse:parse
		}
	})();

	OpenBus.Utils.TimeTo = function(time)
	{
		var now = new Date();
		now = Date.parse(now.toGMTString());

		var to = Date.parse(time);

		var diff = Math.round( (to - now) / 1000 / 60);

		var till = {
			hours: 0,
			minutes: 0
		};

		if(diff < 60)
		{
			till.minutes = diff;
		}
		else if(diff >= 60 )
		{
			till.hours = Math.floor(diff / 60)
			till.minutes = (diff - till.hours * 60);
		}
		return till;
	};

	OpenBus.ScrollALittle = (function(){
		var ready = function(){
			window.addEventListener("load",function() 
			{
				// Set a timeout...
				setTimeout(function()
				{
					// Hide the address bar!
					window.scrollTo(0, 1);
				}, 0);
			});
		};
		return{
			ready:ready
		};
		
	})();
})();