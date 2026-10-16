# make video SCRIPT=videos/<slug>/script.json   (same as ./dt render)
video:
	./dt render $(SCRIPT)
doctor:
	./dt doctor
music:
	./dt fetch-music
.PHONY: video music doctor
