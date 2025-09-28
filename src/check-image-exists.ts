import * as core from '@actions/core'
import * as exec from '@actions/exec'

/**
 * Checks if a Docker image exists in the specified registry.
 *
 * This function uses the `docker manifest inspect` command to determine if the
 * image with the given name and version exists in the provided registry. It returns
 * `true` if the image exists, otherwise `false`.
 *
 * @param {string} registryUrl - The URL of the Docker registry to check.
 * @param {string} imageName - The name of the Docker image.
 * @param {string} version - The tag/version of the Docker image.
 * @returns {Promise<boolean>} Resolves to `true` if the image exists, otherwise `false`.
 */
export const checkImageExists = async (
  registryUrl: string,
  imageName: string,
  version: string
): Promise<boolean> => {
  try {
    const fullImageName = `${registryUrl}/${imageName}:${version}`

    const exitCode = await exec.exec(
      'docker',
      ['manifest', 'inspect', fullImageName],
      {
        ignoreReturnCode: true,
        silent: true
      }
    )

    const exists = exitCode === 0
    core.info(
      `📦 Image ${fullImageName} ${exists ? 'exists' : 'does not exist'}`
    )

    return exists
  } catch (error) {
    core.info(`❌ Error checking image existence: ${error}`)
    return false
  }
}
