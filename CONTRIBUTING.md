# Contributing to Ably CDN Deploy Action

## Development Workflow

1. Make changes in `src/`
2. `npm run lint` - check style
3. `npm run typecheck` - type-check with TypeScript
4. Commit

No build or bundle step is needed. The action runs TypeScript source directly using [tsx](https://tsx.is/).

## Release Process

1. Ensure tests pass in CI on `main`.
2. Create a release branch (e.g. `release/1.1.0`).
3. Bump the version number in `package.json`.
4. Run `npm install` to update the version in `package-lock.json`.
5. Update [`CHANGELOG.md`](CHANGELOG.md).
6. Commit the version bump and changelog update.
7. Open a PR, get it reviewed and merged to `main`.
8. Push a tag with the absolute new version number (e.g. `v1.1.0`).
9. Move the major version tag to the same commit (e.g. `v1`):
   ```bash
   git tag v1.1.0
   git tag -f v1
   git push origin v1.1.0
   git push -f origin v1
   ```

## See Also

- [Ably SDK Team: Guidance on Releases](https://github.com/ably/engineering/blob/main/best-practices/releases.md)
- [GitHub Actions: Using tags for release management](https://docs.github.com/en/actions/concepts/workflows-and-actions/custom-actions#using-tags-for-release-management)
