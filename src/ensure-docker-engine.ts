import * as core from '@actions/core'
import * as exec from '@actions/exec'

/**
 * Ensures that the Docker engine is installed and available on the system.
 *
 * This function attempts to execute `docker --version` to verify that Docker is
 * installed and running. If Docker is not available, it throws an error.
 *
 * @throws {Error} If Docker is not installed or not running.
 */
export const ensureDockerEngine = async (): Promise<void> => {
  try {
    await exec.exec('docker', ['--version'], { silent: true })
    core.info('✅ Docker engine is available and ready')
  } catch (error) {
    throw new Error(
      `❌ Docker is not available. Please ensure Docker is installed and running. Error: ${error}`
    )
  }
}
