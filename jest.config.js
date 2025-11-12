/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/src/$1",
  },
};
