import { AgeCalculator } from "@/components/AgeCalculator";
import generatedImage from '@assets/generated_images/soft_abstract_gradient_background_with_floating_geometric_shapes.png';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
       {/* Background Image Layer */}
       <div 
        className="absolute inset-0 z-[-1] opacity-40"
        style={{
          backgroundImage: `url(${generatedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content */}
      <main className="w-full max-w-4xl z-10 flex flex-col items-center gap-8">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-slate-900 drop-shadow-sm">
            Age Chronos
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto font-light">
            Discover your precise journey around the sun.
          </p>
        </div>
        
        <AgeCalculator />
        
        <footer className="mt-12 text-sm text-slate-400 font-medium">
          Designed with precision & care.
        </footer>
      </main>
    </div>
  );
}
