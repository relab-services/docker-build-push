import { existsSync } from 'fs'
import { join } from 'path'
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
 * @returns {Promise<void>} Resolves when the build is successful, otherwise throws an error.
 * @throws {Error} If the Dockerfile does not exist or the build process fails.
 */
export const build = async (
  projectPath: string,
  dockerfileName: string,
  imageName: string,
  version: string
): Promise<void> => {
  try {
    const dockerfilePath = join(projectPath, dockerfileName)

    if (!existsSync(dockerfilePath)) {
      throw new Error(`❌ Dockerfile not found at: ${dockerfilePath}`)
    }

    const fullImageName = `${imageName}:${version}`

    await exec.exec('docker', [
      'build',
      '-t',
      fullImageName,
      '-f',
      dockerfilePath,
      projectPath
    ])

    core.info(`✅ Successfully built: ${fullImageName}`)
  } catch (error) {
    throw new Error(`❌ Failed to build: ${error}`)
  }
}
