# Temporal website

## Local server

Run `python3 -m http.server 8000` and open http://localhost:8000/

## Optimizing images

```
$ magick mogrify -path img -format jpg \
  -auto-orient -resize '2048x2048>' -strip \
  -sampling-factor 4:2:0 -interlace JPEG -quality 82 -colorspace sRGB \
  img_src/*
```
