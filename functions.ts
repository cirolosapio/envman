export async function isWsl(): Promise<boolean> {
	if (Deno.build.os !== 'linux') {
		return false
	}

	try {
		const data = await Deno.readFile('/proc/version')
		const fullversion = new TextDecoder('utf-8').decode(data)
		return fullversion.toLowerCase().includes('microsoft')
	} catch {
		return false
	}
}

async function hasDockerEnv() {
	return await exists('/.dockerenv')
}

async function hasDockerCGroup() {
	try {
		const data = await Deno.readFile('/proc/self/cgroup')
		return new TextDecoder('utf-8').decode(data).includes('docker')
	} catch (_) {
		return false
	}
}

export async function isDocker() {
	return await hasDockerEnv() || await hasDockerCGroup()
}

export async function run(cmds: string[], encoding = 'utf-8') {
	const [cmd, ...args] = cmds
	const { code, stdout, stderr } = await (new Deno.Command(cmd, { args })).output()
	if (code === 0) console.log(new TextDecoder(encoding).decode(stdout))
	else console.log(`ERROR (${code}):`, new TextDecoder(encoding).decode(stderr))
	return new TextDecoder(encoding).decode(stdout)
}

export async function runn(cmd: string, encoding = 'utf-8') {
	return await run([`sh`, '-c', `$(${cmd})`], encoding)
}

export async function bash(cmd: string, encoding = 'utf-8') {
	return await run([`bash`, `-c`, `sh -c "$(${cmd})"`], encoding)
}

export async function exists(path: string) {
	try {
		await Deno.stat(path)
		return true
	} catch (_) {
		return false
	}
}
