import { Checkbox, Confirm } from 'https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts'
import { checkOption, isDocker, isOhMyZshInstalled, isWsl, selectWsl } from './functions.ts'
import { installBottom, installCarootOnWsl, installCtop, installDeno, installDockerEngine, installJetBrainsGateway, installMage2Postman, installMagentoCloudCli, installMkcert, installMkcertWin, installOhMyZsh, installSshs, installStarship } from './softwares.ts'

if (await isDocker()) {
	console.log('running in docker')
	console.log('run this tool on windows/wsl')
} else if (await isWsl()) {
	const softwares = await Checkbox.prompt({
		info: true,
		minOptions: 1,
		message: 'Cosa vuoi installare?',
		maxRows: 11,
		options: [
			{ name: 'Docker Engine - open source containerization technology', value: 'docker-engine', ...await checkOption('docker') },
			{ name: 'OhMyZsh - open source, community-driven framework for managing your zsh configuration', value: 'ohmyzsh', ...await checkOption(await isOhMyZshInstalled()) },
			{ name: "mkcert - A simple zero-config tool to make locally trusted development certificates with any names you'd like", value: 'mkcert', ...await checkOption('mkcert') },
			{ name: 'Starship - The minimal, blazing-fast, and infinitely customizable prompt for any shell!', value: 'starship', ...await checkOption('starship') },
			{ name: 'Deno - Next-generation JavaScript runtime', value: 'deno', ...await checkOption('deno', false) },
			{ name: 'ctop - Top-like interface for container metrics', value: 'ctop', ...await checkOption('ctop', false) },
			{ name: 'sshs - Terminal user interface for SSH', value: 'sshs', ...await checkOption('sshs', false) },
			{ name: 'bottom - Yet another cross-platform graphical process/system monitor', value: 'bottom', ...await checkOption('btm', false) },
			{ name: 'Magento Cloud Cli - Command-line tool for managing Magento Commerce Cloud projects', value: 'mgc', ...await checkOption('mgc', false) },
			{ name: 'Mage2Postman - Generate postman collection from Magento', value: 'mage2postman', ...await checkOption('mage2postman', false) },
			{ name: 'JetBrains Gateway - Your single entry point to all remote development environments', value: 'jetbrains-gateway', ...await checkOption('gateway', false) },
		],
	})

	if (softwares.includes('docker-engine')) await installDockerEngine()
	if (softwares.includes('mkcert')) await installMkcert()
	if (softwares.includes('ctop')) await installCtop()
	if (softwares.includes('sshs')) await installSshs()
	if (softwares.includes('bottom')) await installBottom()
	if (softwares.includes('mgc')) await installMagentoCloudCli()
	if (softwares.includes('mage2postman')) await installMage2Postman()
	if (softwares.includes('jetbrains-gateway')) await installJetBrainsGateway()
	if (softwares.includes('ohmyzsh')) await installOhMyZsh()
	if (softwares.includes('starship')) await installStarship()
	if (softwares.includes('deno')) await installDeno()
} else {
	const softwares = await Checkbox.prompt({
		info: true,
		minOptions: 1,
		message: 'Cosa vuoi installare?',
		options: [
			{ name: "mkcert - A simple zero-config tool to make locally trusted development certificates with any names you'd like", value: 'mkcert' },
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
		const url = 'https://github.com/cirolosapio/envman/releases/download/v0.0.8/envman'
		await w.write(new TextEncoder().encode(`curl -L ${url} -o envman\n`))
		await w.write(new TextEncoder().encode(`chmod +x envman\n`))

		w.releaseLock()

		await child.stdin.close()
	}

	await Confirm.prompt('finish!')
}
