// @ts-nocheck
const eval = require("eval");
const {
	readFileSync
} = require("fs");

const api = {
	iterate: (list, path, model = {}, template = _template.open(path)) =>
		list.map((item, index) => {
			return template(Object.assign({},
				model,
				item,
				{
					index: index
				}
			));
		}).join('\n'),
	render: (path, model = {}) =>
		_template.render(path, model),
};

let _config = {
	extension: ".jst",
	directory: "./views"
};
const _views = {};

const wrap = string =>
	`module.exports = \`${string}\``;

const normalize = path =>
	path.endsWith("/") ? path : path + '/';

const _template = {
	init: config => Object.assign(_config, config || {}) && _template,
	create: (string, filename = 'anonymous') =>
		(model = {}) => eval(wrap(string), filename, Object.assign({}, model, api), false),
	read: path =>
		_template.create(readFileSync((path.startsWith('/') ? path : normalize(_config.directory) + path) + _config.extension), path),
	open: path =>
		_views[path] || (_views[path] = _template.read(path)),
	render: (path, model) => _template.open(path)(model),
	layout: (path, defaults = {}) => {
		let layout = _template.open(path);
		return (path, model = {}) =>
			layout(Object.assign(
				{},
				defaults,
				model,
				{
					placeholder: _template.render(path, model)
				}
			));
	},
};

module.exports = _template;
