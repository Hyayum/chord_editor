import json
import math
from PIL import Image, ImageDraw, ImageFont
import cv2

def upper(bas, deg):
	return str((int(bas) + deg - 1) % 7 + 1)

def get_xy(center, r, per):
    x, y = center
    x += r * math.sin(2 * math.pi * per)
    y -= r * math.cos(2 * math.pi * per)
    return x, y


def calc_weight(shape):
	weights = []
	for s in shape:
		pts = 0
		if s == "1":
			pts += 2
		if upper(s, 2) in shape:
			pts += 2
		if upper(s, 4) in shape:
			pts += 3
		if upper(s, 6) in shape:
			pts += 1
		weights.append(pts)
	return weights


def make_image(key, bass, shape, accd, bgcolor, color, size):
	width, height = size
	left_center = (width / 2 - 250, height / 2 + 80)
	right_center = (width / 2 + 250, height / 2 + 80)
	left_r = 160
	right_r = 100
	dot_size = 30

	image = Image.new("RGBA", (width, height), bgcolor)
	draw = ImageDraw.Draw(image)
	image_alpha = Image.new("RGBA", (width, height), "#00000000")
	draw_alpha = ImageDraw.Draw(image_alpha)

	# 0, 1, 2, ... -> C, G, D, ...
	scale = [i + key for i in [0, 2, 4, -1, 1, 3, 5]]
	for a in accd:
		if a > 0:
			scale[a - 1] += 7
		else:
			scale[abs(a) - 1] -= 7

	# 0, 1, 2, ... -> C, E, G, ...
	root = 2 * key
	bass_note = root - 3 * (bass - 1)
	notes = [root - 3 * (bass - 1 + int(s) - 1) for s in shape]
	weights = calc_weight(shape)

	for i in range(12):
		x, y = get_xy(left_center, left_r, i / 12)
		draw_alpha.circle((x, y), dot_size, fill=color+"33")

	for s in scale:
		x, y = get_xy(left_center, left_r, s / 12)
		draw.circle((x, y), dot_size, fill=color)

	x, y = get_xy(right_center, right_r, bass_note / 7)
	draw.circle((x, y), dot_size + 10, outline=color, width=5, fill=bgcolor)

	for i, n in enumerate(notes):
		x, y = get_xy(right_center, right_r, n / 7)
		draw_alpha.circle((x, y), dot_size, fill=color+f"{int(255 * (weights[i] + 4) / 12):02x}")

	image = Image.alpha_composite(image, image_alpha)
	return image


def read_data(path, filename, size):
	with open(path, "r") as fp:
		data = json.load(fp)
	bgcolor = data.get("bgcolor", "#ffffff")
	color = data.get("color", "#aaaaaa")
	default_beats = data.get("default_beats", 2)
	fps = 30
	sec_total = 0
	frame_total = 0
	key = 0
	bpm = 160

	fourcc = cv2.VideoWriter_fourcc("m", "p", "4", "v")
	video = cv2.VideoWriter(filename, fourcc, fps, size)
	temp_path = "temp/temp.png"

	for chord in data["chords"]:
		if chord.get("key", 12) != 12:
			key = chord["key"]
		if chord.get("bpm", 0) != 0:
			bpm = chord["bpm"]
		bass = chord["bass"]
		shape = chord["shape"]
		accd = chord.get("accd", [])
		image = make_image(key, bass, shape, accd, bgcolor, color, size)
		beats = chord.get("beats", default_beats)
		sec = beats * 60 / bpm
		sec_total += sec
		frame = int(sec_total * fps - frame_total)
		frame_total += frame

		image.save(temp_path)
		video_img = cv2.imread(temp_path)
		for i in range(frame):
			video.write(video_img)
	video.release()


read_data("169.json", "chord_movie.mp4", (1280, 720))