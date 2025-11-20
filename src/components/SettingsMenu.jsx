/**
 * SettingsMenu.jsx - Settings overlay menu
 * Glassmorphism design with dark theme
 */
export default function SettingsMenu({
  isOpen,
  onClose,
  sensitivity,
  setSensitivity,
  crosshairColor,
  setCrosshairColor,
  crosshairSize,
  setCrosshairSize,
  onResume
}) {
  if (!isOpen) return null

  // Predefined crosshair colors
  const crosshairColors = [
    { name: 'Green', value: '#00FF00' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Cyan', value: '#00FFFF' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Pink', value: '#FF00FF' }
  ]

  const handleResume = () => {
    onResume()
    onClose()
  }

  // Prevent clicks from propagating to document (which would trigger pointer lock)
  const handleContainerClick = (e) => {
    e.stopPropagation()
  }

  const handleContainerMouseDown = (e) => {
    e.stopPropagation()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleContainerClick}
      onMouseDown={handleContainerMouseDown}
    >
      <div 
        className="bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700"
        onClick={handleContainerClick}
        onMouseDown={handleContainerMouseDown}
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Settings</h2>

        {/* Sensitivity Slider with Text Input */}
        <div className="mb-6">
          <label className="block text-white text-sm font-semibold mb-2">
            Mouse Sensitivity
          </label>
          <div className="flex items-center gap-3">
            {/* Slider */}
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.001"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            {/* Text Input */}
            <input
              type="number"
              min="0.1"
              max="5.0"
              step="0.001"
              value={sensitivity}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                if (!isNaN(value) && value >= 0.1 && value <= 5.0) {
                  setSensitivity(value)
                }
              }}
              className="w-20 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none text-sm"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.1</span>
            <span>5.0</span>
          </div>
        </div>

        {/* Crosshair Color Picker */}
        <div className="mb-6">
          <label className="block text-white text-sm font-semibold mb-3">
            Crosshair Color
          </label>
          <div className="grid grid-cols-3 gap-3">
            {crosshairColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setCrosshairColor(color.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  crosshairColor === color.value
                    ? 'border-green-500 scale-105'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color.value + '20' }}
              >
                <div
                  className="w-full h-8 rounded"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-white text-xs mt-1 block">{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Crosshair Size Slider */}
        <div className="mb-6">
          <label className="block text-white text-sm font-semibold mb-2">
            Crosshair Size: {crosshairSize}px
          </label>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={crosshairSize}
            onChange={(e) => setCrosshairSize(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2px</span>
            <span>12px</span>
          </div>
        </div>

        {/* Resume Button */}
        <button
          onClick={handleResume}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
        >
          Resume Game
        </button>

        {/* Close hint */}
        <p className="text-center text-gray-400 text-xs mt-4">
          Press ESC to open menu
        </p>
      </div>
    </div>
  )
}

