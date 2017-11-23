/***
/ Adds a function to call when page is done loading
/***/

callWhenReadyToGo = function (callback)
{
	// Set if onload and readyState are set
	this.onloadFired = false;
	this.readyStateSet = false;

	// Assume jquery doesn't exist or ajax calls haven't fired
	this.ajaxComplete = true;

	// Assume addEventListener doesnt exist so we can't check for DOMContentLoaded
	this.DCLFired = true;

	this.callback = callback;

	this.startChecking();
};

callWhenReadyToGo.prototype =
{
	startChecking: function()
	{
		this.initAjaxTests();
		this.runTests();

		//Checks if the tests for page load are complete
		this.interval = setInterval(this.checkIfReady.bind(this),100);
	},

	checkIfReady: function()
	{
		this.runTests();

		// If the page has fired onload, has set the ready state, 
		// has fired ajax complete or doesnt have jquery and has a stable DOM, assume its done loading
		if(this.onloadFired && this.readyStateSet && this.ajaxComplete && this.DCLFired)
		{
			this.complete();
		}
	},

	runTests: function()
	{
		this.testReadyState();
		this.testDCL();
		this.testOnload();
	},

	testDCL: function()
	{

		if(document.addEventListener && !this.addedDCLFunc)
		{
			this.addedDCLFunc = true;
			this.DCLFired = false;
			document.addEventListener("DOMContentLoaded", function(event) {
				this.DCLFired = true;
			}.bind(this));
		}
	},

	testOnload: function()
	{
		if(window.onload != this.fireOnload || !this.fireOnload)
		{
			// Play nice with any existing function assigned to onload
			var oldFunction = (typeof window.onload === "funtion") ? window.onload : function(){};

			// Add our onload while calling previous
			window.onload = this.fireOnload = function(){
				oldFunction();
				this.onloadFired = true;
			}.bind(this)
		}
	},


	testReadyState()
	{
		if (document.readyState === "complete") 
		{ 
			this.readyStateSet = true;
		}
	},

	initAjaxTests: function()
	{
		this.ajaxComplete = true;

		if(typeof $ !== "undefined" && !this.addedAjaxFuncs)
		{
			this.addedAjaxFuncs = true;

			// Set ajax as incomplete if a call gets fired
			$( document ).ajaxStart(function() {
				this.ajaxComplete = false;
			}.bind(this));

			// Set it back to complete when all calls are completed
			$( document ).ajaxStop(function() {
				this.ajaxComplete = true;
			}.bind(this));
		}
	},

	complete: function()
	{
		if(typeof this.callback === "function")
		{
			this.callback();
			this.callback = null;
		}
		if(this.interval)
		{
			clearInterval(this.interval);
			this.interval = null;
		}
	}
};