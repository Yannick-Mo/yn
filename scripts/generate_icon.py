from PIL import Image, ImageDraw, ImageFilter
import math, os

SIZE = 1024
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src-tauri", "icons")

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img, "RGBA")

cx = cy = SIZE // 2

# Deep gradient background
for i in range(512):
    t = i / 512
    r = int(8 + (15 - 8) * t)
    g = int(12 + (22 - 12) * t)
    b = int(36 + (58 - 36) * t)
    a = int(255 * (1 - t * 0.08))
    draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(r, g, b, a))

# === Origami "YN" monogram ribbon ===
# A continuous folded ribbon forming Y→N

pts = [
    (cx + 180, cy - 200),  # Y top-right tip
    (cx + 80,  cy - 100),  # Y inner elbow
    (cx + 120, cy - 40),   # Y stem top
    (cx,       cy + 30),   # Y stem bottom (fold point)
    (cx - 60,  cy - 20),   # N left upstroke
    (cx - 120, cy - 100),  # N left top
    (cx - 180, cy - 200),  # N left tip
]

fold_colors = [
    (147, 197, 253, 200),
    (96, 165, 250, 180),
    (59, 130, 246, 160),
    (37, 99, 235, 140),
    (59, 130, 246, 160),
    (96, 165, 250, 180),
    (147, 197, 253, 200),
]

# Draw ribbon - each segment with its own color
for i in range(len(pts) - 1):
    x1, y1 = pts[i]
    x2, y2 = pts[i + 1]
    color = fold_colors[i]
    
    # Main line
    for w, a in [(14, 15), (8, 30), (4, color[3])]:
        cx_ = (x1 + x2) // 2
        cy_ = (y1 + y2) // 2
        draw.line([(x1, y1), (x2, y2)], fill=(color[0], color[1], color[2], a), width=w, joint="curve")

# Fold highlight at the center fold (the Y→N transition)
fold_x, fold_y = cx, cy + 30
for r in [60, 45, 30]:
    alpha = int(25 * (1 - r / 60))
    draw.ellipse([fold_x - r, fold_y - r, fold_x + r, fold_y + r],
                 fill=(191, 219, 254, alpha))

# === Geometric frame - thin square border ===
margin = 70
for w, a in [(3, 25), (1, 60)]:
    draw.rectangle([margin, margin, SIZE - margin, SIZE - margin],
                   outline=(96, 165, 250, a), width=w)

# Corner accents
corner_len = 50
for dx, dy, flipx, flipy in [(1, 1, 1, 1), (1, -1, 1, -1), (-1, 1, -1, 1), (-1, -1, -1, -1)]:
    base_x = margin * dx if dx > 0 else SIZE - margin
    base_y = margin * dy if dy > 0 else SIZE - margin
    lx = base_x + corner_len * flipx * dx
    ly = base_y + corner_len * flipy * dy
    # Horizontal corner line
    draw.line([(base_x, base_y), (lx, base_y)], fill=(59, 130, 246, 80), width=2)
    # Vertical corner line
    draw.line([(base_x, base_y), (base_x, ly)], fill=(59, 130, 246, 80), width=2)
    # Small accent dot at corner
    draw.ellipse([base_x - 3, base_y - 3, base_x + 3, base_y + 3], fill=(147, 197, 253, 120))

# === Thought spark - small accent above the ribbon ===
spark_x, spark_y = cx + 160, cy - 260
layers = [
    (40, (59, 130, 246, 20)),
    (20, (96, 165, 250, 35)),
    (10, (147, 197, 253, 60)),
    (5,  (191, 219, 254, 100)),
    (2,  (239, 246, 255, 150)),
]
for r, color in layers:
    draw.ellipse([spark_x - r, spark_y - r, spark_x + r, spark_y + r], fill=color)

# Tiny trailing dots
for i, (ox, oy, r, a) in enumerate([
    (-25, 10, 3, 80), (-45, 25, 2, 50), (-60, 45, 1.5, 30)
]):
    draw.ellipse([spark_x + ox - r, spark_y + oy - r, spark_x + ox + r, spark_y + oy + r],
                 fill=(147, 197, 253, a))

# === Subtle geometric grid in background ===
grid_alpha = 10
for g in range(0, SIZE + 1, 64):
    draw.line([(g, 0), (g, SIZE)], fill=(59, 130, 246, grid_alpha), width=1)
    draw.line([(0, g), (SIZE, g)], fill=(59, 130, 246, grid_alpha), width=1)

img = img.filter(ImageFilter.GaussianBlur(radius=0.3))
img = img.crop(img.getbbox())

# Save all sizes
out = os.path.join(OUT_DIR, "1024x1024.png")
img.save(out, "PNG")
print("Saved 1024x1024.png")

sizes = {"32x32.png": 32, "128x128.png": 128, "128x128@2x.png": 256}
for name, s in sizes.items():
    img.resize((s, s), Image.LANCZOS).save(os.path.join(OUT_DIR, name), "PNG")
    print(f"Saved {name}")

# .ico
imgs_ico = []
for s in [16, 32, 48, 64, 128, 256]:
    imgs_ico.append(Image.open(os.path.join(OUT_DIR, "128x128@2x.png")).resize((s, s), Image.LANCZOS))
imgs_ico[0].save(os.path.join(OUT_DIR, "icon.ico"), format="ICO",
             sizes=[(s, s) for s in [16, 32, 48, 64, 128, 256]], append_images=imgs_ico[1:])
print("Saved icon.ico")

# Tray icon - simplified
tray = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
td = ImageDraw.Draw(tray)
td.ellipse([1, 1, 30, 30], fill=(10, 14, 38, 240))
td.ellipse([3, 3, 29, 29], outline=(30, 58, 95, 180), width=1)
tray_pts = [(16, 6), (10, 14), (14, 18), (8, 26), (16, 22), (22, 26), (22, 18), (16, 14)]
for i in range(len(tray_pts) - 1):
    td.line([tray_pts[i], tray_pts[i + 1]], fill=(96, 165, 250, 200), width=2)
td.ellipse([14, 2, 18, 6], fill=(147, 197, 253, 180))
tray.save(os.path.join(OUT_DIR, "tray-icon.png"), "PNG")
print("Saved tray-icon.png")

print("Done!")
