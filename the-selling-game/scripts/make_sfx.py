"""Bruitages et musique de fond synthétisés (numpy) : libres de droits, aucune ressource externe."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt
SR = 48000
out = os.path.join(os.path.dirname(__file__), '../public/audio/sfx'); os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(3)
tt = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def save(name, x, g=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * g
    with wave.open(os.path.join(out, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
def sine(f, d): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, tt(d).shape)) / SR)
def noise(d): return rng.standard_normal(int(d * SR))

# whoosh : transition de plan
d = .55; t = tt(d); n = bp(noise(d), 400, 6000) * np.sin(np.pi * t / d) ** 2; save('whoosh.wav', n, .7)
# pop : apparition d'un objet
d = .16; t = tt(d); save('pop.wav', sine(900 * np.exp(-t * 28) + 220, d) * np.exp(-t * 26), .8)
# ding : connexion
d = .7; t = tt(d); save('ding.wav', (sine(1568, d) + .5 * sine(2349, d) + .25 * sine(3136, d)) * np.exp(-t * 6), .7)
# tick
d = .06; t = tt(d); save('tick.wav', hp(noise(d), 2500) * np.exp(-t * 70), .5)
# caisse enregistreuse : clac mécanique + cloche
d = 1.5; t = tt(d); clack = lp(noise(.12), 2500) * np.exp(-tt(.12) * 40)
b = np.zeros(int(d * SR)); b[:len(clack)] += clack * 1.2
for k, (t0, f) in enumerate([(.12, 2093), (.12, 3136)]):
    i = int(t0 * SR); tb = tt(d - t0); b[i:] += ((sine(f, d - t0) + .4 * sine(f * 2.76, d - t0)) * np.exp(-tb * 4.5))[:len(b) - i] * .5
b[int(.1 * SR):int(.1 * SR) + 3000] += hp(noise(3000 / SR), 3000) * .3
save('kaching.wav', b, .9)
# thud : zoom brusque
d = .35; t = tt(d); save('thud.wav', sine(90 * np.exp(-t * 8) + 40, d) * np.exp(-t * 9), .9)
# musique : groove lo-fi 100 BPM, 56 s, volontairement discrète
bpm = 100; beat = 60 / bpm; D = 56; N = int(D * SR); m = np.zeros(N)
mf = lambda n: 440 * 2 ** ((n - 69) / 12)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G
def add(x, t0, g=1):
    i = int(t0 * SR); x = x[:N - i]; m[i:i + len(x)] += x * g
for bar in range(int(D / (4 * beat))):
    ch = chords[bar % 4]; t0 = bar * 4 * beat
    for n in ch: add(lp(sine(mf(n), 4 * beat), 900) * np.sin(np.pi * tt(4 * beat) / (4 * beat)) ** .5, t0, .10)
    for k in range(8):                                               # basse
        add(sine(mf(ch[0] - 24), beat / 2) * np.exp(-tt(beat / 2) * 6), t0 + k * beat / 2, .35 if k % 2 == 0 else .0)
    for k in range(16):                                              # charley
        add(hp(noise(.05), 7000) * np.exp(-tt(.05) * 90), t0 + k * beat / 4, .10 if k % 4 else .16)
    for k in (0, 2): add(sine(60 * np.exp(-tt(.25) * 8) + 45, .25) * np.exp(-tt(.25) * 12), t0 + k * beat, .55)   # grosse caisse
    for k in (1, 3): add(bp(noise(.12), 1200, 5000) * np.exp(-tt(.12) * 30), t0 + k * beat, .22)                 # caisse claire
    arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12] * 2
    for k, n in enumerate(arp): add(lp(sine(mf(n), .25), 2500) * np.exp(-tt(.25) * 9), t0 + k * beat / 2, .10)
m = lp(m, 8000); m[:int(.5 * SR)] *= np.linspace(0, 1, int(.5 * SR)); m[-int(2 * SR):] *= np.linspace(1, 0, int(2 * SR))
save('music.wav', m, .8)
print('sfx ok')
