# Web Video: Export & Conversion

## 1. Export master from DaVinci Resolve

**Deliver** page → **Custom Export**:

| Setting     | Value                                   |
|-------------|-----------------------------------------|
| Format      | QuickTime                               |
| Codec       | Apple ProRes 422 HQ (or ProRes 422)     |
| Resolution  | Same as timeline                        |
| Frame rate  | Same as timeline                        |
| Audio       | Linear PCM                              |

Save it into the project's `video/` folder, e.g. `master.mov`.
Don't export H.264 from Resolve: compressing twice loses quality.

## 2. Convert for web

One-time setup:

```bash
brew install ffmpeg-full   # includes AV1; the plain `ffmpeg` formula doesn't
chmod +x webvideo.sh
mv webvideo.sh /usr/local/bin/webvideo
```

Run:

```bash
webvideo master.mov              # 1080p H.264 MP4
webvideo -a master.mov           # + AV1 WebM (smaller, for modern browsers)
webvideo -r 720 -q 26 master.mov # smaller file
webvideo -m -a loop.mov          # no audio (background video)
webvideo -h                      # all options
```

| Option | Meaning                                     | Default |
|--------|---------------------------------------------|---------|
| `-r`   | Output height (0 = original)                | 1080    |
| `-q`   | H.264 quality, lower = better (18–28)       | 23      |
| `-Q`   | AV1 quality, lower = better (30–40)         | 35      |
| `-a`   | Also make AV1 `.webm`                       | off     |
| `-m`   | Drop audio                                  | off     |
| `-s`   | x264 preset (`veryslow` = smaller)          | slow    |
| `-o`   | Output folder                               | input's folder |
| `-f`   | Overwrite existing files                    | off     |

Output: `master-1080.mp4` (and `master-1080.webm`) next to the source.

## 3. Embed

```html
<video controls playsinline preload="metadata">
  <source src="master-1080.webm" type="video/webm; codecs=av01.0.08M.08">
  <source src="master-1080.mp4" type="video/mp4">
</video>
```

Background video: replace `controls` with `autoplay muted loop`.

## Troubleshooting

- **Media offline after reopening a project** → add the projects root folder in
  *Preferences → System → Media Storage*, restart, relink once.
- **Washed-out colors in browser** → already handled by the script's bt709 tags.
- **`libsvtav1` missing** → `brew install ffmpeg-full` (the script finds it automatically), or skip `-a`.