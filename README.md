# Ably CDN Deploy Action

A reusable GitHub Action that deploys SDK build artifacts to `prod-cdn.ably.com` (S3) with semantic versioning.

Given a tag like `1.2.3`, each matched file is uploaded three times with version suffixes:
- `filename-1.js` (major - consumers can pin to latest v1)
- `filename-1.2.js` (minor)
- `filename-1.2.3.js` (exact)

## Usage

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      aws-region: us-east-1
      role-to-assume: arn:aws:iam::${{ secrets.ABLY_AWS_ACCOUNT_ID_SDK }}:role/prod-ably-sdk-cdn
      role-session-name: ${{ github.run_id }}-${{ github.run_number }}

  - uses: ably/cdn-deploy-action@v1
    with:
      source-dir: dist
      file-regex: '^ably\.umd\.cjs$'
      tag: ${{ github.ref_name }}
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `source-dir` | Yes | - | Directory containing files to upload |
| `file-regex` | Yes | - | Regex to match files for upload |
| `tag` | Yes | - | Semver release tag (e.g. `1.2.3`) |
| `bucket` | No | `prod-cdn.ably.com` | S3 bucket name |
| `root` | No | `lib` | Root folder inside the S3 bucket |

## Examples

> **Note:** The `tag` input depends on how the workflow is triggered.
> Use `${{ github.ref_name }}` for workflows triggered by a release or tag push.
> Use `${{ github.event.inputs.version }}` for manually triggered (`workflow_dispatch`) workflows.

### ably-js

```yaml
- uses: ably/cdn-deploy-action@v1
  with:
    source-dir: build
    file-regex: '^(ably|push\.umd|liveobjects\.umd)?(\.min)?\.js$'
    tag: ${{ github.event.inputs.version }}
```

### ably-chat-js

```yaml
- uses: ably/cdn-deploy-action@v1
  with:
    source-dir: dist/core
    file-regex: '^(ably-chat)?\.(umd\.c)?js$'
    tag: ${{ github.ref_name }}
```

### ably-ai-transport-js

```yaml
- uses: ably/cdn-deploy-action@v1
  with:
    source-dir: dist
    file-regex: '^ably-ai-transport\.umd\.cjs$'
    tag: ${{ github.ref_name }}
```

## Permissions

### AWS

This action expects the calling workflow to configure AWS credentials before invoking it, using [GitHub OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) via [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials). The action picks up credentials from the environment automatically.

The workflow job needs these permissions for OIDC to work:

```yaml
permissions:
  id-token: write
  contents: read
```

The IAM role used across Ably SDK repos for CDN deployment is `prod-ably-sdk-cdn`. If you are unsure whether the appropriate IAM role has been configured for your repository, please speak to the Ably SDK team.

## Development

```bash
npm ci
npm run lint
npm run typecheck
```

This action runs TypeScript source directly at runtime using [tsx](https://tsx.is/) (via a composite action with `actions/setup-node`). There is no build or bundle step - edit `src/`, commit, done.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[Apache-2.0](LICENSE)
