import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image as ImageIcon, X } from 'lucide-react';
import { SwingRecommendation } from '@/types/recommendation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const swingSchema = z.object({
  stockName: z.string().min(1, 'Stock name is required').max(50),
  currentPrice: z.number().positive('Current price must be positive'),
  recommendedPrice: z.number().positive('Recommended price must be positive'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  target1: z.number().positive('Target 1 must be positive'),
  target2: z.number().positive('Target 2 must be positive'),
  stoploss: z.number().positive('Stoploss must be positive'),
  allocation: z.string().min(1, 'Allocation is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof swingSchema>;

interface SwingRecommendationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<SwingRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: SwingRecommendation;
  mode?: 'add' | 'edit';
}

export function SwingRecommendationForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = 'add',
}: SwingRecommendationFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(swingSchema),
    defaultValues: initialData
      ? {
          stockName: initialData.stockName,
          currentPrice: initialData.currentPrice,
          recommendedPrice: initialData.recommendedPrice,
          imageUrl: initialData.imageUrl || '',
          target1: initialData.target1,
          target2: initialData.target2,
          stoploss: initialData.stoploss,
          allocation: initialData.allocation,
          notes: initialData.notes || '',
        }
      : {
          allocation: '',
        },
  });

  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (initialData) {
      reset({
        stockName: initialData.stockName,
        currentPrice: initialData.currentPrice,
        recommendedPrice: initialData.recommendedPrice,
        imageUrl: initialData.imageUrl || '',
        target1: initialData.target1,
        target2: initialData.target2,
        stoploss: initialData.stoploss,
        allocation: initialData.allocation,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        allocation: '',
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      stockName: data.stockName,
      currentPrice: data.currentPrice,
      recommendedPrice: data.recommendedPrice,
      imageUrl: data.imageUrl || undefined,
      target1: data.target1,
      target2: data.target2,
      stoploss: data.stoploss,
      allocation: data.allocation,
      notes: data.notes || undefined,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {mode === 'add' ? 'Add Swing Recommendation' : 'Edit Swing Recommendation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 mt-4">
          {/* Stock Name */}
          <div className="space-y-2">
            <Label htmlFor="stockName">Stock Name</Label>
            <Input
              id="stockName"
              placeholder="e.g., RELIANCE"
              className="bg-input border-border"
              {...register('stockName')}
            />
            {errors.stockName && (
              <p className="text-xs text-loss">{errors.stockName.message}</p>
            )}
          </div>

          {/* Current Price */}
          <div className="space-y-2">
            <Label htmlFor="currentPrice">Current Price (₹)</Label>
            <Input
              id="currentPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="bg-input border-border font-mono"
              {...register('currentPrice', { valueAsNumber: true })}
            />
            {errors.currentPrice && (
              <p className="text-xs text-loss">{errors.currentPrice.message}</p>
            )}
          </div>

          {/* Recommended Price */}
          <div className="space-y-2">
            <Label htmlFor="recommendedPrice">Recommended Price (₹)</Label>
            <Input
              id="recommendedPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="bg-input border-border font-mono"
              {...register('recommendedPrice', { valueAsNumber: true })}
            />
            {errors.recommendedPrice && (
              <p className="text-xs text-loss">{errors.recommendedPrice.message}</p>
            )}
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Chart/Analysis Image (Optional)
            </Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/chart.png"
              className="bg-input border-border"
              {...register('imageUrl')}
            />
            {errors.imageUrl && (
              <p className="text-xs text-loss">{errors.imageUrl.message}</p>
            )}
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border">
                <img 
                  src={imageUrl} 
                  alt="Chart preview" 
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Targets */}
          <div className="space-y-3">
            <Label className="text-profit">Targets</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Target 1"
                  className="bg-input border-border font-mono text-sm"
                  {...register('target1', { valueAsNumber: true })}
                />
                {errors.target1 && (
                  <p className="text-[10px] text-loss">{errors.target1.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Target 2"
                  className="bg-input border-border font-mono text-sm"
                  {...register('target2', { valueAsNumber: true })}
                />
                {errors.target2 && (
                  <p className="text-[10px] text-loss">{errors.target2.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stoploss */}
          <div className="space-y-2">
            <Label htmlFor="stoploss" className="text-loss">Stoploss (₹)</Label>
            <Input
              id="stoploss"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="bg-input border-loss/30 font-mono"
              {...register('stoploss', { valueAsNumber: true })}
            />
            {errors.stoploss && (
              <p className="text-xs text-loss">{errors.stoploss.message}</p>
            )}
          </div>

          {/* Allocation */}
          <div className="space-y-2">
            <Label htmlFor="allocation">Allocation</Label>
            <Input
              id="allocation"
              placeholder="e.g., 10% or ₹50,000"
              className="bg-input border-border"
              {...register('allocation')}
            />
            {errors.allocation && (
              <p className="text-xs text-loss">{errors.allocation.message}</p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add analysis notes, reasons for recommendation..."
              className="bg-input border-border min-h-[80px]"
              {...register('notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              disabled={isSubmitting}
            >
              {mode === 'add' ? 'Add Recommendation' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
