"""Analyse des répliques : durée, bornes de parole, enveloppe d'énergie par image (30 fps)
et minutage des mots ESTIMÉ (répartition proportionnelle aux syllabes dans la zone parlée).
Sortie : src/data/audioMeta.json. L'estimation n'est pas une transcription alignée."""
import json, os, re, subprocess, numpy as np
FPS = 30
root = os.path.join(os.path.dirname(__file__), '..')
lines = json.load(open(os.path.join(root, 'src/data/lines.json')))
def find(spk, i):
    for e in ('.mp3', '.wav'):
        p = f'audio/{spk}/{i}{e}'
        if os.path.exists(os.path.join(root, 'public', p)): return p
def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
def weight(w):
    core = re.sub(r'[^a-zàâäéèêëîïôöùûüç]', '', w.lower())
    syl = max(1, len(re.findall(r'[aeiouyàâäéèêëîïôöùûü]+', core)))
    extra = 1.2 if re.search(r'[.!?…]$', w) else 0.6 if re.search(r'[,;:]$', w) else 0
    return syl + 0.15 * len(core) / max(1, syl), extra
meta = {}
for ep, ls in lines.items():
    for l in ls:
        rel = find(l['speaker'], l['id'])
        if not rel:
            print('MANQUANT:', l['speaker'], l['id']); continue
        x = pcm(os.path.join(root, 'public', rel)); sr = 16000
        dur = len(x) / sr
        n = int(np.ceil(dur * FPS)); hop = sr // FPS
        rms = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
        ref = np.percentile(rms, 95) + 1e-9
        env = np.clip(rms / ref, 0, 1.0)
        env = np.where(env < 0.08, 0, env)
        act = np.where(env > 0.1)[0]
        s0 = float(act[0] / FPS) if len(act) else 0.0
        s1 = float((act[-1] + 1) / FPS) if len(act) else dur
        words = l['text'].split()
        ws = [weight(w) for w in words]
        tot = sum(a + b for a, b in ws); span = s1 - s0; t = s0; out = []
        for w, (a, b) in zip(words, ws):
            d = span * a / tot; out.append({'w': w, 'start': round(t, 3), 'end': round(t + d, 3)}); t += d + span * b / tot
        meta[l['id']] = {'file': rel, 'duration': round(dur, 3), 'speechStart': round(s0, 3), 'speechEnd': round(s1, 3), 'words': out, 'env': [round(float(v), 2) for v in env]}
json.dump(meta, open(os.path.join(root, 'src/data/audioMeta.json'), 'w'), ensure_ascii=False)
print('analysé:', {k: (v['duration'], v['file']) for k, v in meta.items()})
