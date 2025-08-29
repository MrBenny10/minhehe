import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Play, Share, Coffee } from 'lucide-react';

// Extend Window interface for BMC widget
declare global {
  interface Window {
    bmcWidget?: any;
  }
}

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  completionTime: number;
  onNewGame: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  completionTime,
  onNewGame
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = (time: number) => {
    if (time < 60) return "Lightning fast! ⚡";
    if (time < 120) return "Excellent time! 🌟";
    if (time < 180) return "Great job! 👏";
    return "Well done! 🎉";
  };

  const handleWhatsAppShare = () => {
    const currentUrl = window.location.href;
    const shareText = `🧩 I just completed the minHehe crossword in ${formatTime(completionTime)}! 
    
${getPerformanceMessage(completionTime)}

Can you beat my time? Try it yourself:
${currentUrl}

#minHehe #Crossword #PuzzleChallenge`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBuyMeCoffee = () => {
    // Load and show the Buy Me a Coffee widget
    const existingScript = document.querySelector('[data-name="BMC-Widget"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.setAttribute('data-name', 'BMC-Widget');
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
    script.setAttribute('data-id', 'BennySE');
    script.setAttribute('data-description', 'Support me on Buy me a coffee!');
    script.setAttribute('data-message', 'Hope you enjoyed this! Every day I\'ll make a new crossword');
    script.setAttribute('data-color', '#BD5FFF');
    script.setAttribute('data-position', 'Right');
    script.setAttribute('data-x_margin', '18');
    script.setAttribute('data-y_margin', '18');
    script.setAttribute('data-amount', '10');
    
    script.onload = () => {
      // Widget should appear automatically after loading
      setTimeout(() => {
        // Try to trigger the widget if it doesn't auto-show
        if (window.bmcWidget && typeof window.bmcWidget.show === 'function') {
          window.bmcWidget.show();
        }
      }, 500);
    };
    
    document.body.appendChild(script);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-primary" />
            Puzzle Complete!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6 space-y-6">
          <div className="space-y-2">
            <p className="text-lg text-foreground">
              {getPerformanceMessage(completionTime)}
            </p>
            <p className="text-muted-foreground">
              You conquered this minHehe puzzle!
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Your Time</span>
            </div>
            <div className="text-4xl font-mono font-bold text-primary">
              {formatTime(completionTime)}
            </div>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <div className="flex flex-col gap-2 w-full">
              <Button 
                onClick={handleWhatsAppShare}
                variant="secondary"
                className="flex items-center gap-2"
                size="lg"
              >
                <Share className="w-4 h-4" />
                Share on WhatsApp
              </Button>
              
              <Button 
                onClick={handleBuyMeCoffee}
                variant="outline"
                className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                size="lg"
              >
                <Coffee className="w-4 h-4" />
                Buy Me a Coffee ☕
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={onNewGame}
                className="flex items-center gap-2"
                size="lg"
              >
                <Play className="w-4 h-4" />
                New Game
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                size="lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};