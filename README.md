# Docker Build and Push Action

A GitHub Action that builds and pushes Docker images to a registry with
intelligent caching. If an image with the specified tag already exists in the
registry, the build and push process will be skipped, saving time and resources.

## Features

- 🚀 **Smart Build Skipping**: Automatically skips build and push if the image
  already exists in the registry
- 🔐 **Registry Authentication**: Supports authentication with various Docker
  registries
- 📦 **Flexible Configuration**: Customizable Dockerfile names and project paths
- ⚙️ **Custom Build Arguments**: Pass additional arguments to the docker build
  command
- 🌍 **Environment Variables**: Pass environment variables to the docker build
  process
- ✅ **Comprehensive Outputs**: Provides detailed information about the build
  process
- 🛡️ **Error Handling**: Robust error handling with clear error messages
- 🎯 **Optimized Performance**: Uses Docker manifest inspection for efficient
  image existence checks

## Usage

### Basic Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build and Push Docker Image
        uses: relab-services/docker-build-push@v1
        with:
          project-path: './my-app'
          dockerfile-name: 'Dockerfile'
          image-name: 'my-app'
          version: 'v1.0.0'
          registry-url: 'ghcr.io/${{ github.repository_owner }}'
          registry-username: ${{ github.repository_owner }}
          registry-password: ${{ secrets.GITHUB_TOKEN }}
```

### Using Outputs

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.docker.outputs.image }}
      tag: ${{ steps.docker.outputs.tag }}
      href: ${{ steps.docker.outputs.href }}
      skipped: ${{ steps.docker.outputs.skipped }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build and Push Docker Image
        id: docker
        uses: relab-services/docker-build-push@v1
        with:
          project-path: './app'
          image-name: 'my-app'
          version: 'v1.0.0'
          registry-url: 'ghcr.io/${{ github.repository_owner }}'
          registry-username: ${{ github.repository_owner }}
          registry-password: ${{ secrets.GITHUB_TOKEN }}

      - name: Info
        if: steps.docker.outputs.skipped == 'false'
        run: |
          echo "Pushed ${{ steps.docker.outputs.href }}"
          # Your deployment logic here
```

### Using Build Arguments

```yaml
name: Build with Custom Arguments

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build and Push Docker Image with Build Args
        uses: relab-services/docker-build-push@v1
        with:
          project-path: './my-app'
          image-name: 'my-app'
          version: 'v1.0.0'
          registry-url: 'ghcr.io/${{ github.repository_owner }}'
          registry-username: ${{ github.repository_owner }}
          registry-password: ${{ secrets.GITHUB_TOKEN }}
          args:
            '--build-arg NODE_ENV=production --build-arg
            API_URL=https://api.example.com --no-cache'
```

### Advanced Build Arguments Example

```yaml
name: Multi-Stage Build with Arguments

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Production Image
        uses: relab-services/docker-build-push@v1
        with:
          project-path: './app'
          image-name: 'my-app'
          version: 'v1.0.0'
          registry-url: 'ghcr.io/${{ github.repository_owner }}'
          registry-username: ${{ github.repository_owner }}
          registry-password: ${{ secrets.GITHUB_TOKEN }}
          args: |
            --build-arg NODE_ENV=production
            --build-arg BUILD_DATE=${{ github.event.head_commit.timestamp }}
            --build-arg VCS_REF=${{ github.sha }}
            --target production
            --no-cache
```

### Using Environment Variables

```yaml
name: Build with Environment Variables

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker Image with Environment Variables
        uses: relab-services/docker-build-push@v1
        with:
          project-path: './app'
          image-name: 'my-app'
          version: 'v1.0.0'
          registry-url: 'ghcr.io/${{ github.repository_owner }}'
          registry-username: ${{ github.repository_owner }}
          registry-password: ${{ secrets.GITHUB_TOKEN }}
          args: |
            --build-arg PROJECT=${{ matrix.project.name }}
            --build-arg COMMIT_SHA=${{ github.sha }}
            --build-arg TURBO_TEAM=${{ vars.TURBO_TEAM }}
            --secret id=turbo_token,env=TURBO_TOKEN
            --secret id=turbo_remote_cache_signature_key,env=TURBO_REMOTE_CACHE_SIGNATURE_KEY
          env: |
            TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
            TURBO_REMOTE_CACHE_SIGNATURE_KEY: ${{ secrets.TURBO_REMOTE_CACHE_SIGNATURE_KEY }}
```

### Controlling Latest Image Pull

```yaml
name: Build without Pulling Latest

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker Image (Skip Latest Pull)
        uses: relab-services/docker-build-push@v1
        with:
          project-path: './app'
          image-name: 'my-app'
          version: 'v1.0.0'
          registry-url: 'ghcr.io/${{ github.repository_owner }}'
          registry-username: ${{ github.repository_owner }}
          registry-password: ${{ secrets.GITHUB_TOKEN }}
          pull-latest: false # Skip pulling the latest image
```

## Inputs

