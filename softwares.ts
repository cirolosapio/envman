import { bash, exists, getJetBrainsGatewayVersion, getUser, hasDockerDesktop, isCurrentUserInDockerGroup, isInstalled, ps, run, runn } from './functions.ts'
import { colors } from 'https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts'

export async function installDockerEngine() {
	console.log(colors.blue('installing docker engine...'))

	await run('curl -fsSL https://get.docker.com -o get-docker.sh'.split(' '))
	await run('sudo sh ./get-docker.sh'.split(' '))

	await dockerEnginePostInstall()

	console.log(colors.green('docker installed ✔\n'))
}

export async function dockerEnginePostInstall() {
	console.log(colors.blue('processing docker engine post-install...'))

	await bash('sudo usermod -aG docker $USER')
	!(await hasDockerDesktop()) && await Promise.all([
		run(`sudo systemctl enable docker.service`.split(' ')),
		run(`sudo systemctl enable containerd.service`.split(' ')),
	])
	await run('newgrp docker'.split(' '))

	console.log(colors.green('docker post-install processed ✔\n'))
	!(await isCurrentUserInDockerGroup()) && console.log(colors.bgYellow.bold('reopen your terminal to use docker without sudo!'))
}

export async function installOhMyZsh() {
	console.log(colors.blue('installing ohmyzsh...'))

	await run('sudo apt install -y zsh'.split(' '))
	await bash('curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh')

	const plugins = ['zsh-autosuggestions', 'zsh-syntax-highlighting']
	await Promise.all(plugins.map(installZshPlugin))
	plugins.unshift('docker', 'copypath', 'copyfile', 'sudo', 'dirhistory')
	await runn(`sed -i 's/plugins=(git)/plugins=(git ${plugins.join(' ')})/' /home/$USER/.zshrc`)

	console.log(colors.bgYellow.bold('run "chsh -s $(which zsh)" to set as a default shell!'))
	console.log(colors.green('ohmyzsh installed ✔\n'))
}

async function installZshPlugin(plugin: string) {
	const path = `/home/$USER/.oh-my-zsh/custom/plugins/${plugin}`
	if (!await exists(path)) {
		console.log(colors.blue(`installing ohmyzsh plugin ${plugin}...`))
		await bash(`git clone https://github.com/zsh-users/${plugin} ${path}`)
		console.log(colors.green(`ohmyzsh plugin ${plugin} installed ✔\n`))
	} else console.log(colors.yellow(`${plugin} already installed`))
}

export async function installDeno() {
	console.log(colors.blue('installing deno...'))
	await run('sudo apt install unzip'.split(' '))
	await run(['sh', '-c', 'curl -fsSL https://deno.land/install.sh | sh'])
	const user = await getUser()
	const rc_profile = await isInstalled('zsh') ? '~/.zshrc' : '~/.bashrc'
	await Promise.all([
		runn(`echo 'export DENO_INSTALL="/home/${user}/.deno"' >> ${rc_profile}`),
		runn(`echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ${rc_profile}`),
	])
	console.log(colors.green(`deno installed ✔\n`))
}

export async function installStarship() {
	console.log(colors.blue('installing starship...'))
	await run(['sh', '-c', 'curl -sS https://starship.rs/install.sh | FORCE=true sh'])
	if (await isInstalled('zsh')) await runn(`echo 'eval "$(starship init zsh)"' >> ~/.zshrc`)
	else await runn(`echo 'eval "$(starship init bash)"' >> ~/.bashrc`)
	console.log(colors.green(`starship installed ✔\n`))
}

export async function installMkcert() {
	console.log(colors.blue('installing mkcert...'))
	await run('sudo apt install -y libnss3-tools'.split(' '))
	await run('curl -JLO https://dl.filippo.io/mkcert/latest?for=linux/amd64'.split(' '))
	await runn('chmod +x mkcert-v*-linux-amd64')
	await runn('sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert')
	await runn('rm mkcert-v*-linux-amd64')
	await runn('mkdir -p /home/$USER/.local/share/mkcert')
	console.log(colors.green(`mkcert installed ✔\n`))
}

export async function installMkcertWin() {
	console.log(colors.blue('installing mkcert...'))
	await ps('irm get.scoop.sh | iex')
	await ps('scoop install git')
	await ps('scoop bucket add extras')
	await ps('scoop install mkcert')
	await ps('mkcert -install')
	console.log(colors.green(`mkcert installed ✔\n`))
	return (await ps('mkcert -CAROOT')).trim()
}

export async function installCarootOnWsl(path: string, target: string) {
	const user = await getUser(target)
	const destination = `\\\\wsl.localhost\\${target}\\home\\${user}\\.local\\share\\mkcert\\`
	await run(`wsl -d ${target} mkdir -p /home/$USER/.local/share/mkcert`.split(' '))
	await Promise.all([
		ps(`cp ${path}\\rootCA.pem ${destination}`),
		ps(`cp ${path}\\rootCA-key.pem ${destination}`),
	])
	console.log(colors.green(`mkcert root certs successfully installed in ${target} ✔`))
}

export async function installCtop() {
	// https://github.com/bcicen/ctop
	console.log(colors.blue('installing ctop...'))
	await run(`sudo wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -O /usr/local/bin/ctop`.split(' '))
	await run(`sudo chmod +x /usr/local/bin/ctop`.split(' '))
	console.log(colors.green(`ctop installed ✔\n`))
}

