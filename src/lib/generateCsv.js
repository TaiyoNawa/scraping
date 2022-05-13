const fs = require('fs');
const csvStringfySync = require('csv-stringify/sync');
const path = require('path');

module.exports = (data, fileName, outputhdir = 'output') => {
	if (!fs.existsSync(path.join(outputhdir))) fs.mkdirSync(outputhdir);
	const csvString = csvStringfySync.stringify(data, {
		header: true,
	});
	fs.writeFileSync(fileName, csvString);
};
