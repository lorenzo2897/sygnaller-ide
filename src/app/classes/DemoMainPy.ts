
export const demoMainPy = `# Welcome to Sygnaller!

# main.py gets executed on the Pynq board when you click the Run button in the main toolbar.



# Display text output using print()

print("Hello, terminal!")



# Read and write files from the data directory

from PIL import Image
img = Image.new('RGB', (40,40), (255, 127, 0))
img.save("orange_square.png", "PNG")



# Display images using imageFromFile() and imageFromDataURI()

from sygnaller import terminal
terminal.imageFromFile("orange_square.png")



# Build and display matplotlib graphs with terminal.showFigure()

import matplotlib.pyplot as plt
import numpy as np
plt.scatter([.5],[.5], c='#FFCC00', s=120000)
plt.scatter([.35, .65], [.63, .63], c='k', s=1000)
X = np.linspace(.3, .7, 100)
Y = 2* (X-.5)**2 + 0.30
plt.plot(X, Y, c='k', linewidth=8)

terminal.showFigure(plt)


# Enjoy!

`;

