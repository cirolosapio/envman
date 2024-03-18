import { Checkbox, Confirm } from 'https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts'
import { isDocker, isWsl, selectWsl } from './functions.ts'
import { installCarootOnWsl, installDeno, installDockerEngine, installMkcert, installMkcertWin, installOhMyZsh } from './softwares.ts'

if (await isDocker()) {
	console.log('running in docker')
	console.log('run this command on windows/wsl')
} else if (await isWsl()) {
	console.log('running in wsl')

	const softwares = await Checkbox.prompt({
		message: 'Cosa vuoi installare?',
		options: ['docker-engine', 'deno', 'ohmyzsh', 'mkcert'],
	})

	if (softwares.includes('docker-engine')) await installDockerEngine()
	if (softwares.includes('ohmyzsh')) await installOhMyZsh()
	// if (softwares.includes('starship')) await installStarship()
	if (softwares.includes('deno')) await installDeno()
	if (softwares.includes('mkcert')) await installMkcert()
} else {
	console.log('running in powershell')

	const softwares = await Checkbox.prompt({
		message: 'Cosa vuoi installare?',
		options: ['envman (su wsl)', 'mkcert'],
	})

	if (softwares.includes('mkcert')) {
		const caroot = await installMkcertWin()
		const target = await selectWsl()
		await installCarootOnWsl(caroot, target)
	}

	if (softwares.includes('envman (su wsl)')) {
		const target = await selectWsl()

		const p = new Deno.Command('wsl', { args: ['-d', target], stdin: 'piped', stdout: 'piped', stderr: 'piped' })

		const child = p.spawn()

		const w = child.stdin.getWriter()

		await w.ready

		await w.write(new TextEncoder().encode(`cd /home/$USER\n`))
		const url = 'https://github.com/cirolosapio/envman/releases/download/v0.0.3/envman'
		await w.write(new TextEncoder().encode(`curl -L ${url} -o envman\n`))
		await w.write(new TextEncoder().encode(`chmod +x envman\n`))

		w.releaseLock()

		await child.stdin.close()
	}

	await Confirm.prompt('finish!')
}
