import { bash, exists, run, runn } from './functions.ts'

export async function installDockerEngine() {
	console.log('installing docker engine')

	await run(`sudo apt-get -y update`.split(' '))
	await run(`sudo apt-get -y install ca-certificates curl`.split(' '))
	await run(`sudo install -m 0755 -d /etc/apt/keyrings`.split(' '))
	await run(`sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc`.split(' '))
	await run(`sudo chmod a+r /etc/apt/keyrings/docker.asc`.split(' '))
	await bash('echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null')
	await run(`sudo apt-get -y update`.split(' '))
	await run(`sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`.split(' '))

	// POST
	await bash('sudo usermod -aG docker $USER')
	await run(`sudo systemctl enable docker.service`.split(' '))
	await run(`sudo systemctl enable containerd.service`.split(' '))

	// await run('curl -fsSL https://get.docker.com -o get-docker.sh'.split(' '))
	// await run('sudo sh ./get-docker.sh'.split(' '))

	console.log('reopen bash or run "newgrp docker"')
}

export async function installOhMyZsh() {
	console.log('installing ohmyzsh')

	await run('sudo apt install -y zsh'.split(' '))
	await bash('curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh')

	const plugins = ['zsh-autosuggestions', 'zsh-syntax-highlighting']
	for (const plugin of plugins) await installPlugin(plugin)
	plugins.unshift('docker', 'copypath', 'copyfile', 'sudo', 'dirhistory')
	await runn(`sed -i 's/plugins=(git)/plugins=(git ${plugins.join(' ')})/' /home/$USER/.zshrc`)

	console.log('run "chsh -s $(which zsh)" to set as a default shell!')
}

async function installPlugin(plugin: string) {
	const path = `/home/$USER/.oh-my-zsh/custom/plugins/${plugin}`
	if (!await exists(path)) {
		console.log(`installing ${plugin}`)
		await bash(`git clone https://github.com/zsh-users/${plugin} ${path}`)
	} else console.log(`${plugin} already installed`)
}

export async function installDeno() {
	await run('sudo apt install unzip'.split(' '))
	await run(['sh', '-c', 'curl -fsSL https://deno.land/install.sh | sh'])
}

export async function installStarship() {
	await run(['sh', '-c', 'curl -sS https://starship.rs/install.sh | sh'])
}