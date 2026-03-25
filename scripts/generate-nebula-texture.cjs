// Generates a procedural nebula specular texture for the galaxy dice theme
// Run with: node scripts/generate-nebula-texture.js

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const WIDTH = 512;
const HEIGHT = 512;

// Simple seeded random for reproducibility
let seed = 42;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

// Perlin-like noise using value noise with interpolation
function lerp(a, b, t) { return a + (b - a) * t; }
function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

const GRID = 64;
const noiseGrid = [];
for (let i = 0; i < (GRID + 1) * (GRID + 1); i++) {
  noiseGrid.push(rand());
}

function valueNoise(x, y) {
  const gx = (x / WIDTH) * GRID;
  const gy = (y / HEIGHT) * GRID;
  const ix = Math.floor(gx) % GRID;
  const iy = Math.floor(gy) % GRID;
  const fx = fade(gx - Math.floor(gx));
  const fy = fade(gy - Math.floor(gy));

  const i00 = noiseGrid[iy * (GRID + 1) + ix];
  const i10 = noiseGrid[iy * (GRID + 1) + ix + 1];
  const i01 = noiseGrid[(iy + 1) * (GRID + 1) + ix];
  const i11 = noiseGrid[(iy + 1) * (GRID + 1) + ix + 1];

  return lerp(lerp(i00, i10, fx), lerp(i01, i11, fx), fy);
}

// Multi-octave fractal noise
function fbm(x, y, octaves) {
  let val = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += valueNoise(x * freq, y * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return val / max;
}

// Generate pixel data
const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    const idx = (y * WIDTH + x) * 3;

    // Multiple noise layers for nebula effect
    const n1 = fbm(x + 100, y + 200, 6);
    const n2 = fbm(x + 500, y + 300, 5);
    const n3 = fbm(x * 1.5 + 50, y * 1.5 + 150, 4);
    const n4 = fbm(x * 0.7 + 800, y * 0.7 + 400, 6);

    // Warp the coordinates for swirly nebula look
    const wx = x + n1 * 80;
    const wy = y + n2 * 80;
    const warpedNoise = fbm(wx, wy, 5);

    // Distance from center for vignette
    const dx = (x / WIDTH - 0.5) * 2;
    const dy = (y / HEIGHT - 0.5) * 2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Nebula color channels (deep space blue/purple/cyan)
    const nebula = Math.pow(warpedNoise, 1.5);
    const highlight = Math.pow(n3, 3) * 2;

    // Stars - bright points
    const starChance = rand();
    const isStar = starChance > 0.997;
    const starBright = isStar ? (0.7 + rand() * 0.3) : 0;

    // Color mixing: blue-cyan nebula with purple edges
    let r = nebula * 0.3 + n4 * 0.4 + highlight * 0.6 + starBright;
    let g = nebula * 0.4 + n2 * 0.2 + highlight * 0.8 + starBright;
    let b = nebula * 0.8 + n3 * 0.3 + highlight * 1.0 + starBright;

    // Add some purple/magenta wisps
    const purple = Math.pow(Math.max(0, n4 - 0.4) * 2.5, 2);
    r += purple * 0.6;
    g += purple * 0.1;
    b += purple * 0.5;

    // Slight vignette
    const vignette = 1.0 - dist * 0.3;

    // Ensure this works well as a specular map (brightness matters)
    r = Math.min(255, Math.max(0, Math.floor(r * vignette * 255)));
    g = Math.min(255, Math.max(0, Math.floor(g * vignette * 255)));
    b = Math.min(255, Math.max(0, Math.floor(b * vignette * 255)));

    pixels[idx] = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
  }
}

// Encode as PNG
function encodePNG(width, height, rgbData) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const combined = Buffer.concat([typeBytes, data]);
    const crcVal = crc32(combined);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal);
    return Buffer.concat([len, combined, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type (RGB)
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // IDAT - raw image data with filter byte per row
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 3);
    rawData[rowOffset] = 0; // no filter
    rgbData.copy(rawData, rowOffset + 1, y * width * 3, (y + 1) * width * 3);
  }
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // IEND
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', iend),
  ]);
}

const png = encodePNG(WIDTH, HEIGHT, pixels);
const outDir = path.join(__dirname, '..', 'public', 'assets', 'dice-box', 'themes', 'galaxy');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'specular.jpg'), png); // dice-box expects specular.jpg name
console.log(`Generated nebula specular texture: ${WIDTH}x${HEIGHT} -> ${path.join(outDir, 'specular.jpg')}`);
