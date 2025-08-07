// Google Meet Beauty Filter Content Script
(function() {
  'use strict';

  // Filter settings
  let currentBrightness = 1.2;
  let currentSaturation = 1.1;
  let currentContrast = 1.05;
  let currentWhitening = 1.0;
  let beautyModeEnabled = true;
  
  // New Zoom-like features
  let lowLightAdjustment = 0.0; // -1.0 to 1.0
  let appearanceCorrection = 0.5; // 0.0 to 1.0
  let autoLowLightEnabled = true;
  let skinSmoothingEnabled = true;
  
  // Manual adjustment tracking
  let isManualLowLightAdjustment = false;
  let lastManualAdjustmentTime = 0;
  
  // UI elements
  let filterContainer = null;
  let iconButton = null;
  let brightnessSlider = null;
  let saturationSlider = null;
  let contrastSlider = null;
  let whiteningSlider = null;
  let beautyToggle = null;
  let isUIVisible = true;
  
  // New UI elements for Zoom-like features
  let lowLightSlider = null;
  let appearanceCorrectionSlider = null;
  let autoLowLightToggle = null;
  let skinSmoothingToggle = null;
  
  // Canvas for advanced image processing
  let processingCanvas = null;
  let processingContext = null;

  // Debounce function for performance optimization
  let saveTimeout = null;
  
  // Initialization flag to prevent multiple initializations
  let isInitialized = false;
  function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveSettings, 300);
  }

  // Settings storage functions
  function saveSettings() {
    const settings = {
      brightness: currentBrightness,
      saturation: currentSaturation,
      contrast: currentContrast,
      whitening: currentWhitening,
      beautyMode: beautyModeEnabled,
      uiVisible: isUIVisible,
      lowLightAdjustment: lowLightAdjustment,
      appearanceCorrection: appearanceCorrection,
      autoLowLightEnabled: autoLowLightEnabled,
      skinSmoothingEnabled: skinSmoothingEnabled,
      isManualLowLightAdjustment: isManualLowLightAdjustment,
      lastManualAdjustmentTime: lastManualAdjustmentTime
    };
    chrome.storage.local.set({ beautyFilterSettings: settings });
  }

  function loadSettings() {
    chrome.storage.local.get(['beautyFilterSettings'], (result) => {
      if (result.beautyFilterSettings) {
        const settings = result.beautyFilterSettings;
        currentBrightness = settings.brightness || 1.2;
        currentSaturation = settings.saturation || 1.1;
        currentContrast = settings.contrast || 1.05;
        currentWhitening = settings.whitening || 1.0;
        beautyModeEnabled = settings.beautyMode !== undefined ? settings.beautyMode : true;
        isUIVisible = settings.uiVisible !== undefined ? settings.uiVisible : true;
        
        // Load new Zoom-like settings
        lowLightAdjustment = settings.lowLightAdjustment || 0.0;
        appearanceCorrection = settings.appearanceCorrection || 0.5;
        autoLowLightEnabled = settings.autoLowLightEnabled !== undefined ? settings.autoLowLightEnabled : true;
        skinSmoothingEnabled = settings.skinSmoothingEnabled !== undefined ? settings.skinSmoothingEnabled : true;
        
        // Load manual adjustment tracking
        isManualLowLightAdjustment = settings.isManualLowLightAdjustment || false;
        lastManualAdjustmentTime = settings.lastManualAdjustmentTime || 0;
        
        // Update UI if it exists
        setTimeout(() => {
          updateUIFromSettings();
          applyFiltersToAllVideos();
        }, 100);
      } else {
        // Apply default settings immediately
        lowLightAdjustment = 0.0;
        appearanceCorrection = 0.5;
        autoLowLightEnabled = true;
        skinSmoothingEnabled = true;
        isManualLowLightAdjustment = false;
        lastManualAdjustmentTime = 0;
        setTimeout(() => {
          updateUIFromSettings();
          applyFiltersToAllVideos();
        }, 100);
      }
    });
  }

  function updateUIFromSettings() {
    if (brightnessSlider) {
      brightnessSlider.value = currentBrightness;
      brightnessSlider.parentNode.querySelector('.filter-value').textContent = `${Math.round(currentBrightness * 100)}%`;
    }
    if (saturationSlider) {
      saturationSlider.value = currentSaturation;
      saturationSlider.parentNode.querySelector('.filter-value').textContent = `${Math.round(currentSaturation * 100)}%`;
    }
    if (contrastSlider) {
      contrastSlider.value = currentContrast;
      contrastSlider.parentNode.querySelector('.filter-value').textContent = `${Math.round(currentContrast * 100)}%`;
    }
    if (whiteningSlider) {
      whiteningSlider.value = currentWhitening;
      whiteningSlider.parentNode.querySelector('.filter-value').textContent = `${Math.round(currentWhitening * 100)}%`;
    }
    if (beautyToggle) {
      beautyToggle.checked = beautyModeEnabled;
    }
    
    // Update new Zoom-like UI elements
    if (lowLightSlider) {
      lowLightSlider.value = lowLightAdjustment;
      const displayValue = lowLightAdjustment >= 0 ? `+${Math.round(lowLightAdjustment * 100)}` : `${Math.round(lowLightAdjustment * 100)}`;
      lowLightSlider.parentNode.querySelector('.filter-value').textContent = displayValue;
    }
    if (appearanceCorrectionSlider) {
      appearanceCorrectionSlider.value = appearanceCorrection;
      appearanceCorrectionSlider.parentNode.querySelector('.filter-value').textContent = `${Math.round(appearanceCorrection * 100)}%`;
    }
    if (autoLowLightToggle) {
      autoLowLightToggle.checked = autoLowLightEnabled;
    }
    if (skinSmoothingToggle) {
      skinSmoothingToggle.checked = skinSmoothingEnabled;
    }
  }

  // Toggle UI visibility
  function toggleUIVisibility() {
    console.log('Toggle UI visibility called, current state:', isUIVisible);
    isUIVisible = !isUIVisible;
    console.log('New UI visibility state:', isUIVisible);
    updateUIVisibility();
    saveSettings();
  }

  // Update UI visibility based on current state
  function updateUIVisibility() {
    console.log('Updating UI visibility, isUIVisible:', isUIVisible);
    console.log('Filter container exists:', !!filterContainer);
    console.log('Icon button exists:', !!iconButton);
    
    if (filterContainer) {
      if (isUIVisible) {
        filterContainer.classList.remove('hidden');
        console.log('Removed hidden class from filter container');
      } else {
        filterContainer.classList.add('hidden');
        console.log('Added hidden class to filter container');
      }
    } else {
      console.warn('Filter container not found!');
    }
    
    if (iconButton) {
      if (isUIVisible) {
        iconButton.classList.add('panel-visible');
      } else {
        iconButton.classList.remove('panel-visible');
      }
    } else {
      console.warn('Icon button not found!');
    }
  }

  // Create floating icon button
  function createIconButton() {
    if (iconButton) {
      console.log('Icon button already exists');
      return;
    }
    
    console.log('Creating icon button...');
    iconButton = document.createElement('div');
    iconButton.className = 'beauty-filter-icon';
    iconButton.innerHTML = '✨';
    iconButton.title = '美肌フィルター設定';
    iconButton.addEventListener('click', toggleUIVisibility);
    
    document.body.appendChild(iconButton);
    console.log('Icon button created and added to DOM');
  }

  // Create and inject the beauty filter control UI
  function createBeautyFilterControl() {
    if (filterContainer) {
      console.log('Filter container already exists');
      return;
    }
    
    console.log('Creating beauty filter control...');
    filterContainer = document.createElement('div');
    filterContainer.className = 'beauty-filter-container';
    
    // Beauty mode toggle
    const beautyToggleContainer = document.createElement('div');
    beautyToggleContainer.className = 'beauty-toggle';
    
    beautyToggle = document.createElement('input');
    beautyToggle.type = 'checkbox';
    beautyToggle.id = 'beauty-mode-toggle';
    beautyToggle.checked = beautyModeEnabled;
    beautyToggle.addEventListener('change', handleBeautyToggle);
    
    const beautyLabel = document.createElement('label');
    beautyLabel.htmlFor = 'beauty-mode-toggle';
    beautyLabel.textContent = '美肌モード';
    
    beautyToggleContainer.appendChild(beautyToggle);
    beautyToggleContainer.appendChild(beautyLabel);
    filterContainer.appendChild(beautyToggleContainer);
    
    // Auto low-light toggle
    const autoLowLightContainer = document.createElement('div');
    autoLowLightContainer.className = 'beauty-toggle';
    
    autoLowLightToggle = document.createElement('input');
    autoLowLightToggle.type = 'checkbox';
    autoLowLightToggle.id = 'auto-lowlight-toggle';
    autoLowLightToggle.checked = autoLowLightEnabled;
    autoLowLightToggle.addEventListener('change', handleAutoLowLightToggle);
    
    const autoLowLightLabel = document.createElement('label');
    autoLowLightLabel.htmlFor = 'auto-lowlight-toggle';
    autoLowLightLabel.textContent = '自動低照度調整';
    
    autoLowLightContainer.appendChild(autoLowLightToggle);
    autoLowLightContainer.appendChild(autoLowLightLabel);
    filterContainer.appendChild(autoLowLightContainer);
    
    // Skin smoothing toggle
    const skinSmoothingContainer = document.createElement('div');
    skinSmoothingContainer.className = 'beauty-toggle';
    
    skinSmoothingToggle = document.createElement('input');
    skinSmoothingToggle.type = 'checkbox';
    skinSmoothingToggle.id = 'skin-smoothing-toggle';
    skinSmoothingToggle.checked = skinSmoothingEnabled;
    skinSmoothingToggle.addEventListener('change', handleSkinSmoothingToggle);
    
    const skinSmoothingLabel = document.createElement('label');
    skinSmoothingLabel.htmlFor = 'skin-smoothing-toggle';
    skinSmoothingLabel.textContent = '肌質補正';
    
    skinSmoothingContainer.appendChild(skinSmoothingToggle);
    skinSmoothingContainer.appendChild(skinSmoothingLabel);
    filterContainer.appendChild(skinSmoothingContainer);
    
    // Create sliders
    const brightnessControl = createSliderControl('明るさ', currentBrightness, 0.5, 2.0, 0.1, handleBrightnessChange, (val) => `${Math.round(val * 100)}%`);
    brightnessSlider = brightnessControl.slider;
    
    const saturationControl = createSliderControl('彩度', currentSaturation, 0.5, 2.0, 0.1, handleSaturationChange, (val) => `${Math.round(val * 100)}%`);
    saturationSlider = saturationControl.slider;
    
    const contrastControl = createSliderControl('コントラスト', currentContrast, 0.5, 2.0, 0.05, handleContrastChange, (val) => `${Math.round(val * 100)}%`);
    contrastSlider = contrastControl.slider;
    
    const whiteningControl = createSliderControl('美白', currentWhitening, 0.8, 1.5, 0.1, handleWhiteningChange, (val) => `${Math.round(val * 100)}%`);
    whiteningSlider = whiteningControl.slider;
    
    // New Zoom-like sliders
    const lowLightControl = createSliderControl('低照度補正', lowLightAdjustment, -1.0, 1.0, 0.1, handleLowLightChange, (val) => val >= 0 ? `+${Math.round(val * 100)}` : `${Math.round(val * 100)}`);
    lowLightSlider = lowLightControl.slider;
    
    const appearanceCorrectionControl = createSliderControl('外見補正', appearanceCorrection, 0.0, 1.0, 0.1, handleAppearanceCorrectionChange, (val) => `${Math.round(val * 100)}%`);
    appearanceCorrectionSlider = appearanceCorrectionControl.slider;
    
    filterContainer.appendChild(brightnessControl.container);
    filterContainer.appendChild(saturationControl.container);
    filterContainer.appendChild(contrastControl.container);
    filterContainer.appendChild(whiteningControl.container);
    filterContainer.appendChild(lowLightControl.container);
    filterContainer.appendChild(appearanceCorrectionControl.container);
    
    // Ensure the container is visible by default
    filterContainer.style.display = 'block';
    filterContainer.style.visibility = 'visible';
    filterContainer.style.opacity = '1';
    filterContainer.style.pointerEvents = 'auto';
    
    document.body.appendChild(filterContainer);
    console.log('Beauty filter control created and added to DOM');
    console.log('Filter container visibility:', filterContainer.style.display);
    console.log('Filter container classes:', filterContainer.className);
    
    // Initial visibility will be set by loadSettings, no need for forced update
  }
  
  // Helper function to create slider controls
  function createSliderControl(labelText, initialValue, min, max, step, changeHandler, valueFormatter) {
    const container = document.createElement('div');
    container.className = 'filter-control';
    
    const label = document.createElement('label');
    label.className = 'filter-label';
    label.textContent = labelText;
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'filter-slider';
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = initialValue.toString();
    
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'filter-value';
    valueDisplay.textContent = valueFormatter(initialValue);
    
    slider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      valueDisplay.textContent = valueFormatter(value);
      changeHandler(e);
    });
    
    container.appendChild(label);
    container.appendChild(slider);
    container.appendChild(valueDisplay);
    
    return { container, slider, valueDisplay };
  }

  // Handle beauty mode toggle
  function handleBeautyToggle(event) {
    beautyModeEnabled = event.target.checked;
    applyFiltersToAllVideos();
    saveSettings(); // Immediate save for toggle
  }

  // Handle brightness slider changes
  function handleBrightnessChange(event) {
    currentBrightness = parseFloat(event.target.value);
    applyFiltersToAllVideos();
    debouncedSave();
  }
  
  // Handle saturation slider changes
  function handleSaturationChange(event) {
    currentSaturation = parseFloat(event.target.value);
    applyFiltersToAllVideos();
    debouncedSave();
  }
  
  // Handle contrast slider changes
  function handleContrastChange(event) {
    currentContrast = parseFloat(event.target.value);
    applyFiltersToAllVideos();
    debouncedSave();
  }
  
  // Handle whitening slider changes
  function handleWhiteningChange(event) {
    currentWhitening = parseFloat(event.target.value);
    applyFiltersToAllVideos();
    debouncedSave();
  }
  
  // Handle auto low-light toggle
  function handleAutoLowLightToggle(event) {
    autoLowLightEnabled = event.target.checked;
    
    if (autoLowLightEnabled) {
      // Reset manual adjustment tracking when auto mode is enabled
      isManualLowLightAdjustment = false;
      lastManualAdjustmentTime = 0;
      console.log('Auto low-light enabled, resetting manual adjustment tracking');
      detectAndAdjustLowLight();
    } else {
      console.log('Auto low-light disabled');
    }
    
    applyFiltersToAllVideos();
    debouncedSave();
  }
  
  // Handle skin smoothing toggle
  function handleSkinSmoothingToggle(event) {
    skinSmoothingEnabled = event.target.checked;
    applyFiltersToAllVideos();
    debouncedSave();
  }
  
  // Handle low-light adjustment slider changes
  function handleLowLightChange(event) {
    lowLightAdjustment = parseFloat(event.target.value);
    
    // Mark as manual adjustment and record timestamp
    isManualLowLightAdjustment = true;
    lastManualAdjustmentTime = Date.now();
    
    console.log('Manual low-light adjustment:', lowLightAdjustment);
    applyFiltersToAllVideos();
    debouncedSave();
  }
  
  // Handle appearance correction slider changes
  function handleAppearanceCorrectionChange(event) {
    appearanceCorrection = parseFloat(event.target.value);
    applyFiltersToAllVideos();
    debouncedSave();
  }
  
  // Detect and adjust for low-light conditions
  function detectAndAdjustLowLight() {
    // Skip auto adjustment if manual adjustment was made recently (within 30 seconds)
    const timeSinceManualAdjustment = Date.now() - lastManualAdjustmentTime;
    if (isManualLowLightAdjustment && timeSinceManualAdjustment < 30000) {
      console.log('Skipping auto low-light adjustment due to recent manual adjustment');
      return;
    }
    
    // Reset manual adjustment flag after 30 seconds
    if (timeSinceManualAdjustment >= 30000) {
      isManualLowLightAdjustment = false;
    }
    
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) return;
    
    // Use the first video to analyze lighting conditions
    const video = videos[0];
    if (!video.videoWidth || !video.videoHeight) return;
    
    try {
      // Create a temporary canvas to analyze video brightness
      if (!processingCanvas) {
        processingCanvas = document.createElement('canvas');
        processingContext = processingCanvas.getContext('2d');
      }
      
      processingCanvas.width = Math.min(video.videoWidth, 160);
      processingCanvas.height = Math.min(video.videoHeight, 120);
      
      // Draw current video frame to canvas
      processingContext.drawImage(video, 0, 0, processingCanvas.width, processingCanvas.height);
      
      // Get image data and calculate average brightness with error handling
      let totalBrightness = 0;
      let pixelCount = 0;
      
      try {
        const imageData = processingContext.getImageData(0, 0, processingCanvas.width, processingCanvas.height);
        const data = imageData.data;
        pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          // Calculate luminance using standard formula
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          totalBrightness += brightness;
        }
      } catch (error) {
        // Fallback: Use canvas average color estimation
        console.log('CORS error detected, using fallback brightness detection');
        
        // Create a smaller sampling canvas to avoid CORS issues
        const sampleCanvas = document.createElement('canvas');
        const sampleContext = sampleCanvas.getContext('2d');
        sampleCanvas.width = 1;
        sampleCanvas.height = 1;
        
        try {
          // Draw scaled down version
          sampleContext.drawImage(video, 0, 0, 1, 1);
          const sampleData = sampleContext.getImageData(0, 0, 1, 1);
          const pixel = sampleData.data;
          totalBrightness = (0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]) / 255;
          pixelCount = 1;
        } catch (fallbackError) {
          // If all methods fail, estimate based on video element properties
          console.log('All brightness detection methods failed, using default estimation');
          totalBrightness = 0.5; // Default medium brightness
          pixelCount = 1;
        }
      }
      
      const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0.5;
      
      // Adjust low-light compensation based on detected brightness
      if (avgBrightness < 0.3) {
        // Very dark - strong compensation
        lowLightAdjustment = Math.min(0.8, 0.8 - avgBrightness);
      } else if (avgBrightness < 0.5) {
        // Moderately dark - medium compensation
        lowLightAdjustment = Math.min(0.4, 0.5 - avgBrightness);
      } else {
        // Well lit - minimal or no compensation
        lowLightAdjustment = Math.max(-0.2, 0.1 - avgBrightness * 0.2);
      }
      
      // Update UI if slider exists
      if (lowLightSlider) {
        lowLightSlider.value = lowLightAdjustment;
        const displayValue = lowLightAdjustment >= 0 ? `+${Math.round(lowLightAdjustment * 100)}` : `${Math.round(lowLightAdjustment * 100)}`;
        lowLightSlider.parentNode.querySelector('.filter-value').textContent = displayValue;
      }
      
    } catch (error) {
      console.warn('Low-light detection error:', error);
    }
  }

  // Apply beauty filters to a single video element
  function applyFiltersToVideo(video) {
    if (!video || !video.style) return;
    
    try {
      // Calculate effective brightness with low-light adjustment
      const effectiveBrightness = autoLowLightEnabled 
        ? Math.max(0.3, Math.min(3.0, currentBrightness + lowLightAdjustment))
        : currentBrightness;
      
      if (beautyModeEnabled) {
        // Base filters for beauty effect
        const filters = [
          `brightness(${effectiveBrightness.toFixed(2)})`,
          `saturate(${currentSaturation.toFixed(2)})`,
          `contrast(${currentContrast.toFixed(2)})`,
          `hue-rotate(${((currentWhitening - 1) * 15).toFixed(1)}deg)`,
          `sepia(${Math.max(0, (currentWhitening - 1) * 0.2).toFixed(2)})`
        ];
        
        // Add appearance correction filters (Zoom-like skin smoothing)
        if (skinSmoothingEnabled && appearanceCorrection > 0) {
          // Blur for skin smoothing effect
          const blurAmount = (appearanceCorrection * 0.8).toFixed(1);
          filters.push(`blur(${blurAmount}px)`);
          
          // Reduce sharpness for softer appearance
          const softenContrast = Math.max(0.8, currentContrast - (appearanceCorrection * 0.2));
          filters[2] = `contrast(${softenContrast.toFixed(2)})`;
          
          // Slight warm tone for healthier skin appearance
          const warmHue = ((currentWhitening - 1) * 15) + (appearanceCorrection * 5);
          filters[3] = `hue-rotate(${warmHue.toFixed(1)}deg)`;
        }
        
        video.style.filter = filters.join(' ');
        video.style.webkitFilter = filters.join(' ');
        video.style.imageRendering = 'optimizeQuality';
        
        // Apply additional whitening effect
        const opacityValue = currentWhitening > 1.0 
          ? Math.min(1.0, 0.85 + (currentWhitening - 1.0) * 0.15).toFixed(2)
          : '1.0';
        video.style.opacity = opacityValue;
        
        // Add subtle glow effect for appearance correction
        if (skinSmoothingEnabled && appearanceCorrection > 0.3) {
          const glowIntensity = (appearanceCorrection - 0.3) * 10;
          video.style.boxShadow = `inset 0 0 ${glowIntensity}px rgba(255, 220, 200, 0.1)`;
        } else {
          video.style.boxShadow = 'none';
        }
        
      } else {
        // Only apply brightness and low-light adjustment when beauty mode is off
        const brightnessFilter = `brightness(${effectiveBrightness.toFixed(2)})`;
        video.style.filter = brightnessFilter;
        video.style.webkitFilter = brightnessFilter;
        video.style.imageRendering = 'auto';
        video.style.opacity = '1.0';
        video.style.boxShadow = 'none';
      }
    } catch (error) {
      console.warn('Beauty filter application error:', error);
    }
  }

  // Apply beauty filters to all video elements
  function applyFiltersToAllVideos() {
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) return;
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      videos.forEach(applyFiltersToVideo);
    });
  }

  // Observer callback for DOM mutations
  function handleMutations(mutations) {
    let shouldApplyBrightness = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a video element
            if (node.tagName === 'VIDEO') {
              shouldApplyBrightness = true;
            }
            // Check if the added node contains video elements
            else if (node.querySelectorAll) {
              const videos = node.querySelectorAll('video');
              if (videos.length > 0) {
                shouldApplyBrightness = true;
              }
            }
          }
        });
      }
    });
    
    if (shouldApplyBrightness) {
      // Small delay to ensure video elements are fully loaded
      setTimeout(applyFiltersToAllVideos, 100);
    }
  }

  // Initialize the extension
  function initialize() {
    console.log('Initializing Google Meet Beauty Filter extension...');
    console.log('Current URL:', window.location.href);
    console.log('Document ready state:', document.readyState);
    
    // Create the floating icon button first
    createIconButton();
    
    // Create the beauty filter control UI
    createBeautyFilterControl();
    
    // Then load saved settings and update UI
    loadSettings();
    
    // Apply filters to existing videos
    applyFiltersToAllVideos();
    
    // Set up mutation observer to watch for new video elements
    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check for videos periodically as a fallback
    setInterval(() => {
      applyFiltersToAllVideos();
    }, 2000);
    
    // Set up automatic low-light detection
    setInterval(() => {
      if (autoLowLightEnabled) {
        detectAndAdjustLowLight();
        applyFiltersToAllVideos();
      }
    }, 3000); // Check every 3 seconds
    
    console.log('Extension initialization completed');
  }

  // Wait for DOM to be ready and ensure proper initialization
  function ensureInitialization() {
    console.log('Ensuring initialization...');
    
    // Prevent multiple initializations
    if (isInitialized) {
      console.log('Already initialized, skipping...');
      return;
    }
    
    // Remove any existing elements first
    const existingIcon = document.querySelector('.beauty-filter-icon');
    const existingContainer = document.querySelector('.beauty-filter-container');
    
    if (existingIcon) {
      console.log('Removing existing icon');
      existingIcon.remove();
      iconButton = null;
    }
    
    if (existingContainer) {
      console.log('Removing existing container');
      existingContainer.remove();
      filterContainer = null;
    }
    
    // Initialize fresh
    initialize();
    isInitialized = true;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureInitialization);
  } else {
    ensureInitialization();
  }

  // Additional initialization after delays to catch late-loading elements
  setTimeout(ensureInitialization, 1000);
  setTimeout(ensureInitialization, 3000);

})();
