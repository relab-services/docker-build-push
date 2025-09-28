import * as core from '@actions/core'
import * as exec from '@actions/exec'

/**
 * Logs into a Docker registry using the provided credentials.
 *
 * This function executes the `docker login` command with the specified registry URL,
 * username, and password. The password is securely passed via stdin to avoid exposing
 * it in process arguments or logs.
 *
 * @param {string} registryUrl - The URL of the Docker registry to log into.
 * @param {string} username - The username for the Docker registry.
 * @param {string} password - The password for the Docker registry.
 * @returns {Promise<void>} Resolves if login is successful, otherwise throws an error.
 * @throws {Error} If the login process fails.
 */
export const registryLogin = async (
  registryUrl: string,
  username: string,
  password: string
): Promise<void> => {
  try {
    await exec.exec(
      'docker',
      ['login', registryUrl, '-u', username, '--password-stdin'],
      {
        input: Buffer.from(password),
        silent: true
      }
    )

    core.info(`✅ Successfully logged into registry: ${registryUrl}`)
  } catch (error) {
    throw new Error(`❌ Failed to login to registry: ${error}`)
  }
}
