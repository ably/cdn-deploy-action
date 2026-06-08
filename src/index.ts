import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function run(): Promise<void> {
  try {
    // Composite actions don't populate INPUT_* (actions/runner#665), so
    // action.yml maps each input to an underscore-named INPUT_* env var that
    // getInput can read: 'source_dir' -> INPUT_SOURCE_DIR. Underscores, not
    // hyphens - a hyphenated env var name (INPUT_SOURCE-DIR) does not propagate
    // to this process, which is why the earlier hyphenated attempt still failed.
    const sourceDir = path.resolve(
      core.getInput('source_dir', { required: true }),
    );
    const fileRegex = core.getInput('file_regex', { required: true });
    const tag = core.getInput('tag', { required: true });
    const bucket = core.getInput('bucket');
    const root = core.getInput('root');

    core.info('Starting Ably CDN deployment');
    core.info(`Bucket: ${bucket}`);
    core.info(`Output root: ${root}`);
    core.info(`Source dir: ${sourceDir}`);
    core.info(`File regex: ${fileRegex}`);
    core.info(`Tag: ${tag}`);
    core.info('-------');

    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source directory does not exist: ${sourceDir}`);
    }

    const files = findFiles(sourceDir, fileRegex);
    const versions = getVersions(tag);

    core.info(`Found ${files.length} file(s) to upload`);
    core.info(`Version segments: ${versions.join(', ')}`);

    if (files.length === 0) {
      core.warning('No files matched the regex - nothing to upload');
      return;
    }

    const s3 = new S3Client({});
    const uploadedKeys: string[] = [];

    for (const file of files) {
      core.info(`Uploading ${file}...`);
      for (const version of versions) {
        const relativePath = path.relative(sourceDir, file);
        const ext = path.extname(relativePath);
        const base = relativePath.slice(0, -ext.length);
        const newPath = `${base}-${version}${ext}`;

        let fileData = fs.readFileSync(file, 'utf-8');

        // Strip sourceMappingURL from minified files - these cause browser
        // warnings when loaded from CDN since the map isn't uploaded.
        if (newPath.includes('.min')) {
          fileData = fileData.replace(/^\/\/#\ssourceMappingURL=.*$/gm, '');
        }

        const key = path.posix.join(root, newPath.split(path.sep).join('/'));

        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: fileData,
            ContentType: 'application/javascript',
          }),
        );

        core.info(`  -> s3://${bucket}/${key}`);
        uploadedKeys.push(key);
      }
    }

    core.info('-------');
    core.info(`Uploaded ${uploadedKeys.length} file(s):`);
    for (const key of uploadedKeys) {
      core.info(`  ${key}`);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Recursively find files under `dir` whose basename matches `regex`.
 */
function findFiles(dir: string, regex: string): string[] {
  const re = new RegExp(regex, 'i');
  const results: string[] = [];

  function walk(current: string): void {
    for (const entry of fs.readdirSync(current)) {
      const fullPath = path.join(current, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (re.test(path.basename(fullPath))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Split a semver tag into progressive version segments.
 * "1.2.3" -> ["1", "1.2", "1.2.3"]
 */
function getVersions(fullVersion: string): string[] {
  const parts = fullVersion.split('.');
  return parts.map((_, i) => parts.slice(0, i + 1).join('.'));
}

run();
