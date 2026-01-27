import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { IntradayRecommendation, TradeSide } from '@/types/recommendation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const recommendationSchema = z.object({
  stockName: z.string().min(1, 'Stock name is required').max(50),
  currentPrice: z.number().positive('Current price must be positive'),
  tradeSide: z.enum(['BUY', 'SELL']),
  recommendedPrice: z.number().positive('Recommended price must be positive'),
  target1: z.number().positive('Target 1 must be positive'),
  target2: z.number().positive('Target 2 must be positive'),
  target3: z.number().positive('Target 3 must be positive'),
  stoploss: z.number().positive('Stoploss must be positive'),
});

type FormData = z.infer<typeof recommendationSchema>;

interface RecommendationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<IntradayRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: IntradayRecommendation;
  mode?: 'add' | 'edit';
}

export function RecommendationForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = 'add',
}: RecommendationFormProps) {
  const [tradeSide, setTradeSide] = useState<TradeSide>(initialData?.tradeSide || 'BUY');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: initialData
      ? {
          stockName: initialData.stockName,
          currentPrice: initialData.currentPrice,
          tradeSide: initialData.tradeSide,
          recommendedPrice: initialData.recommendedPrice,
          target1: initialData.target1,
          target2: initialData.target2,
          target3: initialData.target3,
          stoploss: initialData.stoploss,
        }
      : {
          tradeSide: 'BUY',
        },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        stockName: initialData.stockName,
        currentPrice: initialData.currentPrice,
        tradeSide: initialData.tradeSide,
        recommendedPrice: initialData.recommendedPrice,
        target1: initialData.target1,
        target2: initialData.target2,
        target3: initialData.target3,
        stoploss: initialData.stoploss,
      });
      setTradeSide(initialData.tradeSide);
    } else {
      reset({
        tradeSide: 'BUY',
      });
      setTradeSide('BUY');
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      stockName: data.stockName,
      currentPrice: data.currentPrice,
      tradeSide,
      recommendedPrice: data.recommendedPrice,
      target1: data.target1,
      target2: data.target2,
      target3: data.target3,
      stoploss: data.stoploss,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {mode === 'add' ? 'Add Intraday Recommendation' : 'Edit Recommendation'}
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

          {/* Trade Side */}
          <div className="space-y-2">
            <Label>Trade Side</Label>
            <Select
              value={tradeSide}
              onValueChange={(value: TradeSide) => {
                setTradeSide(value);
                setValue('tradeSide', value);
              }}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select side" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-profit" />
                    BUY
                  </span>
                </SelectItem>
                <SelectItem value="SELL">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-loss" />
                    SELL
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Inputs Grid */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Targets */}
          <div className="space-y-3">
            <Label className="text-profit">Targets</Label>
            <div className="grid grid-cols-3 gap-3">
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
              <div className="space-y-1">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Target 3"
                  className="bg-input border-border font-mono text-sm"
                  {...register('target3', { valueAsNumber: true })}
                />
                {errors.target3 && (
                  <p className="text-[10px] text-loss">{errors.target3.message}</p>
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
