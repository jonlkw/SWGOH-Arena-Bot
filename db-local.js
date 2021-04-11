const fs = require('fs');
module.exports = Database;

function Database(file = 'db.json') {
	this.file = file;
	this.records = {};
	this.open = () => {
		fs.exists(this.file, function(exists) {
			if (!exists) {
				fs.writeFile(file, '', 'utf8', () => {
					this.records = {};
					return {};
				});
			} else {
				fs.readFile(file, 'utf8', (data) => {
					this.records = JSON.parse(data);
					return JSON.parse(data);
				});
			}
		});
	};
    this.open();
	this.set = (path, data) => {
		path = path.split('/');
		let last = path.pop();
		let curr = this.records;
		for (let i of path) {
			curr[i] = {};
			curr = curr[i] = {};
		}
		curr[last] = data;
		fs.writeFileSync(this.file, JSON.stringify(this.records), 'utf8', () => {
			console.log('Updated ' + this.file);
		});
	};
	this.get = (path) => {
		path = path.split('/');
		let curr = this.records;
		if (path !== ['']) {
			for (let i of path) {
				curr = curr[i];
			}
		}
		return new Promise((resolve, reject) => {
			resolve(curr);
		});
	};
}