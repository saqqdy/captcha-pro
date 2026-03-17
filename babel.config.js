module.exports = {
	presets: [
		[
			'@babel/env',
			{
				// Browser targets - support IE11 and most modern browsers
				targets: {
					browsers: ['>= 0.5%', 'last 2 versions', 'Firefox ESR', 'not dead', 'ie >= 11'],
				},
				// Exclude regenerator to reduce bundle size (no async/await in this lib)
				exclude: ['transform-regenerator'],
			},
		],
		'@babel/typescript',
	],
}
