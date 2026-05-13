"""
Generate a branded 1200x630 OG image for Temporal.
Uses the same fonts + logo as the landing page header:
  - The full horizontal logotype (symbol + TEMPORAL) from brand/logo-mark.svg
  - Bricolage Grotesque (400/700) for the eyebrow + tagline

The SVG is pre-rendered to scripts/cache/logo-mark.png via:
    sed 's/#ffffff/#000000/g' brand/logo-mark.svg > /tmp/logo-mark-black.svg
    qlmanage -t -s 1600 -o scripts/cache /tmp/logo-mark-black.svg
    mv scripts/cache/logo-mark-black.svg.png scripts/cache/logo-mark.png
The cached PNG is recolored to white at runtime.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import os

W, H = 1200, 630
ROOT = "/Users/alevizio/temporal"
LOGO_LOCKUP = f"{ROOT}/scripts/cache/logo-mark.png"
BRICOLAGE_700 = f"{ROOT}/scripts/fonts/bricolage-700.ttf"
BRICOLAGE_400 = f"{ROOT}/scripts/fonts/bricolage-400.ttf"
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


def measure_tracked(text, font, tracking_em):
    space = int(font.size * tracking_em)
    w = 0
    for i, ch in enumerate(text):
        bb = draw.textbbox((0, 0), ch, font=font)
        w += (bb[2] - bb[0])
        if i < len(text) - 1:
            w += space
    return w


def draw_tracked(xy, text, font, fill, tracking_em):
    x, y = xy
    space = int(font.size * tracking_em)
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        bb = draw.textbbox((0, 0), ch, font=font)
        x += (bb[2] - bb[0]) + space


eb_track = 0.18
ew = measure_tracked(eyebrow_text, eyebrow_font, eb_track)
draw_tracked(((W - ew) / 2, 110), eyebrow_text, eyebrow_font, OCHER, eb_track)

# --- Full horizontal logotype (symbol + TEMPORAL), recolored to stone ---
logo = Image.open(LOGO_LOCKUP).convert("RGBA")
# Trim transparent/white border to find tight bbox of the artwork
gray = ImageOps.invert(logo.convert("L"))     # so dark logo → bright on black
bbox = gray.getbbox()
if bbox:
    logo = logo.crop(bbox)

# Recolor: every opaque-darkish pixel becomes stone color (white-ish)
data = logo.load()
for y in range(logo.height):
    for x in range(logo.width):
        r, g, b, a = data[x, y]
        # If pixel is dark (the original artwork)
        if a > 0 and (r + g + b) < 600:  # darkish
            data[x, y] = (*STONE, a)
        else:
            data[x, y] = (0, 0, 0, 0)

# Resize to fit OG composition: width target ~820px (logotype is ~4.83:1)
target_w = 820
ratio = target_w / logo.width
target_h = int(logo.height * ratio)
logo = logo.resize((target_w, target_h), Image.LANCZOS)

# Center horizontally, vertically positioned in the middle band
lx = (W - logo.width) // 2
ly = (H - logo.height) // 2 - 10
img.paste(logo, (lx, ly), logo)

# --- Tagline (Bricolage Regular) ---
tag_font = ImageFont.truetype(BRICOLAGE_400, 30)
tagline = "A collective lovingly curating dancefloors"
tbox = draw.textbbox((0, 0), tagline, font=tag_font)
tw = tbox[2] - tbox[0]
draw.text(((W - tw) / 2, 510), tagline, font=tag_font, fill=(225, 218, 200))

# Save
img.save(OUT, "JPEG", quality=88, optimize=True)
print(f"Wrote {OUT}")
print(f"Size: {os.path.getsize(OUT) / 1024:.1f} KB")
