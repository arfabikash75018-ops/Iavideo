"""VOIX DE SUBSTITUTION (espeak-ng, robotique) pour tester timing et lip-sync.
Ne génère que les répliques dont aucun MP3/WAV n'existe déjà : vos MP3 Speechma ont priorité."""
import json, os, subprocess
root = os.path.join(os.path.dirname(__file__), '..')
lines = json.load(open(os.path.join(root, 'src/data/lines.json')))
voice = {'jordan': ['-v', 'fr', '-s', '170', '-p', '30'], 'client': ['-v', 'fr+f3', '-s', '165', '-p', '62']}
for ep, ls in lines.items():
    for l in ls:
        d = os.path.join(root, 'public/audio', l['speaker'])
        if any(os.path.exists(os.path.join(d, l['id'] + e)) for e in ('.mp3', '.wav')):
            continue
        subprocess.run(['espeak-ng', *voice[l['speaker']], '-w', os.path.join(d, l['id'] + '.wav'), l['text']], check=True)
        print('placeholder', l['id'])
