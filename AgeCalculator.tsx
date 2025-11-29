import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInYears, differenceInMonths, differenceInDays, subYears, subMonths, addMonths, isValid, isSameDay } from "date-fns";
import { CalendarIcon, Sparkles, Cake, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  dob: z.date({
    required_error: "A date of birth is required.",
  }).max(new Date(), { message: "Date of birth cannot be in the future." }),
});

interface AgeResult {
  years: number;
  months: number;
  days: number;
  nextBirthday: {
    months: number;
    days: number;
    isToday: boolean;
  };
}

export function AgeCalculator() {
  const [result, setResult] = useState<AgeResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const today = new Date();
    // Reset time part for accurate day calculations
    today.setHours(0, 0, 0, 0);
    
    const dob = values.dob;
    // Reset time part
    dob.setHours(0, 0, 0, 0);

    // Calculate Age
    const years = differenceInYears(today, dob);
    const dateAfterYears = subYears(today, years);
    
    const months = differenceInMonths(dateAfterYears, dob);
    const dateAfterMonths = subMonths(dateAfterYears, months);
    
    const days = differenceInDays(dateAfterMonths, dob);

    // Calculate Next Birthday
    const currentYear = today.getFullYear();
    let nextBirthdayDate = new Date(currentYear, dob.getMonth(), dob.getDate());
    
    // Check if birthday has passed this year
    if (nextBirthdayDate < today) {
      nextBirthdayDate = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
    }
    
    const isToday = isSameDay(today, nextBirthdayDate);
    
    const monthsUntil = differenceInMonths(nextBirthdayDate, today);
    const dateAfterMonthsUntil = addMonths(today, monthsUntil);
    const daysUntil = differenceInDays(nextBirthdayDate, dateAfterMonthsUntil);

    setResult({ 
      years, 
      months, 
      days,
      nextBirthday: {
        months: monthsUntil,
        days: daysUntil,
        isToday
      }
    });
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-card border-0 shadow-2xl overflow-hidden relative">
        {/* Decorative background blob inside card */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-display text-slate-900">Age Calculator</CardTitle>
          <CardDescription className="text-base text-slate-500">
            Enter your birth date to reveal your exact age.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium text-slate-700 ml-1">Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-14 w-full pl-4 text-left font-normal rounded-xl border-slate-200 bg-slate-50 hover:bg-white hover:border-primary/50 transition-all duration-300 shadow-sm",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-date-picker"
                          >
                            {field.value ? (
                              <span className="text-lg font-medium text-slate-900">
                                {format(field.value, "PPP")}
                              </span>
                            ) : (
                              <span className="text-base text-slate-400">Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            // Auto submit on date select for smoother experience
                            if (date) form.handleSubmit(onSubmit)();
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          className="rounded-xl border-0 shadow-xl"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mt-8 space-y-6"
              >
                <div className="grid grid-cols-3 gap-4">
                  <ResultBox label="Years" value={result.years} delay={0} />
                  <ResultBox label="Months" value={result.months} delay={0.1} />
                  <ResultBox label="Days" value={result.days} delay={0.2} />
                </div>

                <Separator className="bg-slate-100" />

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="bg-gradient-to-br from-primary/5 to-purple-50 rounded-2xl p-5 border border-primary/10 relative overflow-hidden"
                >
                   {/* Confetti decoration */}
                   <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-200/40 to-transparent rounded-bl-full -mr-4 -mt-4" />

                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                      {result.nextBirthday.isToday ? <PartyPopper className="w-5 h-5" /> : <Cake className="w-5 h-5" />}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                      {result.nextBirthday.isToday ? "It's your Birthday!" : "Next Birthday"}
                    </h3>
                  </div>

                  <div className="relative z-10">
                    {result.nextBirthday.isToday ? (
                      <div className="text-2xl font-bold text-primary font-display animate-pulse">
                        Happy Birthday! 🎉
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900 font-display">
                          {result.nextBirthday.months} <span className="text-sm font-normal text-slate-500 ml-1 mr-2">Months</span>
                          {result.nextBirthday.days} <span className="text-sm font-normal text-slate-500 ml-1">Days</span>
                        </span>
                      </div>
                    )}
                    {!result.nextBirthday.isToday && (
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        Until your special day
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultBox({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="text-3xl md:text-4xl font-bold text-primary font-display" data-testid={`text-${label.toLowerCase()}`}>
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mt-1">
        {label}
      </span>
    </motion.div>
  );
}
