const nextConfig = require('eslint-config-next');

module.exports = [
  // Use Next's predefined configs (core web vitals + TS overrides)
  nextConfig[0],
  nextConfig[1],
  // Default ignores are already provided by nextConfig[2]
  // Add any project-specific overrides here
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {},
  },
];