| Input               | Description                                                             | Required | Default      |
| ------------------- | ----------------------------------------------------------------------- | -------- | ------------ |
| `project-path`      | Path to the project directory containing the Dockerfile                 | ✅       | -            |
| `image-name`        | Name of the Docker image                                                | ✅       | -            |
| `version`           | Version tag for the Docker image                                        | ✅       | -            |
| `registry-url`      | Docker registry URL (e.g., `ghcr.io`, `docker.io`, `your-registry.com`) | ✅       | -            |
| `registry-username` | Docker registry username                                                | ✅       | -            |
| `registry-password` | Docker registry password or token                                       | ✅       | -            |
| `dockerfile-name`   | Name of the Dockerfile                                                  | ❌       | `Dockerfile` |
| `args`              | Additional arguments to pass to the docker build command                | ❌       | `''`         |
| `env`               | Environment variables to pass to the docker build command (YAML format) | ❌       | `''`         |
| `pull-latest`       | Whether to pull the latest image before building                        | ❌       | `true`       |

## Outputs

| Output    | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `image`   | Docker image name that was built/pushed                                     |
| `tag`     | Docker image tag that was built/pushed                                      |
| `href`    | Full Docker image name with tag (image-name:image-tag)                      |
| `skipped` | Whether the build was skipped because image already exists (`true`/`false`) |

## How It Works

1. **Docker Engine Setup**: Ensures Docker is available and sets up Docker
   Buildx
1. **Registry Authentication**: Logs into the specified Docker registry
1. **Image Existence Check**: Uses `docker manifest inspect` to check if the
   image already exists
1. **Conditional Build**:
   - If image exists: Skips build and push, returns `skipped: true`
   - If image doesn't exist: Proceeds with build and push
1. **Latest Image Pull** (optional): Pulls the latest version of the image if
   `pull-latest` is set to `true` (default behavior)
1. **Build Process**: Builds the Docker image using the specified Dockerfile
1. **Push Process**: Tags and pushes the image to the registry
1. **Output Generation**: Provides comprehensive outputs for downstream steps

## Best Practices

### 1. Use Semantic Versioning

```yaml
version: ${{ github.ref_name }}  # For tags like v1.0.0
# or
version: ${{ github.sha }}       # For commit-based versions
```

### 2. Leverage the Skip Output

```yaml
- name: Deploy only if built
  if: steps.docker.outputs.skipped == 'false'
  run: |
    echo "New image built: ${{ steps.docker.outputs.href }}"
    # Deploy the new image
```

### 3. Use Matrix Strategy for Multiple Services

```yaml
strategy:
  matrix:
    service: [api, web, worker]
    include:
      - service: api
        dockerfile: Dockerfile.api
      - service: web
        dockerfile: Dockerfile.web
      - service: worker
        dockerfile: Dockerfile.worker
```

### 4. Use Build Arguments for Environment-Specific Builds

```yaml
# For production builds
args: '--build-arg NODE_ENV=production --build-arg API_URL=https://api.prod.com'

# For development builds
args: '--build-arg NODE_ENV=development --build-arg API_URL=https://api.dev.com'

# For multi-stage builds
args: '--target production --build-arg BUILD_DATE=${{ github.event.head_commit.timestamp }}'
```

### 5. Use Environment Variables for Secrets and Tokens

```yaml
# Pass environment variables to the build process
env: |
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_REMOTE_CACHE_SIGNATURE_KEY: ${{ secrets.TURBO_REMOTE_CACHE_SIGNATURE_KEY }}
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

# Use them in build arguments
args: |
  --secret id=turbo_token,env=TURBO_TOKEN
  --secret id=turbo_remote_cache_signature_key,env=TURBO_REMOTE_CACHE_SIGNATURE_KEY
  --build-arg NPM_TOKEN=$NPM_TOKEN
```

**Environment variables are useful for:**

- Passing secrets to Docker build secrets
- Providing tokens for private registries
- Setting build-time configuration values
- Enabling secure access to external services during build

### 6. Cache Docker Layers

The action automatically benefits from Docker's layer caching when building
images.

### 7. Control Latest Image Pull

```yaml
# Pull latest image (default behavior) - useful for base image updates
pull-latest: true

# Skip pulling latest - useful for faster builds or when you want to use local cache
pull-latest: false
```

**When to use `pull-latest: false`:**

- You want faster builds by using local Docker cache
- You're building in an environment with limited bandwidth
- You want to ensure reproducible builds using only local images
- You're building from a private registry where pulling latest might fail

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify registry credentials are correct
   - Check if the registry URL is properly formatted
   - Ensure the user has push permissions

1. **Dockerfile Not Found**
   - Verify the `project-path` points to the correct directory
   - Check if the `dockerfile-name` matches the actual filename
   - Ensure the Dockerfile exists in the specified path

1. **Build Failed**
   - Check Dockerfile syntax and dependencies
   - Verify all required files are present in the build context
   - Review build logs for specific error messages

1. **Environment Variables Not Available**
   - Verify the `env` parameter is properly formatted as YAML
   - Check that environment variable names don't contain spaces or special
     characters
   - Ensure secrets are properly configured in your repository settings
   - Review build logs to confirm environment variables are being passed
     correctly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
