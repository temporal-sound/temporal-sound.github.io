"""
Generate a branded 1200x630 OG image for Temporal.
Uses the same fonts as the landing page:
  - Odinson for the "Temporal" wordmark
  - Bricolage Grotesque (400/700) for eyebrow + tagline
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

W, H = 1200, 630
ROOT = "/Users/alevizio/temporal"
ODINSON_PATH = f"{ROOT}/fonts/odinson.ttf"
BRICOLAGE_700 = f"{ROOT}/scripts/fonts/bricolage-700.ttf"
BRICOLAGE_400 = f"{ROOT}/scripts/fonts/bricolage-400.ttf"
LOGO_SYMBOL_PATH = f"{ROOT}/brand/logo.png"
OUT = f"{ROOT}/img/og-default.jpg"

# Brand colors (R, G, B)
NIGHT = (14, 19, 30)
NIGHT_2 = (22, 28, 42)
STONE = (237, 229, 207)
OCHER = (208, 134, 57)
TERRACOTTA = (181, 84, 55)
LAVENDER = (194, 181, 233)

# --- Background: smooth corner gradient via small upscaled image ---
seed = Image.new("RGB", (3, 2))
seed.putpixel((0, 0), NIGHT_2)        # top-left
seed.putpixel((1, 0), (40, 30, 35))   # top-mid (warm-tinted dark)
seed.putpixel((2, 0), (70, 35, 30))   # top-right (terracotta hint)
seed.putpixel((0, 1), NIGHT)          # bottom-left
seed.putpixel((1, 1), NIGHT)          # bottom-mid
seed.putpixel((2, 1), (28, 22, 26))   # bottom-right (subtle warm)
img = seed.resize((W, H), Image.BICUBIC)

# Soft halo glow in upper-right (lavender + ocher hints)
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow)
gdraw.ellipse((W - 600, -200, W + 200, 600), fill=(*OCHER, 60))
gdraw.ellipse((-200, H - 500, 600, H + 200), fill=(*LAVENDER, 35))
glow = glow.filter(ImageFilter.GaussianBlur(120))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")

draw = ImageDraw.Draw(img)

# --- Eyebrow: "Portland · Artist Collective" (Bricolage Bold, tracked) ---
eyebrow_font = ImageFont.truetype(BRICOLAGE_700, 22)
eyebrow_text = "PORTLAND  ·  ARTIST COLLECTIVE"
# Manual letter-spacing — PIL has no native tracking control
def draw_tracked(xy, text, font, fill, tracking_em=0.28):
    x, y = xy
    space = int(font.size * tracking_em)
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        bb = draw.textbbox((0, 0), ch, font=font)
        x += (bb[2] - bb[0]) + space

def measure_tracked(text, font, tracking_em=0.28):
    space = int(font.size * tracking_em)
    w = 0
    for i, ch in enumerate(text):
        bb = draw.textbbox((0, 0), ch, font=font)
        w += (bb[2] - bb[0])
        if i < len(text) - 1:
            w += space
    return w

ew = measure_tracked(eyebrow_text, eyebrow_font, 0.18)
draw_tracked(((W - ew) / 2, 110), eyebrow_text, eyebrow_font, OCHER, 0.18)

# --- Wordmark: "Temporal" in Odinson, huge ---
wordmark_font = ImageFont.truetype(ODINSON_PATH, 240)
wordmark = "Temporal"
wbox = draw.textbbox((0, 0), wordmark, font=wordmark_font)
ww = wbox[2] - wbox[0]
wx = (W - ww) / 2 - wbox[0]
wy = 175
draw.text((wx, wy), wordmark, font=wordmark_font, fill=STONE)

# --- Tagline (Bricolage Regular) ---
tag_font = ImageFont.truetype(BRICOLAGE_400, 30)
tagline = "A collective lovingly curating dancefloors"
tbox = draw.textbbox((0, 0), tagline, font=tag_font)
tw = tbox[2] - tbox[0]
draw.text(((W - tw) / 2, 475), tagline, font=tag_font, fill=(225, 218, 200))

# --- Brand symbol bottom-right ---
if os.path.exists(LOGO_SYMBOL_PATH):
    symbol = Image.open(LOGO_SYMBOL_PATH).convert("RGBA")
    # Recolor to ocher: replace black pixels with ocher
    px = symbol.load()
    for y in range(symbol.height):
        for x in range(symbol.width):
            r, g, b, a = px[x, y]
            if a > 0:
                px[x, y] = (*OCHER, int(a * 0.85))
    symbol.thumbnail((90, 90), Image.LANCZOS)
    img.paste(symbol, (W - 130, H - 130), symbol)

# Save
img.save(OUT, "JPEG", quality=88, optimize=True)
print(f"Wrote {OUT}")
print(f"Size: {os.path.getsize(OUT) / 1024:.1f} KB")
