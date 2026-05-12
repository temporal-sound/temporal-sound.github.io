"""
Generate a branded 1200x630 OG image for Temporal.
Uses Odinson for the wordmark + Helvetica for the tagline, brand palette gradient.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

W, H = 1200, 630
ROOT = "/Users/alevizio/temporal"
ODINSON_PATH = f"{ROOT}/fonts/odinson.ttf"
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

# --- Eyebrow: "Portland · Artist Collective" ---
HELVETICA = "/System/Library/Fonts/Helvetica.ttc"
eyebrow_font = ImageFont.truetype(HELVETICA, 22, index=1)  # Bold
eyebrow_text = "PORTLAND  ·  ARTIST COLLECTIVE"
# Track out manually with spacing
tracked = "  ".join(eyebrow_text)
ebox = draw.textbbox((0, 0), eyebrow_text, font=eyebrow_font)
ew = ebox[2] - ebox[0]
draw.text(((W - ew) / 2, 110), eyebrow_text, font=eyebrow_font, fill=OCHER)

# --- Wordmark: "Temporal" in Odinson, huge ---
wordmark_font = ImageFont.truetype(ODINSON_PATH, 240)
wordmark = "Temporal"
wbox = draw.textbbox((0, 0), wordmark, font=wordmark_font)
ww = wbox[2] - wbox[0]
wh = wbox[3] - wbox[1]
wx = (W - ww) / 2 - wbox[0]
wy = 175
draw.text((wx, wy), wordmark, font=wordmark_font, fill=STONE)

# --- Tagline ---
tag_font = ImageFont.truetype(HELVETICA, 30, index=2)  # Light
tagline = "A collective lovingly curating dancefloors"
tbox = draw.textbbox((0, 0), tagline, font=tag_font)
tw = tbox[2] - tbox[0]
draw.text(((W - tw) / 2, 470), tagline, font=tag_font, fill=(220, 215, 200))

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
