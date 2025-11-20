/**
 * GameMenu.jsx - Game Mode Selector Menu
 * Cartoony/Tactile style with Neo-Brutalism design
 */
export default function GameMenu({
  isOpen,
  onClose,
  gameMode,
  setGameMode,
  onResume
}) {
  if (!isOpen) return null

  const gameModes = [
    {
      id: 'normal',
      label: 'NORMAL',
      desc: '3 Static Targets. Standard size.'
    },
    {
      id: 'random_size',
      label: 'RANDOM SIZE',
      desc: '5 Targets. Sizes vary (Small to Large).'
    },
    {
      id: 'strafing',
      label: 'STRAFING',
      desc: '3 Targets. Moving Left & Right.'
    },
    {
      id: 'pulse',
      label: 'PULSE',
      desc: '5 Targets. They grow and shrink. Shoot before they vanish!'
    }
  ]

  const handleModeSelect = (modeId) => {
    setGameMode(modeId)
    // onClose and onResume will be called, but we need to ensure flag is set
    // This is handled in App.jsx wrapper
    onClose()
    onResume()
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
        className="bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-2xl mx-4 border-4 border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={handleContainerClick}
        onMouseDown={handleContainerMouseDown}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 md:mb-8 text-center border-b-4 border-gray-700 pb-2 sm:pb-3 md:pb-4">
          SELECT CHALLENGE
        </h2>

        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.id)}
              className={`w-full p-3 sm:p-4 md:p-6 rounded-xl border-4 transition-all duration-200 text-left ${
                gameMode === mode.id
                  ? 'bg-green-600 border-green-400 scale-105 shadow-lg'
                  : 'bg-gray-800 border-gray-600 hover:border-gray-500 hover:scale-102'
              }`}
            >
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
                {mode.label}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {mode.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Close hint */}
        <p className="text-center text-gray-400 text-xs mt-4 sm:mt-6">
          Press TAB to toggle menu
        </p>
      </div>
    </div>
  )
}

