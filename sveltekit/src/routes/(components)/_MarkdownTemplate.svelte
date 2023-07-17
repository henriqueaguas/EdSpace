<template data-merge="append">
	<!-- Github Markdown Dark Mode -->
	<link rel="stylesheet" href="/markdown/markdown-darkmode.css" />
	<!-- Theme for code blocks -->
	<link rel="stylesheet" href="/markdown/codeblocktheme.css" />
	<!-- Manual Fixes -->
	<style>
		.markdown-body {
			font-family: 'Gilmer';
			font-size: 1.4rem;
			color: rgba(255, 255, 255, 0.84) !important;
			line-height: 2.5rem;
			padding: 0 !important;
			width: 100% !important;
			max-width: 100% !important;
		}

		pre {
			background-color: #090f14 !important;
			border: 1px solid rgba(0, 0, 0, 0.6);
		}

		code {
			font-family: 'Gilmer' !important;

			text-shadow: none !important;
			font-size: 1.2rem !important;
		}

		code .operator {
			background: none !important;
		}

		@media (max-width: 1200px) {
			code {
				font-size: 0.93rem !important;
			}

			.markdown-body {
				font-size: 1.3rem;
			}
		}

		@media (max-width: 767px) {
			code {
				font-size: 0.75rem !important;
			}

			.markdown-body {
				font-size: 1.1rem;
				line-height: 2rem;
			}
		}
	</style>
</template>
