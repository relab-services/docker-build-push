import { existsSync } from 'fs'
import { resolve } from 'path'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

/**
 * Builds a Docker image from the specified project path and Dockerfile.
 *
 * This function constructs the full path to the Dockerfile, verifies its existence,
 * and then executes the `docker build` command to build the image with the given
 * image name and version tag.
 *
 * @param {string} projectPath - The path to the project directory containing the Dockerfile.
 * @param {string} dockerfileName - The name of the Dockerfile to use for the build.
 * @param {string} imageName - The name to assign to the built Docker image.
 * @param {string} version - The version tag to assign to the built Docker image.
 * @param {string} registryUrl - The Docker registry URL to pull the latest image from.
 * @param {string} args - Additional arguments to pass to the docker build command.
 * @param {boolean} pullLatest - Whether to pull the latest image before building (default: true).
 * @returns {Promise<void>} Resolves when the build is successful, otherwise throws an error.
 * @throws {Error} If the Dockerfile does not exist or the build process fails.
 */
export const build = async (
  projectPath: string,
  dockerfileName: string,
  imageName: string,
  version: string,
  registryUrl: string,
  args: string = '',
  pullLatest: boolean = true
): Promise<void> => {
  try {
    const dockerfilePath = resolve(dockerfileName)

    if (!existsSync(dockerfilePath)) {
      throw new Error(`❌ Dockerfile not found at: ${dockerfilePath}`)
    }

    const fullImageName = `${imageName}:${version}`

    // Only pull latest if pullLatest is true
    if (pullLatest) {
      try {
        await exec.exec('docker', [
          'pull',
          `${registryUrl}/${imageName}:latest`
        ])
      } catch (error) {
        core.warning(
          `⚠️ Failed to pull ${registryUrl}/${imageName}:latest: ${error}`
        )
      }
    }

    await exec.exec(
      'docker',
      [
        'buildx',
        'build',
        '-t',
        `${registryUrl}/${fullImageName}`,
        '-f',
        dockerfilePath,
        projectPath,
        ...args.trim().split(/\s+/),
        '--push'
      ],
      {
        env: {
          ...(Object.fromEntries(
            Object.entries(process.env).filter(
              ([, value]) => value !== undefined
            )
          ) as Record<string, string>)
        }
      }
    )

    core.info(`✅ Successfully built: ${fullImageName}`)
  } catch (error) {
    throw new Error(`❌ Failed to build: ${error}`)
  }
}
