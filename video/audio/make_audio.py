"""Synthèse procédurale (numpy) de la musique et des bruitages. Aucune ressource externe."""
import json, numpy as np, wave, os
from scipy.signal import butter, sosfilt
SR = 48000
T = json.load(open(os.path.join(os.path.dirname(__file__), '../src/timeline.json')))
N = int(T['end'] * SR)
mix = np.zeros(N)
rng = np.random.default_rng(7)

def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr)[:len(e[-nr:])]
    return e
def add(x, t, g=1.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    x = x[:N - i]; mix[i:i + len(x)] += x * g
def saw(f, d):
    t = tt(d); ph = np.cumsum(np.broadcast_to(f, t.shape)) / SR if np.ndim(f) else f * t
    return 2 * (ph % 1) - 1
def sq(f, d): return np.sign(np.sin(2 * np.pi * (np.cumsum(np.broadcast_to(f, tt(d).shape)) / SR if np.ndim(f) else f * tt(d))))
def sine(f, d): return np.sin(2 * np.pi * (np.cumsum(np.broadcast_to(f, tt(d).shape)) / SR if np.ndim(f) else f * tt(d)))
def noise(d): return rng.standard_normal(int(d * SR))
mf = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- SFX ----------------
def thud(g=1):
    d = .4; t = tt(d); f = 80 * np.exp(-t * 9) + 38
    return (sine(f, d) * np.exp(-t * 8) + lp(noise(d), 300) * np.exp(-t * 25) * .5) * g
def meow(f0=620, d=.7, g=1):
    t = tt(d); f = f0 * (1 + .35 * np.sin(np.pi * t / d) ** 1.0) * (1 + .02 * np.sin(t * 40))
    s = saw(f, d); s = bp(s, 500, 3200) + .4 * bp(s, 1200, 2400)
    return s * env(len(s), .04, .15) * np.sin(np.pi * np.linspace(0, 1, len(s))) ** .5 * g * .5
def hiss(d=.8, g=1):
    s = bp(noise(d), 3500, 9000); return s * env(len(s), .05, .3) * g * .6
def growl(d=1, f=70, g=1):
    t = tt(d); f_ = f * (1 + .08 * np.sin(t * 25)); s = saw(f_, d) + .5 * saw(f_ * 1.5, d)
    s = lp(s + noise(d) * .5, 900) * (1 + .5 * np.sin(t * 38)); return s * env(len(s), .05, .2) * g * .5
def roar(d=1.2, g=1):
    t = tt(d); f = 95 * (1 + .25 * np.sin(np.pi * t / d)) * (1 + .06 * np.sin(t * 28))
    s = saw(f, d) + .6 * saw(f * 2.01, d) + noise(d) * .9
    s = lp(s, 2200) * (1 + .6 * np.sin(t * 45)); return s * env(len(s), .08, .35) * g * .55
def yelp(f0=900, d=.5, g=1):
    t = tt(d); f = f0 * (1 + .6 * np.exp(-t * 6)) - 400 * t / d
    s = bp(saw(f, d), 600, 3500); return s * env(len(s), .01, .12) * g * .5
def whoosh(d=.7, a=300, b=5000, g=1):
    s = noise(d); n = len(s); out = np.zeros(n)
    k = 14
    for i in range(k):
        lo = a * (b / a) ** (i / k); hi = a * (b / a) ** ((i + 1) / k)
        band = bp(s, lo, hi) * np.exp(-((np.linspace(0, 1, n) - (i + .5) / k) ** 2) / .03)
        out += band
    return out * env(n, .05, .2) * g * 1.2
def boing(f0=300, d=.5, g=1):
    t = tt(d); f = f0 * (1 + .6 * np.sin(t * 38) * np.exp(-t * 6))
    return sine(f, d) * np.exp(-t * 6) * g * .6
def pop(g=1):
    d = .15; t = tt(d); return sine(900 * np.exp(-t * 30) + 200, d) * np.exp(-t * 28) * g * .8
def bonk(g=1):
    d = .3; t = tt(d); return (sine(220 * np.exp(-t * 6) + 120, d) + .4 * sine(450, d)) * np.exp(-t * 14) * g * .7
def patter(d=1.0, g=1):
    s = np.zeros(int(d * SR))
    for k in np.arange(0, d, .06 + .0):
        i = int(k * SR); c = lp(noise(.04), 1500) * np.exp(-tt(.04) * 90); m = min(len(c), len(s) - i); s[i:i + m] += c[:m] * (.5 + rng.random() * .5)
    return s * g * .8
def laugh(g=1):
    out = np.zeros(int(1.4 * SR))
    for k in range(5):
        d = .17; s = bp(saw(180 + k * 8, d), 400, 1800); s *= env(len(s), .01, .06)
        i = int(k * .22 * SR); m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
    return out * g * .5
def scream(d=1.6, g=1):
    t = tt(d); f = 700 + 350 * np.sin(t * 6) * .3 + 200 * (t / d)
    s = bp(saw(f, d) + noise(d) * .25, 500, 4000) * (1 + .3 * np.sin(t * 50))
    return s * env(len(s), .03, .25) * g * .5
def sneeze(g=1):
    a = hp(noise(.35), 1200) * env(int(.35 * SR), .02, .15) * 1.0
    b = whoosh(.6, 200, 7000, 1.2)
    c = thud(1.4)
    out = np.zeros(int(1.0 * SR)); out[:len(a)] += a * .9; out[int(.1 * SR):int(.1 * SR) + len(b)] += b; out[:len(c)] += c
    return out * g
def sad_trombone(g=1):
    out = np.zeros(int(2.2 * SR))
    for t0, f, d in [(0, 233, .4), (.45, 220, .4), (.9, 208, .4), (1.35, 185, .8)]:
        v = saw(f * (1 + .02 * np.sin(tt(d) * 30)), d); v = lp(v, 1500) * env(len(v), .03, .1)
        i = int(t0 * SR); m = min(len(v), len(out) - i); out[i:i + m] += v[:m]
    return out * g * .35
def stinger(g=1):
    d = 1.4; t = tt(d)
    s = sum(saw(f, d) for f in [55, 58, 82, 110]) ; s = lp(s, 700) * np.exp(-t * 2.2)
    th = np.zeros(len(s)); q = thud(1.5); m = min(len(q), len(s)); th[:m] = q[:m]
    return (s * .25 + th) * g
def timp(g=1):
    d = .5; t = tt(d); return sine(70 * np.exp(-t * 3) + 48, d) * np.exp(-t * 7) * g * .9
def cheer(d=1.5, g=1):
    s = np.zeros(int(d * SR))
    for k in range(7):
        t0 = rng.random() * .4; dd = .5 + rng.random() * .6
        f = 600 + rng.random() * 500; v = bp(saw(f * (1 + .3 * np.sin(tt(dd) * 6)), dd) + noise(dd) * .3, 400, 3000)
        v *= env(len(v), .05, .3); i = int(t0 * SR); m = min(len(v), len(s) - i); s[i:i + m] += v[:m]
    return s * g * .25

# ---- cues ----
add(meow(520, 1.0), T['catEnter'] + .3, .5)
add(patter(2.3, .5), T['catEnter'] + .2, .35)
for k in range(5): add(meow(560 + k * 20, .35), 2.9 + k * .5, .35)
add(hiss(1.0), T['hiss'] - .1, .8); add(growl(1.6, 90), 3.0, .8)
add(whoosh(.5, 400, 3000), T['crouch'] + .2, .4)
add(whoosh(.8, 300, 4500), T['jump'], .9); add(hiss(.7), T['jump'], .7)
add(bonk(1.0), T['hit']); add(yelp(1000, .6), T['hit'] + .05, 1.0); add(yelp(1200, .5), T['hit'] + .45, .8)
add(boing(260, .6), T['hit'] + .02, .7)
add(whoosh(.5, 300, 3000), T['shakeOff'] - .05, .6); add(boing(400, .5), T['shakeOff'] + .6, .5)
# lion steps
k = 0; ts = T['stepStart']
while ts + k * .62 < 11.0:
    add(thud(1.0), ts + k * .62, .5 + .04 * k); k += 1
add(growl(1.2, 60), 11.2, .6)
add(roar(1.4), T['roar'], 1.0); add(thud(1.4), T['roar'], .8)
add(meow(900, .6), T['catFlee'], .8); add(patter(1.6, .8), T['catFlee'] + .1, .6); add(whoosh(.5, 600, 5000), T['catFlee'] + .1, .5)
for k in range(5): add(yelp(1100, .25), T['cheer'] + k * .35, .35)
add(laugh(), T['evil'] - .1, .8); add(meow(480, 1.0), T['catBack'] + .5, .5)
add(stinger(1.0), T['armyStart'] - .2, .9)
for i in range(20): add(patter(1.4, .6), 17.4 + i * .13, .22)
for i in range(14): add(meow(500 + (i * 37) % 300, .45), T['armyStart'] + .5 + i * .22, .3)
for i in range(0, 12): add(growl(.7, 80 + i * 5), T['circle'] + i * .6, .25)
add(whoosh(.6, 200, 4000), T['pounce'] - .1, .8)
add(roar(1.0), T['pounce'], .7); add(thud(1.5), T['pounce'] + .3, 1.2)
for i in range(18): add(bonk(1.0), T['dust'] + i * .1, .25 + .15 * rng.random())
for k, nm in enumerate(['pop1', 'pop2', 'pop3', 'pop4', 'pop5']):
    add(pop(1.0), T[nm], 1.0); add(boing(350 + 60 * k, .5), T[nm], .5); add(whoosh(.5, 300, 4000), T[nm] - .05, .35)
add(cheer(2.2), T['reveal'] + .2, 1.0)
for k in range(5): add(cheer(1.0), T['celebrate'] + k * 1.3, .6)
for k in range(8): add(meow(700 + 40 * k, .3), T['celebrate'] + .2 + k * .55, .3)
add(sad_trombone(1.0), T['embarrass'] + .8, .9)
add(yelp(1000, .5), 38.0, .4)
# scene 5
add(boing(500, .5), T['look'], .6); add(yelp(1400, .3), T['look'], .5); add(yelp(1400, .3), T['look'] + .15, .4)
add(stinger(1.2), T['gRise'], 1.0); add(thud(1.4), T['gRise'] + .1, 1.0)
add(growl(2.0, 40), T['gRise'], .9)
add(patter(1.4, 1.0), 41.6, .5)
add(meow(180, 1.4), T['gEyes'], 1.0)
add(scream(1.7), T['scream'], 1.0); add(scream(1.5), T['scream'] + .15, .8)
add(whoosh(1.0, 200, 2500), T['inhale'], .9)
add(sneeze(), T['sneeze'] - .08, 1.2); add(whoosh(1.0, 300, 6000), T['sneeze'], 1.0)
add(scream(1.2), T['sneeze'] + .1, .7)
add(sad_trombone(1.0), T['fin'] - .1, .9)
add(meow(700, .5), T['fin'] + .5, .4)

# ---------------- MUSIC ----------------
def pluck(f, d=.18, g=1):
    s = saw(f, d) * np.exp(-tt(d) * 14); return lp(s, 2500) * g
def tone(f, d, g=1, w='saw'):
    s = (saw if w == 'saw' else sine)(f, d); return lp(s, 1800) * env(len(s), .02, .08) * g
def brass(f, d, g=1):
    s = saw(f * (1 + .004 * np.sin(tt(d) * 6)), d); return lp(s, 1400 + 0) * env(len(s), .05, .1) * g
mus = np.zeros(N)
def madd(x, t, g=1):
    i = int(t * SR)
    if 0 <= i < N: x = x[:N - i]; mus[i:i + len(x)] += x * g
# S1: sneaky pizzicato 0-8 (110bpm)
b = 60 / 120
seq = [60, 63, 67, 63, 62, 65, 69, 65]
for k in range(int(5.0 / (b / 2))):
    madd(pluck(mf(seq[k % 8] - 12 + 12), .2), .2 + k * b / 2, .20)
    if k % 2 == 0: madd(pluck(mf(seq[k % 8] - 24), .25), .2 + k * b / 2, .28)
for k in range(24): madd(pluck(mf(72 + (k % 4) * 2), .1), 5.0 + k * .125, .12 + .004 * k)    # tension trill 5-8
madd(tone(mf(40), 1.0), 5.0, .0)
# S2: march + fanfare
for k in range(int(3.0 / .62)): madd(tone(mf(36 if k % 2 == 0 else 43), .5, 1, 'sine'), 8.6 + k * .62, .5)
for k, (m, d) in enumerate([(60, .3), (64, .3), (67, .3), (72, .9)]): madd(brass(mf(m), d), 11.0 + k * .32, .3)
madd(brass(mf(48), 1.4) + brass(mf(55), 1.4) + brass(mf(60), 1.4), 12.0, .3)
mel = [72, 72, 76, 79, 76, 79, 84, 79]
for k, m in enumerate(mel): madd(brass(mf(m), .33), 13.2 + k * .35, .22)
for k in range(8): madd(pluck(mf(48 + (k % 2) * 7), .25), 14.4 + k * .35, .3)
# S3: tension 16-27
madd(tone(mf(33), 11, .35, 'sine'), 16, 1); madd(lp(saw(mf(45), 11), 300) * .12 * np.linspace(.3, 1, int(11 * SR)), 16, 1)
for k in range(30):
    gap = max(.35, .9 - k * .035); 
hb = 16.0
while hb < 27: madd(timp(), hb, .55); madd(timp(), hb + .25, .35); hb += max(.4, 1.0 - (hb - 16) * .05)
st = [57, 60, 64, 60, 57, 60, 64, 62]
for k in range(int(9 / .2)): madd(pluck(mf(st[k % 8]), .12), 17.8 + k * .2, .11)
# S4: circus galop 27-40
for k in range(int(12.6 / .25)):
    tm = 27.4 + k * .25
    if k % 2 == 0: madd(pluck(mf([48, 53, 55, 48][(k // 2) % 4]), .2), tm, .3)
    else: madd(pluck(mf([64, 65, 67, 64][(k // 2) % 4]), .12) + pluck(mf([67, 69, 71, 67][(k // 2) % 4]), .12), tm, .16)
mel4 = [72, 74, 76, 77, 79, 77, 76, 74] * 2
for k, m in enumerate(mel4): madd(brass(mf(m), .24), 30.4 + k * .25, .17)
mus[int(33.0 * SR):int(37 * SR)] *= .5
# S5
madd(tone(mf(36), 7, .3, 'sine') , 40, 1)
for k in range(int(6.5 / .5)): madd(pluck(mf(46 + (k % 2) * 1), .3), 40.4 + k * .5, .14 + .01 * k)
mus[int(T['sneeze'] * SR - 3000):int((T['sneeze'] + .4) * SR)] *= .15
# mix down
mus = lp(mus, 7000) * 0.42
out = mix + mus
# fades
out[:int(.1 * SR)] *= np.linspace(0, 1, int(.1 * SR)); out[-int(.3 * SR):] *= np.linspace(1, 0, int(.3 * SR))
pk = np.max(np.abs(out)); out = np.tanh(out / pk * 1.6) * .9
# stereo with slight haas width
L = out; R = np.roll(out, 40) * .98
st = np.stack([L, R], 1)
pcm = (st * 32767).astype('<i2')
path = os.path.join(os.path.dirname(__file__), '../public/audio.wav')
with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', path, N / SR, 's')
