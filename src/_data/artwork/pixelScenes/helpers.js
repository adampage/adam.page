const globalHelpers = require('../../globalHelpers.js');

module.exports = {
  getSceneSpec(scene) {

    let sceneSpec = {
      name: scene.info.name,
      spriteSpecs: [],
      uniqueColors: [],
      colorsByToken: {},
      tokensByColor: {},
      charEmpty: '_',
      charColor: 'c',
      charAnimated: 'x'
    };

    const reTokenEmpty = new RegExp(sceneSpec.charEmpty, "g");
    const hexColorTransparent = '#FFFFFF00';
    let sceneColors = [];
    let numRects = 0;

    // Process each of the scene’s sprites in their display order.
    scene.info.orderedSprites.forEach((slugSprite, index) => {

      // Get sprite spec.
      const sprite = scene.sprites[slugSprite];
      const spriteSpec = module.exports.getSpriteSpec(sprite, slugSprite);
      sceneSpec.spriteSpecs.push(spriteSpec);

      // Collect this sprite’s unique colors and add to the scene.
      sceneColors = sceneColors.concat(spriteSpec.uniqueColors);
    });


    // Collapse all collected sprite colors into a unique set for this scene.
    sceneSpec.uniqueColors = [...new Set(sceneColors)];

    // How many digits are in the lenth of this unique list?  We’ll use that
    // to pad zeroes onto each value in the matrix for easier skimming.
    const digitsColors = sceneSpec.uniqueColors.length.toString().length;
    const tokenTransparentStatic = sceneSpec.charEmpty.repeat(digitsColors + 1);
    const tokenTransparentAnimated = sceneSpec.charEmpty.repeat(digitsColors) + sceneSpec.charAnimated;

    // Create unique color map for client-side variable production.
    sceneSpec.uniqueColors.forEach((color, index) => {
      const number = globalHelpers.padLeadingZeros(index, digitsColors);
      let token = '';

      // If the color is transparent, assign an empty color value.  The
      // client-side script will use that as a trigger to not generate an
      // unnecessary <rect> element in the DOM.
      if (color === hexColorTransparent) {
        token = tokenTransparentStatic;
        color = '';
      } else {
        token = `${sceneSpec.charColor}${number}`;
      }

      sceneSpec.colorsByToken[token] = color;
      sceneSpec.tokensByColor[color] = token;
    });

    // A pixel that begins as transparent but changes its color through
    // animation will have its own token to induce <rect> production.
    sceneSpec.colorsByToken[tokenTransparentAnimated] = hexColorTransparent;

    // Create each sprite’s rect matrices.
    sceneSpec.spriteSpecs.forEach((spriteSpec, index) => {

      const spriteIsAnimated = spriteSpec.animatedPixels.length > 0;
      const digitsColorSequences = spriteSpec.uniqueColorSequences.length.toString().length;
      const tokenStaticColoredPixel = '0'.repeat(digitsColorSequences + 1);
      const tokenStaticTransparentPixel = sceneSpec.charEmpty.repeat(digitsColorSequences + 1);

      // Create an empty data matrix for this sprite.
      rectMatrix = [];

      spriteSpec.pixelMatrix.forEach((row, y) => {

        rectMatrix.push(new Array);

        row.forEach((pixel, x) => {

          // pixelTokens must resemble one of:
          //     ___ = Transparent to start, remains transparent (avoid rect)
          //     __x = Transparent to start, but animates (needs rect)
          //     cNN = Always solid color (needs rect)

          let tokenPixel = '';

          // Start the pixel token with its initial color token.
          if (pixel.colorInitial === hexColorTransparent) {
            if (pixel.isAnimated) {
              tokenPixel = tokenTransparentAnimated;
            } else {
              tokenPixel = tokenTransparentStatic;
            }

          } else {
            tokenPixel = sceneSpec.tokensByColor[pixel.colorInitial];
          }

          // If the token is populated only with the empty character, then
          // no <rect> element will need to be generated on the client.
          if (!tokenPixel.replace(reTokenEmpty, '').length) {
            numRects++;
          }

          rectMatrix[y].push(tokenPixel);
        });

        sceneSpec.spriteSpecs[index].rectMatrix = JSON.parse(JSON.stringify(rectMatrix));
      });
    });

    console.log(`🖼 Scene spec: ${scene.info.name} — ${sceneSpec.spriteSpecs.length} sprites, ${sceneSpec.uniqueColors.length} colors.  ${numRects} <rect> elements.`);

    // Return the whole shebang.
    return sceneSpec;
  },

  getSpriteSpec(sprite, slugSprite) {

    let spriteSpec = {
      slug: slugSprite,
      name: sprite.info.name,
      uniqueColors: [],
      uniqueColorSequences: [],
      pixelMatrix: [],
      animatedPixels:{},
      classPrefix: `${slugSprite}-`
    };

    let involvedMatrices = {};
    let spriteIsAnimated = false;
    let spriteColors = [];
    let uniqueColorSequenceSlugs = [];
    const slugInitialFrame = sprite.info.initialFrame;
    const initialFrame = sprite.frames[slugInitialFrame];
    const cols = initialFrame.colorMatrix[0].length;
    const rows = initialFrame.colorMatrix.length;
    let numPixels = 0;
    let numPixelsAnimated = 0;

    // Determine whether sprite is animated at all.
    if (sprite.info.hasOwnProperty('animation')) {
      spriteIsAnimated = true;
    }

    // Determine this sprite’s unique set of involved frame color matrices.
    // With an animated sprite, it’s the set of matrices belonging to the unique
    // set of keyframes.
    // With a non-animated sprite, it’s the matrix of the initial frame.
    if (sprite.info.hasOwnProperty('animation')) {
      sprite.info.animation.keyframes.forEach((keyframeInfo, index) => {
        const slugFrame = keyframeInfo.frame;
        if (!involvedMatrices.hasOwnProperty(slugFrame)) {
          involvedMatrices[slugFrame] = sprite.frames[slugFrame].colorMatrix;
        }
      });
    } else {
      involvedMatrices[slugInitialFrame] = initialFrame.colorMatrix;
    }

    // Consider each pixel position in the sprite.
    for (let y = 0; y < rows; y++) {

      // Create a new array for this row of pixels.
      spriteSpec.pixelMatrix.push(new Array);

      for (let x = 0; x < cols; x++) {

        // First, assume the pixel never changes, in which case the first and
        // only color in its sequence is that of the initial frame.
        let pixel = {
          isAnimated: false,
          colorInitial: initialFrame.colorMatrix[y][x]
        }

        // Capture this pixel’s initial color in an array which will later
        // be collapsed into a unique set.
        spriteColors.push(pixel.colorInitial);

        // If the sprite is known to be animated, then check this pixel’s
        // color in each inolved frame.  If the color changes, the pixel is
        // an animated one.
        if (spriteIsAnimated) {
          Object.entries(involvedMatrices).forEach(([slugFrame, colorMatrix]) => {
            if (!pixel.isAnimated && pixel.colorInitial !== colorMatrix[y][x]) {
              pixel.isAnimated = true;
            }
          });

          // If the pixel is animated, capture its color sequence.
          if (pixel.isAnimated) {

            // Reset pixel’s color sequence and build it up in keyframe order.
            let colorSequenceSlug = '';
            let colorSequence = [];

            sprite.info.animation.keyframes.forEach((keyframeInfo, index) => {
              const slugFrame = keyframeInfo.frame;
              const color = sprite.frames[slugFrame].colorMatrix[y][x];
              colorSequence.push(color);
              spriteColors.push(color);
              colorSequenceSlug += color.replace('#', '');
            });

            // If this color sequence has already been encountered in this
            // sprite, assign its index to this pixel.
            let sequenceIndex = uniqueColorSequenceSlugs.indexOf(colorSequenceSlug);

            // Otherwise, register a new color sequence.
            if (sequenceIndex < 0) {
              uniqueColorSequenceSlugs.push(colorSequenceSlug);
              spriteSpec.uniqueColorSequences.push(colorSequence);
              sequenceIndex = uniqueColorSequenceSlugs.length - 1;
            }

            pixel.colorSequenceIndex = sequenceIndex;
            const pixelSlug = `${x},${y}`;
            spriteSpec.animatedPixels[pixelSlug] = sequenceIndex;
          }
        }

        // Push this pixel into the sprite spec’s matrix.
        spriteSpec.pixelMatrix[y].push(pixel);
        numPixels++;
      }
    }

    // Collapse all collected colors into a unique set for this sprite.
    spriteSpec.uniqueColors = [...new Set(spriteColors)];

    console.log(`🎦 Sprite spec: ${sprite.info.name} — ${numPixels} pixels, ${spriteSpec.uniqueColors.length} colors.  ${Object.keys(spriteSpec.animatedPixels).length} animated, ${spriteSpec.uniqueColorSequences.length} unique sequences.`);

    return spriteSpec;
  }
};
