import { useState } from 'react';
import { SwingExitReason } from '@/types/recommendation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface SwingExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (exitReason: SwingExitReason, exitPrice?: number) => void;
  stockName: string;
  target1: number;
  target2: number;
  stoploss: number;
}

const exitOptions: { value: SwingExitReason; label: string; requiresPrice?: boolean; isLoss?: boolean }[] = [
  { value: 'TARGET_1_HIT', label: 'Target 1 Hit' },
  { value: 'TARGET_2_HIT', label: 'Target 2 Hit' },
  { value: 'PARTIAL_PROFIT', label: 'Partial Profit Booked', requiresPrice: true },
  { value: 'PARTIAL_LOSS', label: 'Partial Loss Booked', requiresPrice: true, isLoss: true },
  { value: 'STOPLOSS_HIT', label: 'Stoploss Hit', isLoss: true },
  { value: 'NOT_EXECUTED', label: 'Not Executed' },
];

export function SwingExitDialog({
  open,
  onOpenChange,
  onSubmit,
  stockName,
  target1,
  target2,
  stoploss,
}: SwingExitDialogProps) {
  const [selectedReason, setSelectedReason] = useState<SwingExitReason>(null);
  const [exitPrice, setExitPrice] = useState('');

  const selectedOption = exitOptions.find(opt => opt.value === selectedReason);
  const requiresPrice = selectedOption?.requiresPrice;

  const handleSubmit = () => {
    if (!selectedReason) return;
    
    const price = requiresPrice ? parseFloat(exitPrice) : undefined;
    if (requiresPrice && (!price || isNaN(price))) return;
    
    onSubmit(selectedReason, price);
    setSelectedReason(null);
    setExitPrice('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedReason(null);
    setExitPrice('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Exit {stockName}</DialogTitle>
          <DialogDescription>
            Select exit reason to close this swing recommendation
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Reference prices */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-muted-foreground">T1</p>
              <p className="font-mono font-medium text-profit">₹{target1}</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-muted-foreground">T2</p>
              <p className="font-mono font-medium text-profit">₹{target2}</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-muted-foreground">SL</p>
              <p className="font-mono font-medium text-loss">₹{stoploss}</p>
            </div>
          </div>

          {/* Exit reason selection */}
          <RadioGroup
            value={selectedReason || ''}
            onValueChange={(value) => setSelectedReason(value as SwingExitReason)}
            className="space-y-2"
          >
            {exitOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer',
                  selectedReason === option.value
                    ? option.isLoss
                      ? 'border-loss bg-loss/10'
                      : 'border-profit bg-profit/10'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <RadioGroupItem value={option.value!} id={option.value!} />
                <Label
                  htmlFor={option.value!}
                  className={cn(
                    'flex-1 cursor-pointer font-medium',
                    option.isLoss ? 'text-loss' : ''
                  )}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Price input for partial exits */}
          {requiresPrice && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="exitPrice">Exit Price (₹)</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="Enter exit price"
                className="bg-input border-border"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || (requiresPrice && !exitPrice)}
            className={cn(
              selectedOption?.isLoss
                ? 'bg-loss hover:bg-loss/90'
                : 'bg-gradient-brand hover:opacity-90'
            )}
          >
            Confirm Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