export async function installSshs() {
	// https://github.com/quantumsheep/sshs
	console.log(colors.blue('installing sshs...'))
	await run(`sudo wget https://github.com/quantumsheep/sshs/releases/latest/download/sshs-linux-amd64 -O /usr/local/bin/sshs`.split(' '))
	await run(`sudo chmod +x /usr/local/bin/sshs`.split(' '))
	console.log(colors.green(`sshs installed ✔\n`))
}

export async function installBottom() {
	// https://github.com/ClementTsang/bottom
	console.log(colors.blue('installing bottom...'))
	await run(`wget https://github.com/ClementTsang/bottom/releases/download/0.10.2/bottom_0.10.2-1_amd64.deb -O ./bottom_amd64.deb`.split(' '))
	await run(`sudo dpkg -i bottom_amd64.deb`.split(' '))
	await run(`rm -f bottom_amd64.deb`.split(' '))
	console.log(colors.green(`bottom installed ✔\n`))
}

export async function installMagentoCloudCli() {
	console.log(colors.blue('installing magento-cloud-cli...'))
	if (!await isInstalled('php')) return console.log(colors.red('magento-cloud-cli: php is required!'))
	let cmd = `curl -sS https://accounts.magento.cloud/cli/installer | php`
	if (await isInstalled('zsh')) cmd += ' -- --shell-type zsh'
	await run(['sh', '-c', cmd])
	console.log(colors.green(`magento-cloud-cli installed ✔\n`))
}

export async function installMage2Postman() {
	console.log(colors.blue('installing mage2postman...'))
	await run(`sudo curl -L https://github.com/cirolosapio/mage2postman/releases/download/v0.0.2/mage2postman -o /usr/local/bin/mage2postman`.split(' '))
	await run('sudo chmod +x /usr/local/bin/mage2postman'.split(' '))
	console.log(colors.green(`mage2postman installed ✔\n`))
}

export async function installEnvman(version: string) {
	console.log(colors.blue('updating evnman...'))
	await run('sudo rm /usr/local/bin/envman'.split(' '))
	await run(`sudo curl -L https://github.com/cirolosapio/envman/releases/download/${version}/envman -o /usr/local/bin/envman`.split(' '))
	await run('sudo chmod +x /usr/local/bin/envman'.split(' '))
	console.log(colors.green(`evnman updated ✔\n`))
	console.log(colors.underline('you can now re-run envman'))
}

export async function installJetBrainsGateway() {
	console.log(colors.blue('installing JetBrains Gateway...'))

	const currentVersion = await getJetBrainsGatewayVersion()
	if (
		!await exists(`/opt/JetBrainsGateway-${currentVersion}`) ||
		confirm(`Jetbrains Gateway (${currentVersion}) is installed. Do you want to reinstall?`)
	) {
		if (currentVersion) {
			await run(`sudo rm -rf /opt/JetBrainsGateway-${currentVersion}`.split(' '))
			await run(`sudo rm -rf /usr/local/bin/gateway`.split(' '))
		}
		const installEAP = confirm('Do you want to install the EAP version of JetBrains Gateway?')

		const url = `https://data.services.jetbrains.com/products/download?code=GW&platform=linux&type=${installEAP ? 'eap' : 'release'}`

		await Promise.all([
			run(['sh', '-c', `sudo curl -L "${url}" | sudo tar -xz -C /opt/`]),
			run('sudo apt-get install -y libxrender-dev libxtst6 libxi6 libfreetype-dev xdg-utils'.split(' ')),
		])

		const newVersion = await getJetBrainsGatewayVersion()
		await run(`sudo ln -s /opt/JetBrainsGateway-${newVersion}/bin/gateway.sh /usr/local/bin/gateway`.split(' '))
		console.log(colors.green(`JetBrains Gateway (${newVersion}) installed ✔\n`))
	}
}

export async function installSig() {
	// https://github.com/ynqa/sig
	console.log(colors.blue('installing sig...'))
	await run(`wget https://github.com/ynqa/sig/releases/latest/download/sigrs-x86_64-unknown-linux-gnu.tar.xz`.split(' '))
	await run('tar -xf sigrs-x86_64-unknown-linux-gnu.tar.xz'.split(' '))
	await run('sudo mv sigrs-x86_64-unknown-linux-gnu/sig /usr/local/bin/sig'.split(' '))
	await run('rm -rf sigrs-x86_64-unknown-linux-gnu sigrs-x86_64-unknown-linux-gnu.tar.xz'.split(' '))
	console.log(colors.green(`sig installed ✔\n`))
}

export async function installLazygit() {
	// https://github.com/jesseduffield/lazygit
	console.log(colors.blue('installing lazygit...'))
	await run(`wget https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_0.48.0_Linux_32-bit.tar.gz -O lazygit_0.48.0_Linux_32-bit.tar.gz`.split(' '))
	await run('mkdir -p tmp && tar -xf lazygit_0.48.0_Linux_32-bit.tar.gz -C tmp'.split(' '))
	await run('sudo install tmp/lazygit /usr/local/bin'.split(' '))
	await run('rm -rf tmp lazygit_0.48.0_Linux_32-bit.tar.gz'.split(' '))
	console.log(colors.green(`lazygit installed ✔\n`))
}

export async function installFnm() {
	// https://github.com/Schniz/fnm
	console.log(colors.blue('installing fnm...'))
	await run('sudo apt install unzip'.split(' '))
	await run(['sh', '-c', 'curl -fsSL https://fnm.vercel.app/install | bash'])
	console.log(colors.bgYellow.bold('restart your terminal to use fnm!'))
	console.log(colors.green(`fnm installed ✔\n`))
}
