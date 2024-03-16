import { Select } from 'https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts'

type Encoding = 'utf-8' | 'utf-16'

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

export async function run(cmds: string[], encoding: Encoding = 'utf-8') {
	const [cmd, ...args] = cmds
	const { code, stdout, stderr } = await (new Deno.Command(cmd, { args })).output()
	if (code === 0) console.log(new TextDecoder(encoding).decode(stdout))
	else console.log(`ERROR (${code}):`, new TextDecoder(encoding).decode(stderr))
	return new TextDecoder(encoding).decode(stdout)
}

export async function ps(cmd: string, encoding: Encoding = 'utf-8') {
	return await run(['powershell', '-ExecutionPolicy', 'unrestricted', '-Command', cmd], encoding)
}

export async function runn(cmd: string, encoding: Encoding = 'utf-8') {
	return await run([`sh`, '-c', `$(${cmd})`], encoding)
}

export async function bash(cmd: string, encoding: Encoding = 'utf-8') {
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

export async function selectWsl() {
	const list = await run(['wsl', '-l', '-v'], 'utf-16')

	const options = []
	for (const row of list.split('\r\n').slice(1)) {
		const names = row.split(' ').filter(Boolean)
		if (names.length === 0) continue
		else if (names.length === 4) options.push(names[1])
		else options.push(names[0])
	}

	return await Select.prompt({ message: 'Seleziona una wsl', options })
}
