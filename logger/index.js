'use strict';

const
	winston = require('winston');

const
	defaultoptions = {
		colorize: true,
		transport: 'Console'
	},
	getlabel = (filename) => {
		return filename.split('/').slice(-2).join('/');
	};

module.exports = (options = defaultoptions) => {
	const path = getlabel(module.filename);
	Object.assign(defaultoptions, options);
		
	return new (winston.Logger)({
		transports: [
			new (winston.transports[defaultoptions.transport])(defaultoptions)
		]
	});
};

