import { bash, exists, getJetBrainsGatewayVersion, getUser, isInstalled, ps, run, runn } from './functions.ts'

export async function installDockerEngine() {
	console.log('installing docker engine...')

	// await run('curl -fsSL https://get.docker.com -o get-docker.sh'.split(' '))
	// await run('sudo sh ./get-docker.sh'.split(' '))

	await run(`sudo apt-get -y update`.split(' '))
	await run(`sudo apt-get -y install ca-certificates curl`.split(' '))
	await run(`sudo install -m 0755 -d /etc/apt/keyrings`.split(' '))
	await run(`sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc`.split(' '))
	await run(`sudo chmod a+r /etc/apt/keyrings/docker.asc`.split(' '))
	await bash('echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null')
	await run(`sudo apt-get -y update`.split(' '))
	await run(`sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`.split(' '))

	// POST
	await Promise.all([
		bash('sudo usermod -aG docker $USER'),
		run(`sudo systemctl enable docker.service`.split(' ')),
		run(`sudo systemctl enable containerd.service`.split(' ')),
	])

	console.log('reopen bash')
}

export async function installOhMyZsh() {
	console.log('installing ohmyzsh...')

	await run('sudo apt install -y zsh'.split(' '))
	await bash('curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh')

	const plugins = ['zsh-autosuggestions', 'zsh-syntax-highlighting']
	await Promise.all(plugins.map(installZshPlugin))
	plugins.unshift('docker', 'copypath', 'copyfile', 'sudo', 'dirhistory')
	await runn(`sed -i 's/plugins=(git)/plugins=(git ${plugins.join(' ')})/' /home/$USER/.zshrc`)

	console.log('run "chsh -s $(which zsh)" to set as a default shell!')
}

async function installZshPlugin(plugin: string) {
	const path = `/home/$USER/.oh-my-zsh/custom/plugins/${plugin}`
	if (!await exists(path)) {
		console.log(`installing ohmyzsh plugin ${plugin}...`)
		await bash(`git clone https://github.com/zsh-users/${plugin} ${path}`)
	} else console.log(`${plugin} already installed`)
}

export async function installDeno() {
	console.log('installing deno...')
	await run('sudo apt install unzip'.split(' '))
	await run(['sh', '-c', 'curl -fsSL https://deno.land/install.sh | sh'])
	const user = await getUser()
	const rc_profile = await isInstalled('zsh') ? '~/.zshrc' : '~/.bashrc'
	await Promise.all([
		runn(`echo 'export DENO_INSTALL="/home/${user}/.deno"' >> ${rc_profile}`),
		runn(`echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ${rc_profile}`),
	])
}

export async function installStarship() {
	console.log('installing starship...')
	await run(['sh', '-c', 'curl -sS https://starship.rs/install.sh | FORCE=true sh'])
	if (await isInstalled('zsh')) await runn(`echo 'eval "$(starship init zsh)"' >> ~/.zshrc`)
	else await runn(`echo 'eval "$(starship init bash)"' >> ~/.bashrc`)
}

export async function installMkcert() {
	console.log('installing mkcert...')
	await run(`sudo apt-get -y update`.split(' '))
	await run('sudo apt install -y libnss3-tools'.split(' '))
	await run('curl -JLO https://dl.filippo.io/mkcert/latest?for=linux/amd64'.split(' '))
	await runn('chmod +x mkcert-v*-linux-amd64')
	await runn('sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert')
	await runn('rm mkcert-v*-linux-amd64')
	await runn('mkdir -p /home/$USER/.local/share/mkcert')
}

export async function installMkcertWin() {
	console.log('installing mkcert...')
	await ps('irm get.scoop.sh | iex')
	await ps('scoop install git')
	await ps('scoop bucket add extras')
	await ps('scoop install mkcert')
	await ps('mkcert -install')
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
}

export async function installCtop() {
	// https://github.com/bcicen/ctop
	console.log('installing ctop...')
	await run(`sudo wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -O /usr/local/bin/ctop`.split(' '))
	await run(`sudo chmod +x /usr/local/bin/ctop`.split(' '))
}

export async function installSshs() {
	// https://github.com/quantumsheep/sshs
	console.log('installing sshs...')
	await run(`sudo wget https://github.com/quantumsheep/sshs/releases/download/4.3.0/sshs-linux-amd64 -O /usr/local/bin/sshs`.split(' '))
	await run(`sudo chmod +x /usr/local/bin/sshs`.split(' '))
}

export async function installBottom() {
	// https://github.com/ClementTsang/bottom
	console.log('installing bottom...')
	await run(`curl -LO https://github.com/ClementTsang/bottom/releases/download/0.9.6/bottom_0.9.6_amd64.deb`.split(' '))
	await run(`sudo dpkg -i bottom_0.9.6_amd64.deb`.split(' '))
	await run(`rm bottom_0.9.6_amd64.deb`.split(' '))
}

export async function installMagentoCloudCli() {
	console.log('installing magento-cloud-cli...')
	if (!await isInstalled('php')) return console.log('php is required!')
	let cmd = `curl -sS https://accounts.magento.cloud/cli/installer | php`
	if (await isInstalled('zsh')) cmd += ' -- --shell-type zsh'
	await run(['sh', '-c', cmd])
}

export async function installMage2Postman() {
	console.log('installing mage2postman...')
	await run(`sudo curl -L https://github.com/cirolosapio/mage2postman/releases/download/v0.0.2/mage2postman -o /usr/local/bin/mage2postman`.split(' '))
	await run('sudo chmod +x /usr/local/bin/mage2postman'.split(' '))
}

export async function installJetBrainsGateway() {
	console.log('installing JetBrains Gateway...')
	const version = '2024.1.2'
	const name = `JetBrainsGateway-${version}.tar.gz`
	await run(`sudo apt-get -y update`.split(' '))

	const currentVersion = await getJetBrainsGatewayVersion()
	if (
		!await exists(`/opt/JetBrainsGateway-${currentVersion}`) ||
		confirm(`Jetbrains Gateway (${currentVersion}) is installed. Do you want to reinstall?`)
	) {
		if (currentVersion) {
			await Deno.remove(`/opt/JetBrainsGateway-${currentVersion}`)
			await Deno.remove('/usr/local/bin/gateway')
		}
		await Promise.all([
			run(['sh', '-c', `sudo curl https://download-cdn.jetbrains.com/idea/gateway/${name} | sudo tar -xz -C /opt/`]),
			run('sudo apt-get install -y libxrender-dev libxtst6 libxi6 libfreetype-dev xdg-utils'.split(' ')),
		])
		await run(`sudo ln -s /opt/JetBrainsGateway-${await getJetBrainsGatewayVersion()}/bin/gateway.sh /usr/local/bin/gateway`.split(' '))
	}
}
