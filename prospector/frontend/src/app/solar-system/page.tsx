export default function SolarSystemPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 md:px-8 py-6">
        <h1 className="text-3xl font-black gradient-text mb-1">Solar System Explorer</h1>
        <p className="text-asteroid-400 text-sm">
          Interactive 3D visualization of asteroid orbits and mining targets
        </p>
      </div>
      <div className="flex-1 relative">
        {/* The 3D canvas will be mounted here via client component */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card p-8 text-center max-w-md">
            <div className="text-5xl mb-4">🪐</div>
            <h2 className="text-xl font-bold mb-2">3D Visualization</h2>
            <p className="text-asteroid-400 text-sm">
              The interactive 3D solar system explorer with Three.js will render here.
              This requires the full Three.js component setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Solar System — PROSPECTOR",
  description: "Interactive 3D visualization of Near-Earth Asteroid orbits",
};
