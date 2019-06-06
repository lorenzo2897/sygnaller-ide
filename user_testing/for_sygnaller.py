from sygnaller import hw

print("Start")

with hw.video.start():
    while hw.buttons[0].read() == 0:
        hw.filter3x3.mode = 0
        hw.video.process_frame(latency=3*1280)

print("Done")
