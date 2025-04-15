import { Checkbox, CheckboxOption, Confirm } from 'https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts'
import { colors } from 'https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts'
import { checkOption, dockerServiceStartsAutomatically, getLastEnvmanVersion, hasDockerDesktop, isCurrentUserInDockerGroup, isDocker, isOhMyZshInstalled, isWsl, run, selectWsl } from './functions.ts'
import { dockerEnginePostInstall, installBottom, installCarootOnWsl, installCtop, installDeno, installDockerEngine, installEnvman, installFnm, installJetBrainsGateway, installLazygit, installMage2Postman, installMagentoCloudCli, installMkcert, installMkcertWin, installOhMyZsh, installOllama, installSig, installSshs, installStarship } from './softwares.ts'

export const VERSION = 'v0.1.3'

async function main() {
	if (await isDocker()) {
		console.log(colors.yellow('running in docker'))
		console.log(colors.yellow('run this tool on windows/wsl'))
	} else if (await isWsl() || Deno.build.os === 'linux') {
		const [
			showDocker,
			showOhmyzsh,
			showMkcert,
			showStarship,
			showDeno,
			showCtop,
			showSshs,
			showBtm,
			showSig,
			showLazygit,
			showMgc,
			showMage2postman,
			showGateway,
			showFnm,
			showOllama,
			lastEnvmanVersion,
		] = await Promise.all([
			checkOption('docker'),
			checkOption(await isOhMyZshInstalled()),
			checkOption('mkcert'),
			checkOption('starship'),
			checkOption('deno', false),
			checkOption('ctop', false),
			checkOption('sshs', false),
			checkOption('btm', false),
			checkOption('sig', false),
			checkOption('lazygit', false),
			checkOption('mgc', false),
			checkOption('mage2postman', false),
			checkOption('gateway', false, false),
			checkOption('fnm', false),
			checkOption('ollama', false),
			getLastEnvmanVersion(),
		])

		const installed = []
		const options: CheckboxOption<string>[] = []

		if (lastEnvmanVersion !== VERSION) {
			console.log(colors.yellow(`New version of envman available: ${lastEnvmanVersion}`))
			if (await Confirm.prompt({ message: 'Do you want to update envman?', default: true })) {
				await installEnvman(lastEnvmanVersion)
				return
			}
		}

		if (showDocker.disabled) {
			installed.push('Docker Engine')

			const postInstallInstalled = await hasDockerDesktop() || (await isCurrentUserInDockerGroup() && await dockerServiceStartsAutomatically())
			!postInstallInstalled && options.push({ name: 'Docker Engine Post Install', value: 'docker-engine-post-install', ...await checkOption(false) })
		} else options.push({ name: 'Docker Engine - open source containerization technology', value: 'docker-engine', ...showDocker })

		if (showGateway.disabled) installed.push('JetBrains Gateway')
		else options.push({ name: 'JetBrains Gateway - Your single entry point to all remote development environments', value: 'jetbrains-gateway', ...showGateway })

		if (showMage2postman.disabled) installed.push('Mage2Postman')
		else options.push({ name: 'Mage2Postman - Generate postman collection from Magento', value: 'mage2postman', ...showMage2postman })

		if (showMgc.disabled) installed.push('Magento Cloud Cli')
		else options.push({ name: 'Magento Cloud Cli - Command-line tool for managing Magento Commerce Cloud projects', value: 'mgc', ...showMgc })

		if (showSig.disabled) installed.push('sig')
		else options.push({ name: 'sig - Interactive grep', value: 'sig', ...showSig })

		if (showLazygit.disabled) installed.push('lazygit')
		else options.push({ name: 'lazygit - simple terminal UI for git commands', value: 'lazygit', ...showLazygit })

		if (showBtm.disabled) installed.push('bottom')
		else options.push({ name: 'bottom - Yet another cross-platform graphical process/system monitor', value: 'bottom', ...showBtm })

		if (showSshs.disabled) installed.push('sshs')
		else options.push({ name: 'sshs - Terminal user interface for SSH', value: 'sshs', ...showSshs })

		if (showCtop.disabled) installed.push('ctop')
		else options.push({ name: 'ctop - Top-like interface for container metrics', value: 'ctop', ...showCtop })

		if (showDeno.disabled) installed.push('Deno')
		else options.push({ name: 'Deno - Next-generation JavaScript runtime', value: 'deno', ...showDeno })

		if (showStarship.disabled) installed.push('Starship')
		else options.push({ name: 'Starship - The minimal, blazing-fast, and infinitely customizable prompt for any shell!', value: 'starship', ...showStarship })

		if (showMkcert.disabled) installed.push('mkcert')
		else options.push({ name: "mkcert - A simple zero-config tool to make locally trusted development certificates with any names you'd like", value: 'mkcert', ...showMkcert })

		if (showOhmyzsh.disabled) installed.push('OhMyZsh')
		else options.push({ name: 'OhMyZsh - open source, community-driven framework for managing your zsh configuration', value: 'ohmyzsh', ...showOhmyzsh })

		if (showFnm.disabled) installed.push('fnm')
		else options.push({ name: 'fnm - Fast and simple Node.js version manager, built in Rust', value: 'fnm', ...showFnm })

		if (showOllama.disabled) installed.push('ollama')
		else options.push({ name: 'Ollama - Get up and running with Llama 3.3, DeepSeek-R1, Phi-4, Gemma 3, and other large language models.', value: 'ollama', ...showOllama })

		installed.forEach((software) => console.log(colors.green(` ✔ ${software} already installed`)))
		console.log()

		if (options.length > 0) {
			const softwares = await Checkbox.prompt<string>({
				info: true,
				minOptions: 1,
				message: 'Select the softwares to install',
				maxRows: options.length,
				options,
			})

			const toInstall = []
			await run(`sudo apt-get -y update`.split(' '))
			if (softwares.includes('ohmyzsh')) await installOhMyZsh()
			if (softwares.includes('deno')) await installDeno()
			if (softwares.includes('jetbrains-gateway')) await installJetBrainsGateway()
			if (softwares.includes('bottom')) await installBottom()
			if (softwares.includes('sig')) await installSig()
			if (softwares.includes('lazygit')) await installLazygit()
			if (softwares.includes('docker-engine-post-install')) toInstall.push(dockerEnginePostInstall())
			if (softwares.includes('mkcert')) toInstall.push(installMkcert())
			if (softwares.includes('docker-engine')) toInstall.push(installDockerEngine())
			if (softwares.includes('ctop')) toInstall.push(installCtop())
			if (softwares.includes('sshs')) toInstall.push(installSshs())
			if (softwares.includes('mgc')) toInstall.push(installMagentoCloudCli())
			if (softwares.includes('mage2postman')) toInstall.push(installMage2Postman())
			if (softwares.includes('starship')) toInstall.push(installStarship())
			if (softwares.includes('fnm')) toInstall.push(installFnm())
			if (softwares.includes('ollama')) toInstall.push(installOllama())
			await Promise.all(toInstall)

			if (await Confirm.prompt({ message: 'Do you want to install another software?', default: false })) await main()
		} else console.log(colors.green('All software are installed ✔'))
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

		if (await Confirm.prompt({ message: 'Do you want to install another software?', default: false })) await main()
	}
}

console.log(colors.bgBlue('\nWelcome to envman!'), colors.yellow(VERSION), '\n')
await isWsl() && console.log(colors.blue('This tool will help you to install some useful software on your wsl.\n'))

await main()
