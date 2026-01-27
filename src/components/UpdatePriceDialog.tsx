import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const priceSchema = z.object({
  currentPrice: z.number().positive('Price must be positive'),
});

type FormData = z.infer<typeof priceSchema>;

interface UpdatePriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (price: number) => void;
  stockName: string;
  currentPrice: number;
}

export function UpdatePriceDialog({
  open,
  onOpenChange,
  onSubmit,
  stockName,
  currentPrice,
}: UpdatePriceDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      currentPrice,
    },
  });

  const onFormSubmit = (data: FormData) => {
    onSubmit(data.currentPrice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Update Current Price
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the current market price for {stockName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="currentPrice">Current Price (₹)</Label>
            <Input
              id="currentPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="bg-input border-border font-mono text-lg"
              {...register('currentPrice', { valueAsNumber: true })}
            />
            {errors.currentPrice && (
              <p className="text-xs text-loss">{errors.currentPrice.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-brand text-primary-foreground hover:opacity-90"
            >
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
