/**
 * Temporary config to skip ESLint during build.
 * This avoids the invalid ESLint options error while we fix the underlying dependency/lockfile issue.
 * Remove or revert this once ESLint and dependencies are compatible.
 */
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};
