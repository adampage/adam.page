const globalHelpers = require('../../globalHelpers.js');

module.exports = {
  mapUniqueSceneColors(scene, keyPrefix = 'c') {

    // Prepare an empty list to capture the scene’s unique colors.
    let dictByToken = new Object();
    let dictByColor = new Object();
    let uniqueColorsScene = [];

    // Find the unique colors of each sprite in the scene.
    Object.entries(scene.sprites).forEach(([slugSprite, sprite]) => {

      let uniqueColorsSprite = [];

      // Find the unique colors of each frame in the sprite.
      Object.entries(sprite.frames).forEach(([slugFrame, frame]) => {

        let uniqueColorsFrame = [];

        // Find the unique colors of each row of pixels in the frame.
        frame.colorMatrix.forEach(row => {
          uniqueColorsFrame = [...new Set(uniqueColorsFrame.concat(row))];
        });
        uniqueColorsSprite = [...new Set(uniqueColorsSprite.concat(uniqueColorsFrame))];
      });
      uniqueColorsScene = [...new Set(uniqueColorsScene.concat(uniqueColorsSprite))];
    });

    // How many digits are in the lenth of this unique list?  We’ll use that
    // to pad zeroes onto each value in the matrix for easier skimming.
    const digits = uniqueColorsScene.length.toString().length;
    const tokenTransparent = '_'.repeat(digits + 1);

    uniqueColorsScene.forEach((color, index) => {
      const number = globalHelpers.padLeadingZeros(index, digits);
      const token = (color === '#FFFFFF00') ? tokenTransparent : `${keyPrefix}${number}`;
      dictByToken[token] = color;
      dictByColor[color] = token;
    });

    return [ dictByToken, dictByColor ];
  },

  getSpriteMatrices(sprite) {

    // Get each sprite in scene


      // Get each frame in sprite

      // Determine which pixels:
      // - Are always transparent
         // These will be `_` (padded to )
      // - Are always solid-colored
         // These will be `s`
      // - Change color

    return null;
  }
};
