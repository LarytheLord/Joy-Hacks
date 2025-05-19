const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');

const docker = new Docker();
const securityConfig = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../sandbox/security.conf'),
  'utf8'
));

class SandboxManager {
  constructor() {
    this.containers = new Map();
  }

  async createContainer(language, code) {
    const containerConfig = {
      Image: `joyhacks-${language}-runner`,
      HostConfig: {
        Memory: securityConfig.memory_limit,
        CpuShares: securityConfig.cpu_shares,
        ReadonlyRootfs: securityConfig.readonly_filesystem,
        Binds: securityConfig.write_allowed_paths.map(p => `${p}:${p}:rw`)
      },
      Env: [`CODE=${code}`],
      OpenStdin: true,
      StdinOnce: true
    };

    const container = await docker.createContainer(containerConfig);
    this.containers.set(container.id, container);
    return container.id;
  }

  async executeCode(containerId, timeout = 5000) {
    const container = this.containers.get(containerId);
    if (!container) throw new Error('Container not found');

    const exec = await container.exec({
      Cmd: ['sh', '-c', 'echo "$CODE" | ./runner'],
      AttachStdout: true,
      AttachStderr: true
    });

    return new Promise((resolve, reject) => {
      exec.start((err, stream) => {
        if (err) return reject(err);

        let output = '';
        stream.on('data', chunk => output += chunk);
        stream.on('end', () => resolve(output));
        
        setTimeout(() => {
          stream.destroy();
          reject(new Error('Execution timeout'));
        }, timeout);
      });
    });
  }

  async cleanupContainer(containerId) {
    const container = this.containers.get(containerId);
    if (!container) return;

    try {
      await container.stop();
      await container.remove();
      this.containers.delete(containerId);
    } catch (err) {
      console.error('Error cleaning up container:', err);
    }
  }
}

module.exports = new SandboxManager();