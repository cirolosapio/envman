import { Checkbox, Confirm } from 'https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts'
import { colors } from 'https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts'
import { checkOption, isDocker, isOhMyZshInstalled, isWsl, run, selectWsl } from './functions.ts'
import { installBottom, installCarootOnWsl, installCtop, installDeno, installDockerEngine, installEnvman, installJetBrainsGateway, installMage2Postman, installMagentoCloudCli, installMkcert, installMkcertWin, installOhMyZsh, installSig, installSshs, installStarship } from './softwares.ts'

export const VERSION = 'v0.0.15'

async function main() {
	if (await isDocker()) {
		console.log(colors.yellow('running in docker'))
		console.log(colors.yellow('run this tool on windows/wsl'))
	} else if (await isWsl()) {
		const softwares = await Checkbox.prompt({
			info: true,
			minOptions: 1,
			message: 'Select the softwares to install',
			maxRows: 13,
			options: [
				{ name: 'Docker Engine - open source containerization technology', value: 'docker-engine', ...await checkOption('docker') },
				{ name: 'OhMyZsh - open source, community-driven framework for managing your zsh configuration', value: 'ohmyzsh', ...await checkOption(await isOhMyZshInstalled()) },
				{ name: "mkcert - A simple zero-config tool to make locally trusted development certificates with any names you'd like", value: 'mkcert', ...await checkOption('mkcert') },
				{ name: 'Starship - The minimal, blazing-fast, and infinitely customizable prompt for any shell!', value: 'starship', ...await checkOption('starship') },
				{ name: 'Deno - Next-generation JavaScript runtime', value: 'deno', ...await checkOption('deno', false) },
				{ name: 'ctop - Top-like interface for container metrics', value: 'ctop', ...await checkOption('ctop', false) },
				{ name: 'sshs - Terminal user interface for SSH', value: 'sshs', ...await checkOption('sshs', false) },
				{ name: 'bottom - Yet another cross-platform graphical process/system monitor', value: 'bottom', ...await checkOption('btm', false) },
				{ name: 'sig - Interactive grep', value: 'sig', ...await checkOption('sig', false) },
				{ name: 'Magento Cloud Cli - Command-line tool for managing Magento Commerce Cloud projects', value: 'mgc', ...await checkOption('mgc', false) },
				{ name: 'Mage2Postman - Generate postman collection from Magento', value: 'mage2postman', ...await checkOption('mage2postman', false) },
				{ name: 'JetBrains Gateway - Your single entry point to all remote development environments', value: 'jetbrains-gateway', ...await checkOption('gateway', false, false) },
				{ name: 'envman - Update this tool', value: 'envman' },
			],
		})

		const toInstall = []
		await run(`sudo apt-get -y update`.split(' '))
		if (softwares.includes('ohmyzsh')) await installOhMyZsh()
		if (softwares.includes('deno')) await installDeno()
		if (softwares.includes('jetbrains-gateway')) await installJetBrainsGateway()
		if (softwares.includes('bottom')) await installBottom()
		if (softwares.includes('sig')) await installSig()
		if (softwares.includes('mkcert')) toInstall.push(installMkcert())
		if (softwares.includes('docker-engine')) toInstall.push(installDockerEngine())
		if (softwares.includes('ctop')) toInstall.push(installCtop())
		if (softwares.includes('sshs')) toInstall.push(installSshs())
		if (softwares.includes('mgc')) toInstall.push(installMagentoCloudCli())
		if (softwares.includes('mage2postman')) toInstall.push(installMage2Postman())
		if (softwares.includes('starship')) toInstall.push(installStarship())
		if (softwares.includes('envman')) toInstall.push(installEnvman())
		await Promise.all(toInstall)

		if (await Confirm.prompt('Do you want to install another software?')) await main()
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
			const url = `https://github.com/cirolosapio/envman/releases/download/${VERSION}/envman`
			await w.write(new TextEncoder().encode(`curl -L ${url} -o envman\n`))
			await w.write(new TextEncoder().encode(`chmod +x envman\n`))

			w.releaseLock()

			await child.stdin.close()
		}

		if (await Confirm.prompt('Do you want to install another software?')) await main()
	}
}

console.log(colors.bgBlue('\nWelcome to envman!'), colors.yellow(VERSION), '\n')
await isWsl() && console.log(colors.blue('This tool will help you to install some useful software on your wsl.\n'))

await main()
