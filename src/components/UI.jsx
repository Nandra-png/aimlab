/**
 * UI.jsx - Overlay UI layer
 * Pure HTML/CSS overlay that sits above the canvas
 * Features a perfectly centered crosshair and score display
 */
/**
 * UI.jsx - Overlay UI layer
 * Pure HTML/CSS overlay that sits above the canvas
 * Features a perfectly centered crosshair and score display
 * CRITICAL: Must be transparent to not block the game view
 */
export default function UI({
  score = 0,
  crosshairColor = '#00FF00',
  crosshairSize = 4
}) {
  return (
    <div className="absolute inset-0 pointer-events-none bg-transparent z-10">
      {/* Centered crosshair - dynamic color and size */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div
          className="rounded-full"
          style={{
            width: `${crosshairSize}px`,
            height: `${crosshairSize}px`,
            backgroundColor: crosshairColor,
            boxShadow: `0 0 ${crosshairSize * 2}px ${crosshairColor}80`
          }}
        ></div>
      </div>

      {/* Control hints - bottom left */}
      <div className="absolute bottom-4 left-4 text-white text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="bg-gray-800 px-2 py-1 rounded border border-gray-600 font-mono text-xs">TAB</span>
          <span className="text-gray-300">Change Game Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-gray-800 px-2 py-1 rounded border border-gray-600 font-mono text-xs">ESC</span>
          <span className="text-gray-300">Settings</span>
        </div>
      </div>
    </div>
  )
}

