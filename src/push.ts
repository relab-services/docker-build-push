import * as core from '@actions/core'
import * as exec from '@actions/exec'

/**
 * Pushes a Docker image to a specified registry.
 *
 * This function tags a local Docker image with the remote registry name and version,
 * then pushes it to the specified Docker registry. If the push is successful, a success
 * message is logged. If any step fails, an error is thrown.
 *
 * @param {string} registryUrl - The URL of the Docker registry to push the image to.
 * @param {string} imageName - The name of the Docker image to push.
 * @param {string} version - The version tag of the Docker image.
 * @returns {Promise<void>} Resolves when the image is successfully pushed, otherwise throws an error.
 * @throws {Error} If tagging or pushing the image fails.
 */
export const push = async (
  registryUrl: string,
  imageName: string,
  version: string
): Promise<void> => {
  const localImageName = `${imageName}:${version}`
  const remoteImageName = `${registryUrl}/${imageName}:${version}`

  try {
    await exec.exec('docker', ['tag', localImageName, remoteImageName])
    await exec.exec('docker', ['push', remoteImageName])

    core.info(`✅ Successfully pushed: ${remoteImageName}`)
  } catch (error) {
    throw new Error(`❌ Failed to push ${remoteImageName}: ${error}`)
  }
}
