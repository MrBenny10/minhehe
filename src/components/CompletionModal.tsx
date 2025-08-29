import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Play, Share, Download } from 'lucide-react';

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

  const generateCompletionImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('minHehe Completed!', 300, 80);
    
    // Time
    ctx.font = 'bold 48px monospace';
    ctx.fillText(formatTime(completionTime), 300, 160);
    
    // Performance message
    ctx.font = '24px Arial';
    ctx.fillText(getPerformanceMessage(completionTime), 300, 220);
    
    // URL
    ctx.font = '18px Arial';
    ctx.fillStyle = '#e0e7ff';
    ctx.fillText(window.location.href, 300, 320);
    
    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `minHehe-completion-${formatTime(completionTime)}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleWhatsAppShare = () => {
    const currentUrl = window.location.href;
    const shareText = `I completed the minHehe in ${formatTime(completionTime)}! What can you do? 🧩⏱️\n\n${currentUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
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
            <div className="flex gap-3">
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
                onClick={generateCompletionImage}
                variant="outline"
                className="flex items-center gap-2"
                size="lg"
              >
                <Download className="w-4 h-4" />
                Save Image
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