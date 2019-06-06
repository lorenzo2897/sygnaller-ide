from pynq.overlays.base import BaseOverlay
from pynq.lib.video import PIXEL_RGBA

overlay = BaseOverlay('overlay.bit')

dma = overlay.sygnaller_dma_0
filter_block = overlay.filter3x3_0

hdmi_in = overlay.video.hdmi_in
hdmi_out = overlay.video.hdmi_out

hdmi_in.configure(PIXEL_RGBA)
hdmi_out.configure(hdmi_in.mode, PIXEL_RGBA)

with hdmi_in.start(), hdmi_out.start():
    while overlay.buttons[0].read() == 0:
        filter_block.write(0x04, 0)
        in_frame = hdmi_in.readframe()
        out_frame = hdmi_out.newframe()
        dma.write(0x10, in_frame.physical_address)
        dma.write(0x18, out_frame.physical_address)
        dma.write(0x20, 1280)
        dma.write(0x28, 720)
        dma.write(0x30, 3*1280)
        dma.write(0x00, 0x01)  # ap_start
        while (dma.read(0) & 0x4) == 0:  # ap_ready
            pass
        hdmi_out.writeframe(out_frame)
