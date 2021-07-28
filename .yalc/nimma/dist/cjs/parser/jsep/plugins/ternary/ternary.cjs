'use strict';

var jsep = require('../../jsep.cjs');

// Ternary expression: test ? consequent : alternate
jsep.Jsep.hooksAdd('after-expression', function gobbleTernary(env) {
	if (this.code === jsep.Jsep.QUMARK_CODE) {
		this.index++;
		const test = env.node;
		const consequent = this.gobbleExpression();

		if (!consequent) {
			this.throwError('Expected expression');
		}

		this.gobbleSpaces();

		if (this.code === jsep.Jsep.COLON_CODE) {
			this.index++;
			const alternate = this.gobbleExpression();

			if (!alternate) {
				this.throwError('Expected expression');
			}
			env.node = {
				type: 'ConditionalExpression',
				test,
				consequent,
				alternate,
			};
		}
		else {
			this.throwError('Expected :');
		}
	}
});
