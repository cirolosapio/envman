
import { Checkbox, Confirm } from 'https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts'
import { isDocker, isWsl, selectWsl } from './functions.ts'
import { installCarootOnWsl, installDeno, installDockerEngine, installSshs, installMkcert, installCtop, installMkcertWin, installOhMyZsh } from './softwares.ts'

if (await isDocker()) {
	console.log('running in docker')
	console.log('run this tool on windows/wsl')
} else if (await isWsl()) {
	const softwares = await Checkbox.prompt({
		info: true,
		minOptions: 1,
		message: 'Cosa vuoi installare?',
		options: [
			{ name: 'Docker Engine - open source containerization technology', value: 'docker-engine' },
			{ name: 'Deno - Next-generation JavaScript runtime', value: 'deno' },
			{ name: 'OhMyZsh - open source, community-driven framework for managing your zsh configuration', value: 'ohmyzsh' },
			{ name: 'mkcert - A simple zero-config tool to make locally trusted development certificates with any names you\'d like', value: 'mkcert' },
			{ name: 'ctop - Top-like interface for container metrics', value: 'ctop' },
			{ name: 'sshs - Terminal user interface for SSH', value: 'sshs' },
		],
	})

	if (softwares.includes('docker-engine')) await installDockerEngine()
	if (softwares.includes('ohmyzsh')) await installOhMyZsh()
	// if (softwares.includes('starship')) await installStarship()
	if (softwares.includes('deno')) await installDeno()
	if (softwares.includes('mkcert')) await installMkcert()
	if (softwares.includes('ctop')) await installCtop()
	if (softwares.includes('sshs')) await installSshs()
} else {
	const softwares = await Checkbox.prompt({
		info: true,
		minOptions: 1,
		message: 'Cosa vuoi installare?',
		options: [
			{ name: 'mkcert - A simple zero-config tool to make locally trusted development certificates with any names you\'d like', value: 'mkcert' },
			{ name: 'envman - this tool, but on a selected wsl', value: 'envman' },
		],
	})

	if (softwares.includes('mkcert')) {
		const caroot = await installMkcertWin()
		const target = await selectWsl()
		await installCarootOnWsl(caroot, target)
	}

	if (softwares.includes('envman')) {
		const target = await selectWsl()

		const p = new Deno.Command('wsl', { args: ['-d', target], stdin: 'piped', stdout: 'piped', stderr: 'piped' })

		const child = p.spawn()

		const w = child.stdin.getWriter()

		await w.ready

		await w.write(new TextEncoder().encode(`cd /home/$USER\n`))
		const url = 'https://github.com/cirolosapio/envman/releases/download/v0.0.4/envman'
		await w.write(new TextEncoder().encode(`curl -L ${url} -o envman\n`))
		await w.write(new TextEncoder().encode(`chmod +x envman\n`))

		w.releaseLock()

		await child.stdin.close()
	}

	await Confirm.prompt('finish!')
}