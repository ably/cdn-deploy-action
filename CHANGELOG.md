# Changelog

## [1.0.0](https://github.com/ably/cdn-deploy-action/tree/v1.0.0) (2026-04-13)

Initial release of the shared CDN deploy action, extracting the common `scripts/cdn_deploy.js` logic from ably-js, ably-chat-js, and ably-ai-transport-js into a reusable GitHub Action.

Uploads build artifacts to `prod-cdn.ably.com` with semantic version splitting (tag `1.2.3` produces `-1.js`, `-1.2.js`, `-1.2.3.js` copies). Supports configurable source directory, file regex, bucket, and root path.
