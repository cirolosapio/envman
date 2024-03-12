import { Checkbox } from 'https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts'
import { isDocker, isWsl, run } from './functions.ts'
import { installDeno, installDockerEngine, installOhMyZsh, installStarship } from './softwares.ts'

if (await isDocker()) {
	console.log('running in docker')
	console.log('run this command on windows/wsl')
} else if (await isWsl()) {
	console.log('running in wsl')

	const softwares = await Checkbox.prompt({
		message: 'Cosa vuoi installare?',
		options: ['docker-engine', 'deno', 'ohmyzsh'],
	})

	if (softwares?.includes('docker-engine')) await installDockerEngine()
	if (softwares?.includes('ohmyzsh')) await installOhMyZsh()
	// if (softwares?.includes('starship')) await installStarship()
	if (softwares?.includes('deno')) await installDeno()
} else {
	console.log('running in powershell')

	const res = await run(['wsl', '-l', '-v'], 'utf-16')

	const wsls = []
	for (const row of res.split('\r\n').slice(1)) {
		const names = row.split(' ').filter(Boolean)
		if (names.length === 0) continue
		else if (names.length === 4) wsls.push(names[1])
		else wsls.push(names[0])
	}
	console.log('🚀 ~ wsls:', wsls)

	const target = Checkbox.prompt({
		message: 'Seleziona una wsl',
		options: wsls
	})
	
	console.log('--- ~ target:', target)
}
