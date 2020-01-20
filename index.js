// @ts-nocheck
const eval = require("eval");
const {
	readFileSync
} = require("fs");

let _config = {
	directory: './views',
	extension: '.jst'
};

const _views = {};

const api = {
	iterate: (list, path, model = {}, template = _template.open(path)) => {
		let output = "";
		for (const index in list) {
			output += template(view(
				list[index],
				model,
				{
					index: index
				}
			));
			output += '\n';
		}
		return output;
	},
	filter: (list, filter) => {
		if (list.constructor === Array)
			return list.filter(filter);
		
		let output = {};
		for (const index in list) {
			let item = list[index];
			if (filter(item, index, list))
				output[index] = item;
		}
		return output;
	},
	render: (path, model = {}) =>
		_template.render(path, view(model)),
};

const view = (model = {}, ...defaults) => {
	return Object.assign({
		item: model
	}, ...defaults);
};

const wrap = string =>
	`module.exports = \`${string}\``;

const normalize = path =>
	!path || path.endsWith("/") ? path : path + '/';

const _template = {
	init: config =>
		(_config = config ?
			Object.assign(_config, config) :
			{
				directory: '',
				extension: ''
			}) && _template,
	express: render => (path, context, callback) =>
		callback(null, render(path.split(_config.extension)[0], context)),
	create: (string, filename = 'anonymous') =>
		(model = {}) => eval(wrap(string), filename, Object.assign({}, model, api), false),
	read: path =>
		_template.create(readFileSync((path.startsWith('/') ? path : normalize(_config.directory) + path) + _config.extension), path),
	open: path =>
		//_views[path] || // <-- This is a caching system. User should turn this on.
			(_views[path] = _template.read(path)),
	render: (path, model) => _template.open(path)(model),
	layout: (_path, defaults = {}) => {
		return (path, model = {}) =>
			_template.open(_path)(view(
				model,
				defaults,
				{
					placeholder: _template.render(path, view(model, defaults)),
				}
			));
	},
};

module.exports = _template;
