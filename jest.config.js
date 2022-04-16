module.exports = {
	collectCoverage: true,
	collectCoverageFrom: ["./dist/*"],
	coverageReporters: ["lcov"],
	testMatch: ["**/test/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"]
}