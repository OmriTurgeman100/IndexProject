import { NodeSSH } from "node-ssh";

export async function runRemoteScript(command: string) {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: process.env.SSH_HOST!,
      username: process.env.SSH_USER!,
      password: process.env.SSH_PASSWORD!,
    });

    return await ssh.execCommand(command);
  } finally {
    ssh.dispose();  // * Properly shuts down the SSH connection to prevent resource leaks
  }
}
