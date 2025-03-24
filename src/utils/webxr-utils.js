/**
 * WebXR utility functions for VARhub
 * Provides helper functions for WebXR features, controller interactions, and A-Frame integration
 */

/**
 * Checks if WebXR is supported in the current browser
 * @returns {boolean} Whether WebXR is supported
 */
export const isWebXRSupported = () => {
  return navigator && 
         navigator.xr && 
         navigator.xr.isSessionSupported && 
         typeof navigator.xr.isSessionSupported === 'function';
};

/**
 * Checks if immersive VR is supported
 * @returns {Promise<boolean>} Promise resolving to whether immersive-vr is supported
 */
export const isImmersiveVRSupported = async () => {
  if (!isWebXRSupported()) return false;
  
  try {
    return await navigator.xr.isSessionSupported('immersive-vr');
  } catch (err) {
    console.error('Error checking for immersive-vr support:', err);
    return false;
  }
};

/**
 * Checks if hand tracking is supported
 * @returns {Promise<boolean>} Promise resolving to whether hand tracking is supported
 */
export const isHandTrackingSupported = async () => {
  if (!await isImmersiveVRSupported()) return false;
  
  // This is a rough estimate - proper detection would require starting a session
  // with the appropriate features and checking if it's available
  return navigator.userAgent.includes('OculusQuest') || 
         navigator.userAgent.includes('Meta Quest');
};

/**
 * Controller button mappings for different devices
 * Helps normalize button events across different VR headsets
 */
export const controllerMappings = {
  'oculus-touch': {
    triggerButton: 0,
    gripButton: 1,
    thumbstickButton: 3,
    aButton: 4, // Right controller only
    bButton: 5, // Right controller only
    xButton: 4, // Left controller only
    yButton: 5, // Left controller only
  },
  'vive': {
    triggerButton: 0,
    gripButton: 1,
    menuButton: 3,
    trackpadButton: 2,
  },
  'generic': {
    triggerButton: 0,
    gripButton: 1,
  }
};

/**
 * Creates a simple interactive object for WebXR
 * @param {Object} scene - The A-Frame scene element
 * @param {Object} options - Configuration options
 * @returns {Object} The created object entity
 */
export const createInteractiveObject = (scene, options = {}) => {
  const {
    position = '0 1.5 -1',
    color = '#ffffff',
    shape = 'box',
    size = 0.5,
    animation = true,
    interactive = true
  } = options;

  if (!scene) return null;
  
  // Create entity
  const entity = document.createElement('a-entity');
  
  // Set geometry based on shape
  if (shape === 'sphere') {
    entity.setAttribute('geometry', {
      primitive: 'sphere',
      radius: size
    });
  } else if (shape === 'cylinder') {
    entity.setAttribute('geometry', {
      primitive: 'cylinder',
      radius: size,
      height: size * 2
    });
  } else {
    // Default to box
    entity.setAttribute('geometry', {
      primitive: 'box',
      width: size,
      height: size,
      depth: size
    });
  }
  
  // Set material
  entity.setAttribute('material', { color });
  
  // Set position
  entity.setAttribute('position', position);
  
  // Make it interactive
  if (interactive) {
    entity.setAttribute('data-interactive', 'true');
    
    // Add hover effect
    entity.addEventListener('mouseenter', function() {
      this.setAttribute('material', 'color', '#ffcc00');
    });
    
    entity.addEventListener('mouseleave', function() {
      this.setAttribute('material', 'color', color);
    });
  }
  
  // Add animation
  if (animation) {
    if (shape === 'sphere') {
      const yPos = position.split(' ')[1];
      entity.setAttribute('animation', {
        property: 'position',
        to: `${position.split(' ')[0]} ${parseFloat(yPos) + 0.3} ${position.split(' ')[2]}`,
        dir: 'alternate',
        dur: 2000,
        loop: true,
        easing: 'easeInOutSine'
      });
    } else {
      entity.setAttribute('animation', {
        property: 'rotation',
        to: '0 360 0',
        loop: true,
        dur: 10000,
        easing: 'linear'
      });
    }
  }
  
  // Add to scene
  scene.appendChild(entity);
  
  return entity;
};

/**
 * Creates a text panel in the scene
 * @param {Object} scene - The A-Frame scene element
 * @param {string} text - The text to display
 * @param {Object} options - Configuration options
 * @returns {Object} The created text entity
 */
export const createTextPanel = (scene, text, options = {}) => {
  const {
    position = '0 2 -2',
    width = 2,
    height = 1,
    backgroundColor = '#222',
    textColor = '#fff',
    opacity = 0.8,
    align = 'center',
    wrapCount = 30
  } = options;
  
  if (!scene || !text) return null;
  
  const panel = document.createElement('a-entity');
  panel.setAttribute('position', position);
  
  // Create backing panel
  panel.setAttribute('geometry', {
    primitive: 'plane',
    width,
    height
  });
  
  panel.setAttribute('material', {
    color: backgroundColor,
    opacity
  });
  
  // Add text
  panel.setAttribute('text', {
    value: text,
    color: textColor,
    width: width * 0.9,
    align,
    wrapCount
  });
  
  // Add to scene
  scene.appendChild(panel);
  
  return panel;
};

/**
 * Initializes controllers with custom interaction capabilities
 * @param {Object} scene - The A-Frame scene element
 * @returns {Object} Object containing the left and right controller entities
 */
export const initializeControllers = (scene) => {
  if (!scene) return { leftController: null, rightController: null };
  
  // Create left controller
  const leftController = document.createElement('a-entity');
  leftController.setAttribute('id', 'leftController');
  leftController.setAttribute('hand-controls', 'hand: left');
  leftController.setAttribute('laser-controls', 'hand: left');
  leftController.setAttribute('controller-interaction', '');
  
  // Create right controller
  const rightController = document.createElement('a-entity');
  rightController.setAttribute('id', 'rightController');
  rightController.setAttribute('hand-controls', 'hand: right');
  rightController.setAttribute('laser-controls', 'hand: right');
  rightController.setAttribute('controller-interaction', '');
  
  // Add to scene
  scene.appendChild(leftController);
  scene.appendChild(rightController);
  
  return { leftController, rightController };
};

export default {
  isWebXRSupported,
  isImmersiveVRSupported,
  isHandTrackingSupported,
  controllerMappings,
  createInteractiveObject,
  createTextPanel,
  initializeControllers
}; 