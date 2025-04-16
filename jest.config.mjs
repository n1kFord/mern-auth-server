export default {
    transform: {
        "^.+\\.mjs$": "babel-jest",
    },
    testEnvironment: "node",
    moduleNameMapper: {},
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.mjs$",
};
