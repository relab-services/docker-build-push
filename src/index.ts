import * as core from '@actions/core'
import * as fs from 'fs'
import { registryLogin } from './registry-login.js'
import { checkImageExists } from './check-image-exists.js'
import { build } from './build.js'
import { push } from './push.js'
import { ensureDockerEngine } from './ensure-docker-engine.js'

const run = async (): Promise<void> => {
  try {
    const input: Input = {
      projectPath:
        core.getInput('project-path') || process.env.INPUT_PROJECT_PATH || '',
      imageName:
        core.getInput('image-name') || process.env.INPUT_IMAGE_NAME || '',
      dockerfileName:
        core.getInput('dockerfile-name') ||
        process.env.INPUT_DOCKERFILE_NAME ||
        'Dockerfile',
      version: core.getInput('version') || process.env.INPUT_VERSION || '',
      registryUrl:
        core.getInput('registry-url') || process.env.INPUT_REGISTRY_URL || '',
      registryUsername:
        core.getInput('registry-username') ||
        process.env.INPUT_REGISTRY_USERNAME ||
        '',
      registryPassword:
        core.getInput('registry-password') ||
        process.env.INPUT_REGISTRY_PASSWORD ||
        '',
      args: core.getInput('args') || process.env.INPUT_ARGS || '',
      pullLatest:
        (
          core.getInput('pull-latest') ||
          process.env.INPUT_PULL_LATEST ||
          'true'
        ).toLowerCase() === 'true'
    }

    if (!input.projectPath) throw new Error('project-path is required')
    if (!input.imageName) throw new Error('image-name is required')
    if (!input.version) throw new Error('version is required')
    if (!input.registryUrl) throw new Error('registry-url is required')
    if (!input.registryUsername)
      throw new Error('registry-username is required')
    if (!input.registryPassword)
      throw new Error('registry-password is required')

    const result = await docker(input)

    core.setOutput('image', result.image)
    core.setOutput('tag', result.tag)
    core.setOutput('href', result.href)
    core.setOutput('skipped', result.skipped.toString())

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `image=${result.image}\n`)
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag=${result.tag}\n`)
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `href=${result.href}\n`)
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `skipped=${result.skipped.toString()}\n`
      )
    }
  } catch (error) {
    core.setFailed(
      `❌ Action failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export type Input = {
  projectPath: string
  imageName: string
  dockerfileName: string
  version: string
  registryUrl: string
  registryUsername: string
  registryPassword: string
  args: string
  pullLatest: boolean
}

export type Output = {
  image: string
  tag: string
  href: string
  skipped: boolean
}

/**
 * Main function to handle Docker build and push
 */
export const docker = async (inputs: Input): Promise<Output> => {
  try {
    const meta = {
      image: inputs.imageName,
      tag: inputs.version,
      href: `${inputs.registryUrl}/${inputs.imageName}:${inputs.version}`
    }

    await ensureDockerEngine()

    await registryLogin(
      inputs.registryUrl,
      inputs.registryUsername,
      inputs.registryPassword
    )

    const imageExists = await checkImageExists(
      inputs.registryUrl,
      inputs.imageName,
      inputs.version
    )

    if (imageExists) {
      core.info(`⏭️  Image already exists, skipping build and push`)

      return {
        ...meta,
        skipped: true
      }
    }

    await build(
      inputs.projectPath,
      inputs.dockerfileName,
      inputs.imageName,
      inputs.version,
      inputs.args,
      inputs.pullLatest
    )

    await push(inputs.registryUrl, inputs.imageName, inputs.version)

    core.info('✅ Docker push process completed successfully')

    return {
      ...meta,
      skipped: false
    }
  } catch (error) {
    throw new Error(
      `❌ Docker push failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

run()
