# make video SCRIPT=videos/<slug>/script.json   (same as ./dt render)
video:
	./dt render $(SCRIPT)
setup:
	./dt setup
doctor:
	./dt doctor
music:
	./dt fetch-music
.PHONY: video music doctor setup
