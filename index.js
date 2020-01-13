// @ts-nocheck
const eval = require("eval");
const {
	readFileSync,
	readdirSync
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
		_template.render(path, {
			parent: model
		}),
};

const _config = {
	extension: "jst",
	layout: "layout"
};

const _views = {};

const wrap = string =>
	`module.exports = \`${string}\``;

const _template = {
	create: (string, filename = 'anonymous') =>
		(model = {}) => eval(wrap(string), filename, Object.assign({}, model, api), false),
	read: path =>
		_template.create(readFileSync(path), path),
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
	views: (directory, config = {}) => {
		config = Object.assign({}, _config, config);
		const layout_filename = `${config.layout}.${config.extension}`;
		const layout = _template.layout(_template.open(`${directory}/${layout_filename}`));
		
		const views = Object.create({
			render(view, model, overrides) {
				return layout(this[view], model, overrides);
			}
		});
		
		readdirSync(directory)
			.filter(entry => entry.endsWith(config.extension) && x !== layout_filename)
			.map(entry => entry.substring(0, entry.length - (config.extension.length + 1)))
			.forEach(entry => views[entry] = _template.open(`${directory}/${entry}.${config.extension}`));
		
		console.log(views);
		return views;
	}
};

module.exports = _template;
