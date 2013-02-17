(function(){
	
	OpenBus.Smartbanner = (function()
	{
		var ready = function()
		{
			$().smartWebBanner(
			{
				title: "OpenBus", 
				author: "Bastian Sackermann", 
				showFree: false, 
				daysHidden: 0, 
				daysReminder: 3, 
				debug: false 
			}); 
		};
		return{
			ready:ready	
		};
	})();
	
	// Not In Use
	OpenBus.Typeahead = (function()
	{
		var typeahead = {};

		var ready = function()
		{
			$('#stations').typeahead(
			{
				source: function (query, process) 
				{
					return $.get('/xhr/typeahead', { query: query }, function (data) 
					{
						typeahead = data.stations;
						var autocomplete = [];
						for(key in typeahead)
						{
							autocomplete.push(key);
						}
						return process(autocomplete);
					});
				},
				updater: function(selected)
				{
					console.log(typeahead[selected]);
				}
			});			
		};
		return{
			ready:ready	
		};
	})();
	
	OpenBus.App = (function()
	{
		var ready = function()
		{
			OpenBus.Busstop.ready();
			OpenBus.Map.ready();
		};

		$(document).ready(ready);
		
	})();
	
})();