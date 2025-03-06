import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAttendeeSchema, userTypes, startupStages, challenges, industries, eventFormats } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const questions = [
  {
    id: "userType",
    title: "Who are you?",
    options: userTypes.map(type => ({
      value: type,
      label: type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }))
  },
  {
    id: "startupStage",
    title: "What's your startup stage?",
    options: startupStages.map(stage => ({
      value: stage,
      label: stage.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    })),
    showFor: ["founder"]
  },
  {
    id: "challenge",
    title: "What's your biggest challenge right now?",
    options: challenges.map(challenge => ({
      value: challenge,
      label: challenge.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    })),
    showFor: ["founder"]
  },
  {
    id: "industry",
    title: "Industry focus?",
    options: industries.map(industry => ({
      value: industry,
      label: industry.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }))
  },
  {
    id: "preferredFormat",
    title: "Preferred networking format?",
    options: eventFormats.map(format => ({
      value: format,
      label: format.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }))
  }
];

export function QuizFlow() {
  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertAttendeeSchema),
    defaultValues: {
      name: "",
      email: "",
      userType: undefined,
      responses: {
        startupStage: undefined,
        challenge: undefined,
        industry: undefined,
        preferredFormat: undefined
      }
    }
  });

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setLocation("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, setLocation]);

  const currentUserType = form.watch("userType");
  const filteredQuestions = questions.filter(q => 
    !q.showFor || q.showFor.includes(currentUserType)
  );

  const currentQuestion = filteredQuestions[step];

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("POST", "/api/attendees", data);
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "You've been registered for the event"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your responses",
        variant: "destructive"
      });
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Thank you for registering!</h2>
          <p className="text-muted-foreground">Enjoy the event! We'll find the perfect matches for you.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-lg mx-auto">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">{currentQuestion.title}</h2>

                <FormField
                  control={form.control}
                  name={currentQuestion.id === "userType" ? "userType" : `responses.${currentQuestion.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-4"
                        >
                          {currentQuestion.options.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <FormLabel htmlFor={option.value}>{option.label}</FormLabel>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between mt-8">
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(s => s - 1)}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    type={step === filteredQuestions.length - 1 ? "submit" : "button"}
                    onClick={() => {
                      if (step < filteredQuestions.length - 1) {
                        setStep(s => s + 1);
                      }
                    }}
                    className="ml-auto"
                  >
                    {step === filteredQuestions.length - 1 ? "Submit" : "Continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </form>
    </Form>
  );
}